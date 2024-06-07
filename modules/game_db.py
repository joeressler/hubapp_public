import mysql

from utils import vconnection
from utils.vconnection import *


class GameDB:

    @staticmethod
    def add_game_rating(game_id, rating, fullclear, user_id, update=False):
        with VConnection() as connection, VCursor(connection) as cursor:
            if not update:
                sql = f"INSERT INTO gameratings (game_id, score, fullclear, user_id) VALUES ({game_id}, {rating}, {fullclear}, {user_id})"
            else:
                sql = f"""UPDATE gameratings
                         SET score = {rating}
                         WHERE user_id = {user_id} AND game_id = {game_id}"""
            cursor.execute(sql)
            connection.commit()

    @staticmethod
    def listgames(game_id = None):
        with VConnection() as connection, VCursor(connection) as cursor:
            # STEP 1 - truncate staging table

            sql = """select g.id, g.name, gr.score, gr.fullclear, gd.name AS developer, g.developer_id from gamedb.games g
                        INNER JOIN gamedb.gamedevs gd ON g.developer_id = gd.id
                        LEFT OUTER JOIN gamedb.gameratings gr ON g.id = gr.game_id AND gr.user_id = 1 """
            if game_id:
                sql += f"WHERE g.id = {game_id}"
            cursor.execute(sql)
            rows = VCursor.get_rows_as_json(cursor)
            return rows

    @staticmethod
    def lookupgame(game_name):
        with VConnection() as connection, VCursor(connection) as cursor:
            sql = "SELECT * FROM gamedb.games WHERE name = %s"
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
                cursor.execute(sqladd, (game_dev,))
                connection.commit()
                cursor.execute(sql, (game_dev,))
                row = VCursor.get_row_as_json(cursor)
            return row
