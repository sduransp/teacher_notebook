
```bash
backend/
├── app/                              # Código fuente principal
│   ├── __init__.py
│   ├── main.py                       # Punto de entrada de la aplicación (e.g. FastAPI ou Flask)
│   ├── config.py                     # Configuración (entorno, BD, etc.)
│   ├── routes/                       # Definición de endpoints REST
│   │   ├── students.py               # /students (importar, alta, modificación)
│   │   ├── modules.py                # /modules (definir módulo, RA, criterios)
│   │   └── grades.py                 # /grades (notas, cálculo media)
│   ├── models/                       # Modelos de datos (ORM SQLAlchemy / Pydantic)
│   │   ├── student.py
│   │   ├── module.py
│   │   └── grade.py
│   ├── schemas/                      # Validación y serialización (Pydantic)
│   │   ├── student.py
│   │   ├── module.py
│   │   └── grade.py
│   ├── services/                     # Lógica de negocio
│   │   ├── pdf_parser.py             # Parseo de PDF
│   │   ├── student_service.py
│   │   ├── module_service.py
│   │   └── grade_service.py          # Cálculo de nota media
│   ├── repositories/                 # Acceso a datos (CRUD ORM)
│   │   ├── student_repo.py
│   │   ├── module_repo.py
│   │   └── grade_repo.py
│   └── utils/                        # Helpers, validaciones, logger...
│       ├── logger.py
│       └── validators.py
│
├── migrations/                       # Scripts de migración de la base de datos
│   └── versions/
│
├── tests/                            # Pruebas unitarias y de integración
│   ├── test_students.py
│   ├── test_modules.py
│   └── test_grades.py
│
├── requirements.txt                  # Dependencias pip
├── Dockerfile                        # Contenedor Docker
├── .env                              # Variables de entorno
└── README.md                         # Explicación del proyecto y arranque
```
