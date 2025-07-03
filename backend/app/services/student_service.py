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
        self._next_id    : int       = 1
        self._load_from_disk()

    def _load_from_disk(self):
        if DATA_FILE.exists():
            self._students = json.loads(DATA_FILE.read_text(encoding="utf-8"))
            self._names_set = {s["full_name"] for s in self._students}
            if self._students:
                self._next_id = max(s["id"] for s in self._students) + 1

    def _save_to_disk(self):
        """Persist current list to JSON file."""
        DATA_FILE.write_text(
            json.dumps(self._students, ensure_ascii=False, indent=2),
            encoding="utf-8"
        )

    def _generate_id(self) -> int:
        new_id       = self._next_id
        self._next_id += 1
        return new_id

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
                    record = {
                        "id"       : self._generate_id(),
                        "full_name": name,
                        "ciclos"   : s.get("ciclos", []),
                        "modulos"  : s.get("modulos", []),
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
    
    def delete_students(self, ids: List[int]) -> List[int]:
        """
        Remove students whose id ∈ ids.  
        Returns the list of actually deleted ids.
        """
        deleted: list[int] = []
        id_set = set(ids)
        with _LOCK:
            # reconstruimos la lista sin los eliminados
            remaining = []
            for s in self._students:
                if s["id"] in id_set:
                    deleted.append(s["id"])
                    self._names_set.discard(s["full_name"])
                else:
                    remaining.append(s)
            if deleted:               # persist only if something changed
                self._students = remaining
                self._save_to_disk()
        return deleted

# Singleton instance
student_data_service = StudentDataService()