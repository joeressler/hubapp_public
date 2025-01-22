from typing import Dict, Type
from .db_interface import DatabaseInterface
from .mysql_db import MySQLDatabase

class DatabaseFactory:
    _implementations: Dict[str, Type[DatabaseInterface]] = {
        'mysql': MySQLDatabase
    }

    @classmethod
    def register_implementation(cls, name: str, implementation: Type[DatabaseInterface]) -> None:
        """Register a new database implementation"""
        cls._implementations[name] = implementation

    @classmethod
    def get_implementation(cls, name: str) -> DatabaseInterface:
        """Get a database implementation by name"""
        if name not in cls._implementations:
            raise ValueError(f"Unknown database implementation: {name}")
        return cls._implementations[name]() 