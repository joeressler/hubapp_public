from mysql.connector import MySQLConnection
import os
from dotenv import load_dotenv, find_dotenv
import mysql.connector

load_dotenv(find_dotenv('.env'))


class VConnection(object):
    def __init__(self, connection_params=None):
        self.connection_params = connection_params
        self.connection = None

    def __enter__(self):
        try:
            self.connection = MySQLConnection(
                user=os.getenv('MYSQL_USER'), 
                password=os.getenv('MYSQL_PWD'),
                host=os.getenv('MYSQL_HOST'),
                database=os.getenv('MYSQL_DATABASE')
            )
            return self.connection
        except mysql.connector.Error as err:
            print(f"Connection error: {err}")
            raise

    def __exit__(self, type, value, tb):
        if self.connection:
            self.connection.close()


class VCursor(object):
    def __init__(self, connection):
        self.connection = connection
        self.cursor = None

    def __enter__(self):
        self.cursor = self.connection.cursor()
        # timezone_sql = "SET TIMEZONE TO 'UTC'"
        # self.cursor.execute(timezone_sql)
        return self.cursor

    def __exit__(self, type, value, tb):
        if self.cursor:
            self.cursor.close()

    @staticmethod
    def get_rows_as_json(cursor):
        columns = cursor.description
        results = []
        rows = cursor.fetchall()
        for row in rows:
            obj = {}
            col_num = 0
            for col in columns:
                data = row[col_num]
                obj[col[0]] = data
                col_num += 1
            results.append(obj)
        return results

    @staticmethod
    def get_row_as_json(cursor):
        columns = cursor.description
        row = cursor.fetchone()
        obj = None
        if row:
            obj = {}
            col_num = 0
            for col in columns:
                data = row[col_num]
                obj[col[0]] = data
                col_num += 1
        return obj
