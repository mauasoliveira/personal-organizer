#!/usr/bin/env python3
"""
Finance TUI - Personal Finance Tracker

A simple terminal-based application for tracking personal finances.
Records are stored in TOML files organized by source, year, month, and day.
"""

import sys
import argparse
from pathlib import Path

# Add the src directory to Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

# Import the UI components directly
from textual.app import App, ComposeResult
from textual.containers import Container, Vertical
from textual.widgets import Input, Button, Static, Header, Footer, Label
from textual.binding import Binding

# Import our modules
from finance_tui.config import Config
from finance_tui.storage import Storage, FinancialRecord


class FinanceForm(Container):
    def compose(self) -> ComposeResult:
        yield Vertical(
            Label("Date (YYYY-MM-DD):"),
            Input(placeholder="2024-12-31", id="date_input"),
            Label("Category:"),
            Input(placeholder="groceries, salary, etc.", id="category_input"),
            Label("Description:"),
            Input(placeholder="What was this for?", id="description_input"),
            Label("Value:"),
            Input(placeholder="-45.67 or 1000.00", id="value_input"),
            Label("Source:"),
            Input(placeholder="credit_card, cash, bank_account", id="source_input"),
            Button("Submit", variant="primary", id="submit_button"),
            Static("", id="status_message"),
        )

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "submit_button":
            self.submit_form()

    def submit_form(self) -> None:
        try:
            # Get form values
            date = self.query_one("#date_input").value
            category = self.query_one("#category_input").value
            description = self.query_one("#description_input").value
            value_str = self.query_one("#value_input").value
            source = self.query_one("#source_input").value

            # Validate inputs
            if not all([date, category, description, value_str, source]):
                self.show_status("Please fill in all fields.", error=True)
                return

            # Convert value to float
            try:
                value = float(value_str)
            except ValueError:
                self.show_status("Please enter a valid number for value.", error=True)
                return

            # Create financial record
            record = FinancialRecord(
                date=date,
                category=category,
                description=description,
                value=value,
                source=source,
                metadata={},
            )

            # Save record
            config = Config()
            storage = Storage(config.get_data_directory())
            file_path = storage.save_record(record)

            # Show success message
            self.show_status(f"Record saved to {file_path}", error=False)

            # Clear form
            self.clear_form()

        except Exception as e:
            self.show_status(f"Error: {str(e)}", error=True)

    def clear_form(self) -> None:
        self.query_one("#date_input").value = ""
        self.query_one("#category_input").value = ""
        self.query_one("#description_input").value = ""
        self.query_one("#value_input").value = ""
        self.query_one("#source_input").value = ""

    def show_status(self, message: str, error: bool = False) -> None:
        status_widget = self.query_one("#status_message")
        if error:
            status_widget.update(f"❌ {message}")
        else:
            status_widget.update(f"✅ {message}")


class FinanceTUI(App):
    CSS = """
    .container {
        padding: 2;
    }
    
    Input {
        margin: 1 0;
    }
    
    Button {
        margin: 2 0;
    }
    
    Label {
        margin: 1 0 0 0;
    }
    
    #status_message {
        color: green;
        margin: 1 0;
    }
    """

    BINDINGS = [
        Binding("ctrl+c", "quit", "Quit"),
        Binding("ctrl+q", "quit", "Quit"),
    ]

    def compose(self) -> ComposeResult:
        yield Header()
        yield Container(FinanceForm(), classes="container")
        yield Footer()

    def on_mount(self) -> None:
        self.title = "Finance TUI"
        self.sub_title = "Personal Finance Tracker"


def run_ui():
    app = FinanceTUI()
    app.run()


def main():
    parser = argparse.ArgumentParser(
        description="Finance TUI - Personal Finance Tracker",
        epilog="Press Ctrl+C or Ctrl+Q to exit the application.",
    )

    parser.add_argument("--version", action="version", version="Finance TUI 1.0.0")

    args = parser.parse_args()

    try:
        # Run the TUI application
        run_ui()
    except KeyboardInterrupt:
        print("\nExiting Finance TUI...")
        sys.exit(0)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
