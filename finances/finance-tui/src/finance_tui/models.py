from dataclasses import dataclass
from typing import Dict, Any
import datetime


@dataclass
class FinancialRecord:
    date: str  # YYYY-MM-DD format
    category: str
    description: str
    value: float
    source: str
    metadata: Dict[str, Any]

    def __post_init__(self):
        # Validate date format
        try:
            datetime.datetime.strptime(self.date, "%Y-%m-%d")
        except ValueError:
            raise ValueError(f"Invalid date format: {self.date}. Expected YYYY-MM-DD")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "date": self.date,
            "category": self.category,
            "description": self.description,
            "value": self.value,
            "source": self.source,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "FinancialRecord":
        return cls(
            date=data["date"],
            category=data["category"],
            description=data["description"],
            value=data["value"],
            source=data["source"],
            metadata=data.get("metadata", {}),
        )
