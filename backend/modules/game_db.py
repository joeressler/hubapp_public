from utils.db_factory import DatabaseFactory
from utils.db_interface import DatabaseConnectionManager


class GameDB:

    @staticmethod
    def _get_db():
        return DatabaseFactory.get_implementation('mysql')

    @staticmethod
    def add_game_rating(game_id, rating, fullclear, user_id, update=False):
        db = GameDB._get_db()
        with DatabaseConnectionManager(db) as manager:
            if not update:
                sql = "INSERT INTO gameratings (game_id, score, fullclear, user_id) VALUES (%s, %s, %s, %s)"
                manager.execute(sql, (game_id, rating, fullclear, user_id))
            else:
                sql = """UPDATE gameratings
                         SET score = %s, fullclear = %s
                         WHERE user_id = %s AND game_id = %s"""
                manager.execute(sql, (rating, fullclear, user_id, game_id))
            manager.commit()

    @staticmethod
    def listgames(game_id = None, user_id = None):
        try:
            db = GameDB._get_db()
            with DatabaseConnectionManager(db) as manager:
                if user_id:
                    sql = """select g.id, g.name, gr.score, gr.fullclear, gd.name AS developer, g.developer_id,
                            ROUND(AVG(gr.score), 1) AS avg_score, COUNT(CASE WHEN gr.fullclear = 1 THEN 1 ELSE NULL END) AS fullclear_count,
                            COUNT(distinct gr.score) AS rating_count
                            FROM gamedb.games g
                            INNER JOIN gamedb.gamedevs gd ON g.developer_id = gd.id
                            LEFT OUTER JOIN gamedb.gameratings gr ON g.id = gr.game_id
                            WHERE gr.user_id = %s
                            GROUP BY
                            g.id, g.name, gd.name, g.developer_id
                            ORDER BY g.name"""
                    user_id = int(user_id)
                    manager.execute(sql, (user_id,))
                elif game_id:
                    sql = """select g.id, g.name, gr.score, gr.fullclear, gd.name AS developer, g.developer_id,
                            ROUND(AVG(gr.score), 1) AS avg_score, COUNT(CASE WHEN gr.fullclear = 1 THEN 1 ELSE NULL END) AS fullclear_count,
                            COUNT(distinct gr.score) AS rating_count
                            FROM gamedb.games g
                            INNER JOIN gamedb.gamedevs gd ON g.developer_id = gd.id
                            LEFT OUTER JOIN gamedb.gameratings gr ON g.id = gr.game_id
                            WHERE g.id = %s
                            GROUP BY
                            g.id, g.name, gd.name, g.developer_id
                            ORDER BY g.name"""
                    game_id = int(game_id)
                    manager.execute(sql, (game_id,))
                else:
                    sql = """select g.id, g.name, gr.score, gr.fullclear, gd.name AS developer, g.developer_id,
                            ROUND(AVG(gr.score), 1) AS avg_score, COUNT(CASE WHEN gr.fullclear = 1 THEN 1 ELSE NULL END) AS fullclear_count,
                            COUNT(distinct gr.score) AS rating_count
                            FROM gamedb.games g
                            INNER JOIN gamedb.gamedevs gd ON g.developer_id = gd.id
                            LEFT OUTER JOIN gamedb.gameratings gr ON g.id = gr.game_id
                            GROUP BY
                            g.id, g.name, gd.name, g.developer_id
                            ORDER BY g.name"""
                    manager.execute(sql)
                return manager.fetch_all()
        except Exception as e:
            print(f"Database error in listgames: {str(e)}")
            raise Exception(f"Failed to fetch games: {str(e)}")

    @staticmethod
    def lookupgame(game_name):
        db = GameDB._get_db()
        with DatabaseConnectionManager(db) as manager:
            sql = "SELECT * FROM gamedb.games WHERE name = %s"
            manager.execute(sql, (game_name,))
            return manager.fetch_one()

    @staticmethod
    def lookup_user_rating(game_id, user_id):
        db = GameDB._get_db()
        with DatabaseConnectionManager(db) as manager:
            sql = "SELECT * FROM gamedb.gameratings WHERE game_id = %s AND user_id = %s"
            manager.execute(sql, (game_id, user_id))
            return manager.fetch_one()

    @staticmethod
    def lookupdev(game_dev, create=False):
        db = GameDB._get_db()
        with DatabaseConnectionManager(db) as manager:
            sql = "SELECT * FROM gamedevs WHERE name = %s"
            manager.execute(sql, (game_dev,))
            row = manager.fetch_one()
            if create and row is None:
                sqladd = "INSERT INTO gamedevs (name) VALUES (%s)"
                manager.execute(sqladd, (game_dev,))
                manager.commit()
                manager.execute(sql, (game_dev,))
                row = manager.fetch_one()
            return row
