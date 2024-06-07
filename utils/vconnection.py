import mysql
from mysql.connector import MySQLConnection

import os
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv('.env'))
DATABASE_KEY = os.getenv('DATABASE_KEY')


class VConnection (object):
    def __init__(self, connection_params=None):
        self.connection_params = connection_params
        self.connection = None

    def __enter__(self):
        hostname = 'ls-84718166a323cdf809c46464e4fb7d925cfc5758.c3082ayykn8d.us-east-1.rds.amazonaws.com'
        self.connection = MySQLConnection(user='admin', password=DATABASE_KEY, host=hostname, database='gamedb')
        return self.connection

    def __exit__(self, type, value, tb):
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
