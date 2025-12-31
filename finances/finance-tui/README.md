# Finance TUI

A simple terminal-based application for tracking personal finances. Records are stored in TOML files organized by source, year, month, and day.

## Features

- **Simple TUI Interface**: Clean terminal interface with form inputs
- **TOML Storage**: Records stored in human-readable TOML format
- **Organized File Structure**: Data organized by `source/year/month/day/`
- **Flexible Categories**: Free-form categories and sources
- **Positive/Negative Values**: Support for both income and expenses
- **Timestamp-based Filenames**: Unique filenames using millisecond timestamps
- **Configuration System**: Configurable data directory (default: `./data/`)

## Installation

1. **Install UV** (if not already installed):
   ```bash
   python3 -m pip install uv
   ```

2. **Clone and setup the project**:
   ```bash
   git clone <repository>
   cd finance-tui
   uv add textual toml
   ```

## Usage

### Running the Application

```bash
# Activate virtual environment
source .venv/bin/activate

# Run the application
python main.py

# Or with help
python main.py --help
```

### Using the TUI

1. **Launch the application**: Run `python main.py`
2. **Fill in the form**:
   - **Date**: Enter in YYYY-MM-DD format (e.g., 2024-12-31)
   - **Category**: Free-form text (e.g., groceries, salary, entertainment)
   - **Description**: What the transaction was for
   - **Value**: Positive for income, negative for expenses (e.g., -45.67 or 1000.00)
   - **Source**: Where the transaction occurred (e.g., credit_card, cash, bank_account)
3. **Submit**: Click the Submit button or press Enter
4. **Exit**: Press Ctrl+C or Ctrl+Q to quit

### Data Storage

Records are automatically saved to TOML files with the following structure:

```
data/
└── {source}/
    └── {year}/
        └── {month}/
            └── {day}/
                └── {timestamp}.toml
```

Example file content:
```toml
date = "2024-12-31"
category = "groceries"
description = "Weekly shopping"
value = -45.67
source = "credit_card"

[metadata]
created_at = "2024-12-31T12:30:45.123456"
version = "1.0"
```

## Configuration

Configuration is stored in `~/.finance-tui/config.toml`:

```toml
data_directory = "./data"
version = "1.0"
```

You can change the data directory by editing this file.

## Keyboard Shortcuts

- **Ctrl+C**: Quit application
- **Ctrl+Q**: Quit application
- **Tab**: Navigate between form fields
- **Enter**: Submit form (when button is focused)

## Requirements

- Python 3.8+
- textual (TUI framework)
- toml (TOML parsing)

## Development

The project structure:
```
finance-tui/
├── main.py                 # Entry point
├── pyproject.toml         # Project configuration
├── src/
│   └── finance_tui/
│       ├── __init__.py
│       ├── config.py       # Configuration management
│       ├── models.py       # Data models
│       ├── storage.py      # File storage logic
│       └── ui.py           # TUI interface
└── data/                   # Default data directory
```

## License

MIT License - feel free to use and modify as needed.