from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

class DatabaseInterface(ABC):
    @abstractmethod
    def connect(self) -> Any:
        """Establish a connection to the database"""
        pass

    @abstractmethod
    def disconnect(self, connection: Any) -> None:
        """Close the database connection"""
        pass

    @abstractmethod
    def execute_query(self, connection: Any, query: str, params: tuple = None) -> Any:
        """Execute a query and return the cursor"""
        pass

    @abstractmethod
    def fetch_one(self, cursor: Any) -> Optional[Dict[str, Any]]:
        """Fetch one row from the cursor as a dictionary"""
        pass

    @abstractmethod
    def fetch_all(self, cursor: Any) -> List[Dict[str, Any]]:
        """Fetch all rows from the cursor as a list of dictionaries"""
        pass

    @abstractmethod
    def commit(self, connection: Any) -> None:
        """Commit the current transaction"""
        pass

class DatabaseConnectionManager:
    def __init__(self, db_interface: DatabaseInterface):
        self.db_interface = db_interface
        self.connection = None
        self.cursor = None

    def __enter__(self):
        self.connection = self.db_interface.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.db_interface.disconnect(self.connection)

    def execute(self, query: str, params: tuple = None) -> Any:
        self.cursor = self.db_interface.execute_query(self.connection, query, params)
        return self.cursor

    def fetch_one(self) -> Optional[Dict[str, Any]]:
        return self.db_interface.fetch_one(self.cursor)

    def fetch_all(self) -> List[Dict[str, Any]]:
        return self.db_interface.fetch_all(self.cursor)

    def commit(self) -> None:
        self.db_interface.commit(self.connection) 