import mysql
from utils.vconnection import VConnection, VCursor


class GameDB:

    @staticmethod
    def add_game_rating(game_id, rating, fullclear, user_id, update=False):
        with VConnection() as connection, VCursor(connection) as cursor:
            if not update:
                sql = "INSERT INTO gameratings (game_id, score, fullclear, user_id) VALUES (%s, %s, %s, %s)"
                cursor.execute(sql, (game_id, rating, fullclear, user_id))
            else:
                sql = """UPDATE gameratings
                         SET score = %s, fullclear = %s
                         WHERE user_id = %s AND game_id = %s"""
                cursor.execute(sql, (rating, fullclear, user_id, game_id))
            connection.commit()

    @staticmethod
    def listgames(game_id = None, user_id = None):
        try:
            with VConnection() as connection, VCursor(connection) as cursor:
                # STEP 1 - truncate staging table
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
                    cursor.execute(sql, (user_id,))
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
                    cursor.execute(sql, (game_id,))
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
                    cursor.execute(sql)
                rows = VCursor.get_rows_as_json(cursor)
                return rows
        except Exception as e:
            print(f"Database error in listgames: {str(e)}")  # Add logging
            raise Exception(f"Failed to fetch games: {str(e)}")

    @staticmethod
    def lookupgame(game_name):
        with VConnection() as connection, VCursor(connection) as cursor:
            sql = "SELECT * FROM gamedb.games WHERE name = %s"
            print(sql)
            cursor.execute(sql, (game_name,))
            row = VCursor.get_row_as_json(cursor)
            return row

    @staticmethod
    def lookup_user_rating(game_id, user_id):
        with VConnection() as connection, VCursor(connection) as cursor:
            sql = "SELECT * FROM gamedb.gameratings WHERE game_id = %s AND user_id = %s"
            cursor.execute(sql, (game_id, user_id))
            row = VCursor.get_row_as_json(cursor)
            return row


    @staticmethod
    def lookupdev(game_dev, create=False):
        with VConnection() as connection, VCursor(connection) as cursor:
            sql = "SELECT * FROM gamedevs WHERE name = %s"
            cursor.execute(sql, (game_dev,))
            row = VCursor.get_row_as_json(cursor)
            if create and row is None:
                sqladd = "INSERT INTO gamedevs (name) VALUES (%s)"
                print(sqladd)
                cursor.execute(sqladd, (game_dev,))
                connection.commit()
                print(sql)
                cursor.execute(sql, (game_dev,))
                row = VCursor.get_row_as_json(cursor)
            return row
