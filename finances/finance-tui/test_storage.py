#!/usr/bin/env python3
"""
Test script for Finance TUI storage functionality
"""

import sys
from pathlib import Path

# Add the src directory to Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from finance_tui.config import Config
from finance_tui.storage import Storage, FinancialRecord


def test_storage():
    print("Testing Finance TUI storage functionality...")

    # Initialize config and storage
    config = Config()
    storage = Storage(config.get_data_directory())

    print(f"Data directory: {config.get_data_directory()}")

    # Create a test record
    test_record = FinancialRecord(
        date="2024-12-31",
        category="test",
        description="Test record for finance TUI",
        value=-25.50,
        source="test_source",
        metadata={"test": True},
    )

    print(f"Created test record: {test_record}")

    # Save the record
    file_path = storage.save_record(test_record)
    print(f"Record saved to: {file_path}")

    # Verify the file exists
    if file_path.exists():
        print("✅ File successfully created!")

        # Load the record back
        loaded_record = storage.load_record(file_path)
        if loaded_record:
            print(f"✅ Record loaded successfully: {loaded_record}")
            print(f"   Date: {loaded_record.date}")
            print(f"   Category: {loaded_record.category}")
            print(f"   Value: {loaded_record.value}")
            print(f"   Source: {loaded_record.source}")
        else:
            print("❌ Failed to load record")
    else:
        print("❌ File was not created")

    # Test getting all records
    all_records = storage.get_all_records()
    print(f"Total records in storage: {len(all_records)}")

    print("\nStorage test completed!")


if __name__ == "__main__":
    test_storage()
