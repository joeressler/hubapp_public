from utils.db_factory import DatabaseFactory
from utils.db_interface import DatabaseConnectionManager

class UserDB:
    @staticmethod
    def _get_db():
        return DatabaseFactory.get_implementation('mysql')

    @staticmethod
    def add_user(username, password_hash):
        db = UserDB._get_db()
        with DatabaseConnectionManager(db) as manager:
            sql = "INSERT INTO users (username, password_hash) VALUES (%s, %s)"
            manager.execute(sql, (username, password_hash))
            manager.commit()

    @staticmethod
    def get_user(username):
        db = UserDB._get_db()
        with DatabaseConnectionManager(db) as manager:
            sql = "SELECT * FROM users WHERE username = %s"
            manager.execute(sql, (username,))
            return manager.fetch_one()

    @staticmethod
    def get_user_by_id(user_id):
        db = UserDB._get_db()
        with DatabaseConnectionManager(db) as manager:
            sql = "SELECT * FROM users WHERE id = %s"
            manager.execute(sql, (user_id,))
            return manager.fetch_one()

    @staticmethod
    def update_user(user_id, username=None, password_hash=None):
        db = UserDB._get_db()
        with DatabaseConnectionManager(db) as manager:
            if username and password_hash:
                sql = "UPDATE users SET username = %s, password_hash = %s WHERE id = %s"
                manager.execute(sql, (username, password_hash, user_id))
            elif username:
                sql = "UPDATE users SET username = %s WHERE id = %s"
                manager.execute(sql, (username, user_id))
            elif password_hash:
                sql = "UPDATE users SET password_hash = %s WHERE id = %s"
                manager.execute(sql, (password_hash, user_id))
            manager.commit()

    @staticmethod
    def delete_user(user_id):
        db = UserDB._get_db()
        with DatabaseConnectionManager(db) as manager:
            sql = "DELETE FROM users WHERE id = %s"
            manager.execute(sql, (user_id,))
            manager.commit() 