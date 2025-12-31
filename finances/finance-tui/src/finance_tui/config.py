import os
import toml
from pathlib import Path
from typing import Dict, Any


class Config:
    def __init__(self):
        self.config_dir = Path.home() / ".finance-tui"
        self.config_file = self.config_dir / "config.toml"
        self.default_data_dir = Path("./data")
        self._config_data = self._load_config()

    def _load_config(self) -> Dict[str, Any]:
        if self.config_file.exists():
            try:
                with open(self.config_file, "r") as f:
                    return toml.load(f)
            except Exception as e:
                print(f"Warning: Could not load config file: {e}")
                return self._create_default_config()
        else:
            return self._create_default_config()

    def _create_default_config(self) -> Dict[str, Any]:
        config_data = {"data_directory": str(self.default_data_dir), "version": "1.0"}
        self._save_config(config_data)
        return config_data

    def _save_config(self, config_data: Dict[str, Any]) -> None:
        self.config_dir.mkdir(parents=True, exist_ok=True)
        try:
            with open(self.config_file, "w") as f:
                toml.dump(config_data, f)
        except Exception as e:
            print(f"Warning: Could not save config file: {e}")

    def get_data_directory(self) -> Path:
        data_dir = self._config_data.get("data_directory", str(self.default_data_dir))
        return Path(data_dir)

    def set_data_directory(self, path: str) -> None:
        self._config_data["data_directory"] = path
        self._save_config(self._config_data)

    def get(self, key: str, default: Any = None) -> Any:
        return self._config_data.get(key, default)

    def set(self, key: str, value: Any) -> None:
        self._config_data[key] = value
        self._save_config(self._config_data)
