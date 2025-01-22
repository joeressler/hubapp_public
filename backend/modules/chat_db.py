from utils.db_factory import DatabaseFactory
from utils.db_interface import DatabaseConnectionManager

class ChatDB:
    @staticmethod
    def _get_db():
        return DatabaseFactory.get_implementation('mysql')

    @staticmethod
    def add_chat_message(user_id, message, response, game_id=None):
        db = ChatDB._get_db()
        with DatabaseConnectionManager(db) as manager:
            sql = """INSERT INTO chat_history 
                     (user_id, message, response, game_id, timestamp) 
                     VALUES (%s, %s, %s, %s, NOW())"""
            manager.execute(sql, (user_id, message, response, game_id))
            manager.commit()

    @staticmethod
    def get_chat_history(user_id, game_id=None, limit=10):
        db = ChatDB._get_db()
        with DatabaseConnectionManager(db) as manager:
            if game_id:
                sql = """SELECT * FROM chat_history 
                         WHERE user_id = %s AND game_id = %s 
                         ORDER BY timestamp DESC LIMIT %s"""
                manager.execute(sql, (user_id, game_id, limit))
            else:
                sql = """SELECT * FROM chat_history 
                         WHERE user_id = %s 
                         ORDER BY timestamp DESC LIMIT %s"""
                manager.execute(sql, (user_id, limit))
            return manager.fetch_all()

    @staticmethod
    def clear_chat_history(user_id, game_id=None):
        db = ChatDB._get_db()
        with DatabaseConnectionManager(db) as manager:
            if game_id:
                sql = "DELETE FROM chat_history WHERE user_id = %s AND game_id = %s"
                manager.execute(sql, (user_id, game_id))
            else:
                sql = "DELETE FROM chat_history WHERE user_id = %s"
                manager.execute(sql, (user_id,))
            manager.commit() 