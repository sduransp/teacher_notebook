# backend/app/services/student_service.py
import json
import threading
from pathlib import Path
from typing import List, Dict

DATA_FILE = Path(__file__).parent.parent / "data" / "alumnos.json"
_LOCK     = threading.Lock()

class StudentDataService:
    """
    Manages in-memory and persistent storage of students,
    organized by full_name, and prevents duplicates.
    """
    def __init__(self):
        # Load existing data or start empty
        self._students: List[Dict] = []
        self._names_set: set[str]  = set()
        self._load_from_disk()

    def _load_from_disk(self):
        """Read JSON file into memory and build name index."""
        if DATA_FILE.exists():
            data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
            self._students = data
            self._names_set = {s["full_name"] for s in self._students}

    def _save_to_disk(self):
        """Persist current list to JSON file."""
        DATA_FILE.write_text(
            json.dumps(self._students, ensure_ascii=False, indent=2),
            encoding="utf-8"
        )

    def add_students(self, new_students: List[Dict]) -> List[Dict]:
        """
        Add students if not already present.
        Uses full_name hashing via a set for O(1) checks.
        Returns the list of actually added students.
        """
        added = []
        with _LOCK:
            for s in new_students:
                name = s["full_name"]
                if name not in self._names_set:
                    # Assign a unique ID
                    record = {
                        "id": len(self._students) + 1,
                        "full_name": name,
                        "ciclos": [],   # placeholder
                        "modulos": []   # placeholder
                    }
                    self._students.append(record)
                    self._names_set.add(name)
                    added.append(record)
            if added:
                self._save_to_disk()
        return added

    def list_students(self) -> List[Dict]:
        """Get all students."""
        return self._students.copy()

# Singleton instance
student_data_service = StudentDataService()