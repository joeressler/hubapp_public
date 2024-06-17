import string
from typing import Optional
import mysql
from utils.vconnection import *
from werkzeug.security import generate_password_hash, check_password_hash
from flask import flash, abort, g

PASSWORD_MIN_LENGTH = 6
PASSWORD_MAX_LENGTH = 20
PASSWORD_VALID_CHARACTERS = string.ascii_letters + string.digits
PASSWORD_SPECIAL_CHARACTERS = "!@#$%^&"


class User:
    def __init__(self, email, user, password):
        self.email = email
        self.username = user
        self.password_hash = generate_password_hash(str(password))



    def __repr__(self):
        return '<User {}>'.format(self.username)

    def changepassword(self, password, pin):
        if pin == int(os.environ.get("PASSWORD_PIN")):
            self.password_hash = generate_password_hash(str(password))

    def save(self):
        with VConnection() as connection, VCursor(connection) as cursor:

            sql = "INSERT INTO user (email, username, password_hash) VALUES (%s, %s, %s)"
            cursor.execute(sql,(self.email, self.username, self.password_hash))
            connection.commit()

    @staticmethod
    def id(username):
        with VConnection() as connection, VCursor(connection) as cursor:

            sql = "SELECT * FROM user WHERE username = %s LIMIT 1"
            cursor.execute(sql,(username,))
            row = VCursor.get_row_as_json(cursor)
            return row['id']

    @staticmethod
    def validate_password(password):
        has_capital_letters = False
        has_special_characters = False
        if len(password) >= PASSWORD_MIN_LENGTH and len(password) <= PASSWORD_MAX_LENGTH:
            for char in password:
                if char.isupper():
                    has_capital_letters = True
                if char in PASSWORD_SPECIAL_CHARACTERS:
                    has_special_characters = True
            if has_capital_letters and has_special_characters:
                return True
            else:
                flash(
                    """
                    Invalid password, make sure you have at least 1 capital letter, 1 special character
                    and a password between % and % characters
                    """%(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH),
                    "warning")
                return False

    @staticmethod
    def authenticate(user, password):
        with VConnection() as connection, VCursor(connection) as cursor:
            sql = "SELECT * FROM user WHERE username = %s LIMIT 2"
            cursor.execute(sql, (user,))
            row = VCursor.get_row_as_json(cursor)
            check = check_password_hash(row['password_hash'], password)
            if row:
                if check:
                    return True
                else:
                    return True
            else:
                return False

    @staticmethod
    def lookup(user):
        with VConnection() as connection, VCursor(connection) as cursor:
            sql = "SELECT * FROM user WHERE username = %s LIMIT 2"
            cursor.execute(sql, (user,))
            row = VCursor.get_row_as_json(cursor)
            if row:
                return True
            else:
                return False

    @staticmethod
    def lookupID(id):
        with VConnection() as connection, VCursor(connection) as cursor:
            sql = f"SELECT * FROM gamedb.user WHERE id = {id} LIMIT 2"
            cursor.execute(sql)
            row = VCursor.get_row_as_json(cursor)
            if row:
                return True
            else:
                return False

    @staticmethod
    def get_user(id):
        with VConnection() as connection, VCursor(connection) as cursor:
            sql = "SELECT * FROM user WHERE id = %s LIMIT 1"
            cursor.execute(sql, (id,))
            row = VCursor.get_row_as_json(cursor)
            if row is None:
                abort(404, f"User {id} not found")
            return row






