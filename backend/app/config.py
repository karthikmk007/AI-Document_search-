from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data" / "documents"
METADATA_FILE = DATA_DIR / "index.json"

DATA_DIR.mkdir(parents=True, exist_ok=True)
