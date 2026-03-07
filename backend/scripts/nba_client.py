import json
import sys
from datetime import datetime


def output(payload):
    print(json.dumps(payload))


def current_season_string():
        now = datetime.utcnow()
        start_year = now.year if now.month >= 10 else now.year - 1
        return f"{start_year}-{str(start_year + 1)[-2:]}"


def to_scoreboard_date(value):
        if not value:
            return datetime.utcnow().strftime("%Y-%m-%d")

        try:
            parsed = datetime.strptime(value, "%Y-%m-%d")
            return parsed.strftime("%Y-%m-%d")
        except ValueError:
            return value


def get_team_stats_map(season):
        from nba_api.stats.endpoints import leaguedashteamstats
        from nba_api.stats.static import teams

        stats_rows = leaguedashteamstats.LeagueDashTeamStats(
                season=season,
                per_mode_detailed="PerGame",
        ).get_normalized_dict()["LeagueDashTeamStats"]

        teams_by_id = {str(team["id"]): team for team in teams.get_teams()}
        mapped = {}

        for row in stats_rows:
            team_id = str(row["TEAM_ID"])
            static_team = teams_by_id.get(team_id, {})
            points_per_game = float(row.get("PTS", 0))
            plus_minus = float(row.get("PLUS_MINUS", 0))
            opp_points_per_game = points_per_game - plus_minus

            mapped[team_id] = {
                    "id": team_id,
                    "abbreviation": static_team.get("abbreviation", ""),
                    "fullName": static_team.get("full_name", row.get("TEAM_NAME", "")),
                    "winPct": float(row.get("W_PCT", 0)),
                    "pointsPerGame": round(points_per_game, 1),
                    "oppPointsPerGame": round(opp_points_per_game, 1),
                    "plusMinus": round(plus_minus, 1),
            }

        return mapped


def get_player_per_game_map(season):
        from nba_api.stats.endpoints import leaguedashplayerstats

        rows = leaguedashplayerstats.LeagueDashPlayerStats(
                season=season,
                per_mode_detailed="PerGame",
        ).get_normalized_dict()["LeagueDashPlayerStats"]

        mapped = {}
        for row in rows:
            player_id = str(row["PLAYER_ID"])
            mapped[player_id] = {
                    "ppg": float(row.get("PTS", 0)),
                    "rpg": float(row.get("REB", 0)),
                    "apg": float(row.get("AST", 0)),
            }
        return mapped


def run_scoreboard(params):
        from nba_api.stats.endpoints import scoreboardv3

        game_date = to_scoreboard_date(params.get("date"))
        board = scoreboardv3.ScoreboardV3(game_date=game_date).get_dict()
        games = board.get("scoreboard", {}).get("games", [])
        return {"games": games}


def run_game(params):
    from nba_api.live.nba.endpoints import boxscore

    game_id = str(params.get("gameId"))
    box = boxscore.BoxScore(game_id=game_id)
    data = box.get_dict()
    return {"game": data.get("game", data)}


def run_players(_params):
        from nba_api.stats.endpoints import commonallplayers

        season = current_season_string()
        active_players = commonallplayers.CommonAllPlayers(
                is_only_current_season=1,
                season=season,
        ).get_normalized_dict()["CommonAllPlayers"]

        stats_map = get_player_per_game_map(season)
        players = []

        for player in active_players:
            if int(player.get("ROSTERSTATUS", 0)) != 1:
                continue
            if int(player.get("TEAM_ID", 0)) == 0:
                continue

            player_id = str(player.get("PERSON_ID"))
            stats = stats_map.get(player_id, {"ppg": 0.0, "rpg": 0.0, "apg": 0.0})

            players.append(
                {
                    "id": player_id,
                    "fullName": player.get("DISPLAY_FIRST_LAST", ""),
                    "ppg": round(float(stats["ppg"]), 1),
                    "rpg": round(float(stats["rpg"]), 1),
                    "apg": round(float(stats["apg"]), 1),
                }
            )

        return {"players": players}


def run_teams(_params):
    season = current_season_string()
    team_stats_map = get_team_stats_map(season)
    teams = list(team_stats_map.values())
    teams.sort(key=lambda item: item["fullName"])
    return {"teams": teams}


def run_player(params):
    from nba_api.stats.endpoints import commonplayerinfo

    player_id = str(params.get("playerId"))
    season = current_season_string()
    stats_map = get_player_per_game_map(season)

    profile = commonplayerinfo.CommonPlayerInfo(player_id=player_id).get_dict()
    row_set = profile.get("resultSets", [{}])[0].get("rowSet", [])
    headers = profile.get("resultSets", [{}])[0].get("headers", [])

    full_name = f"Player {player_id}"
    if row_set and headers:
        mapped = dict(zip(headers, row_set[0]))
        full_name = mapped.get("DISPLAY_FIRST_LAST", full_name)

    averages = stats_map.get(player_id, {"ppg": 0.0, "rpg": 0.0, "apg": 0.0})

    return {
        "fullName": full_name,
        "seasonAverages": {
            "ppg": round(float(averages.get("ppg", 0.0)), 1),
            "rpg": round(float(averages.get("rpg", 0.0)), 1),
            "apg": round(float(averages.get("apg", 0.0)), 1),
        },
    }


def run_team(params):
    team_id = str(params.get("teamId"))
    season = current_season_string()
    team_stats_map = get_team_stats_map(season)
    team = team_stats_map.get(team_id)

    if not team:
      return {
          "id": team_id,
          "fullName": f"Team {team_id}",
          "abbreviation": "NBA",
          "winPct": 0.0,
          "pointsPerGame": 0.0,
          "oppPointsPerGame": 0.0,
          "plusMinus": 0.0,
      }

    return team


def run_team_stats(_params):
    season = current_season_string()
    return {"teams": list(get_team_stats_map(season).values())}


def main():
    if len(sys.argv) < 2:
        output({"success": False, "error": "Missing action"})
        return

    action = sys.argv[1]
    params = {}
    if len(sys.argv) > 2:
        try:
            params = json.loads(sys.argv[2])
        except json.JSONDecodeError:
            params = {}

    try:
        if action == "scoreboard":
            data = run_scoreboard(params)
        elif action == "game":
            data = run_game(params)
        elif action == "players":
            data = run_players(params)
        elif action == "teams":
            data = run_teams(params)
        elif action == "player":
            data = run_player(params)
        elif action == "team":
            data = run_team(params)
        elif action == "team_stats":
            data = run_team_stats(params)
        else:
            output({"success": False, "error": f"Unknown action: {action}"})
            return

        output({"success": True, "data": data})
    except ModuleNotFoundError as error:
        output(
            {
                "success": False,
                "error": f"Missing Python package: {error}. Install with: pip install nba_api pandas requests",
            }
        )
    except Exception as error:
        output({"success": False, "error": str(error)})


if __name__ == "__main__":
    main()
