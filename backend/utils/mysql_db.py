import os
from typing import Any, Dict, List, Optional
from mysql.connector import MySQLConnection
import mysql.connector
from dotenv import load_dotenv, find_dotenv
from .db_interface import DatabaseInterface

load_dotenv(find_dotenv('.env'))

class MySQLDatabase(DatabaseInterface):
    def connect(self) -> MySQLConnection:
        try:
            connection = MySQLConnection(
                user=os.getenv('MYSQL_USER'),
                password=os.getenv('MYSQL_PWD'),
                host=os.getenv('MYSQL_HOST'),
                database=os.getenv('MYSQL_DATABASE')
            )
            return connection
        except mysql.connector.Error as err:
            print(f"Connection error details:")
            print(f"  Error code: {err.errno}")
            print(f"  Error message: {err.msg}")
            print(f"  SQL State: {err.sqlstate}")
            print(f"  Host: {os.getenv('MYSQL_HOST')}")
            print(f"  Database: {os.getenv('MYSQL_DATABASE')}")
            print(f"  User: {os.getenv('MYSQL_USER')}")
            raise

    def disconnect(self, connection: MySQLConnection) -> None:
        if connection:
            connection.close()

    def execute_query(self, connection: MySQLConnection, query: str, params: tuple = None) -> Any:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params or ())
        return cursor

    def fetch_one(self, cursor: Any) -> Optional[Dict[str, Any]]:
        row = cursor.fetchone()
        return row

    def fetch_all(self, cursor: Any) -> List[Dict[str, Any]]:
        rows = cursor.fetchall()
        return rows

    def commit(self, connection: MySQLConnection) -> None:
        connection.commit() 