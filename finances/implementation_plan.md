# Finance TUI Implementation Plan

## Project Structure
```
finance-tui/
├── pyproject.toml
├── src/
│   └── finance_tui/
│       ├── __init__.py
│       ├── main.py
│       ├── models.py
│       ├── storage.py
│       ├── config.py
│       └── ui.py
└── data/                    # Configurable location
    └── [source]/[year]/[month]/[day]/[timestamp].toml
```

## Implementation Steps

### 1. Project Setup
```bash
# Install UV first
python3 -m pip install uv

# Initialize project
uv init finance-tui
cd finance-tui
uv add textual toml
```

### 2. Configuration System (config.py)
- Location: `~/.finance-tui/config.toml`
- Configurable data directory path
- Default: `./data/`

### 3. Data Models (models.py)
```python
@dataclass
class FinancialRecord:
    date: str  # YYYY-MM-DD format
    category: str
    description: str
    value: float
    source: str
    metadata: dict  # For future extensions
```

### 4. Storage Layer (storage.py)
- TOML file serialization
- Directory structure: `data/{source}/{year}/{month}/{day}/`
- Filename: `{timestamp}.toml`
- Auto-create directories

### 5. TUI Interface (ui.py)
- Simple form with fields:
  - Date (YYYY-MM-DD format)
  - Category (free-form text)
  - Description (text)
  - Value (number input)
  - Source (free-form text)
  - Submit button

### 6. Main Application (main.py)
- Entry point for the TUI app
- Initialize configuration
- Launch main screen

## File Format (TOML)
```toml
date = "2024-12-29"
category = "groceries"
description = "Weekly shopping"
value = -45.67
source = "credit_card"

[metadata]
created_at = "2024-12-29T12:30:45"
version = "1.0"
```

## Key Features
- Manual date input (YYYY-MM-DD)
- Free-form categories and sources
- Positive/negative value acceptance
- Timestamp-based filenames
- Metadata support for future enhancements
- Simple TUI form without exit confirmation
