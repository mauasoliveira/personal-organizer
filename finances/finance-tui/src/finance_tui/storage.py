import toml
import time
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any
from dataclasses import dataclass


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
            datetime.strptime(self.date, "%Y-%m-%d")
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


class Storage:
    def __init__(self, data_directory: Path):
        self.data_directory = data_directory

    def save_record(self, record: FinancialRecord) -> Path:
        # Create directory structure: data/{source}/{year}/{month}/{day}/
        record_date = datetime.strptime(record.date, "%Y-%m-%d")
        year = record_date.year
        month = record_date.month
        day = record_date.day

        # Create directory path
        dir_path = (
            self.data_directory / record.source / str(year) / str(month) / str(day)
        )
        dir_path.mkdir(parents=True, exist_ok=True)

        # Generate filename with timestamp
        timestamp = int(time.time() * 1000)  # milliseconds for uniqueness
        filename = f"{timestamp}.toml"
        file_path = dir_path / filename

        # Convert record to TOML format
        record_dict = record.to_dict()

        # Add metadata
        record_dict["metadata"] = {
            "created_at": datetime.now().isoformat(),
            "version": "1.0",
        }

        # Save to file
        with open(file_path, "w") as f:
            toml.dump(record_dict, f)

        return file_path

    def load_record(self, file_path: Path) -> Optional[FinancialRecord]:
        try:
            with open(file_path, "r") as f:
                data = toml.load(f)

            # Extract main record data (exclude metadata)
            record_data = {
                "date": data["date"],
                "category": data["category"],
                "description": data["description"],
                "value": data["value"],
                "source": data["source"],
                "metadata": data.get("metadata", {}),
            }

            return FinancialRecord.from_dict(record_data)
        except Exception as e:
            print(f"Error loading record from {file_path}: {e}")
            return None

    def get_all_records(self) -> list[FinancialRecord]:
        records = []

        if not self.data_directory.exists():
            return records

        # Walk through all directories
        for toml_file in self.data_directory.rglob("*.toml"):
            record = self.load_record(toml_file)
            if record:
                records.append(record)

        return records
