import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import background from '../assets/background.jpg';

/**
 * StudentSelectPage
 *
 * - Importar PDF de alumnos
 * - Tabla de importados + checkbox “Añadir”
 * - Guardar importados en backend
 * - Ver alumnos persistidos (ID, Nombre, Ciclos, Módulos)
 * - Eliminar alumnos persistidos
 */
export default function StudentSelectPage() {
  const [alumnoId, setAlumnoId] = useState('');
  const [trimestre, setTrimestre] = useState('1');
  const [students, setStudents] = useState([]);      // importados
  const [persisted, setPersisted] = useState([]);    // /students
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleteIds, setDeleteIds] = useState(new Set());
  const [showSplash, setShowSplash] = useState(true);
  const [viewMode, setViewMode] = useState(null);    // 'imported' | 'persisted'
  const [loadingPersisted, setLoadingPers] = useState(false);
  const [errorPersisted, setErrorPers] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  /* ---------- Mutations ---------- */
  // Importar PDF
  const importMutation = useMutation({
    mutationFn: formData =>
      fetch('http://localhost:8000/import/students', {
        method: 'POST',
        body: formData,
      }).then(res => {
        if (!res.ok) throw new Error('Fallo al importar PDF');
        return res.json();
      }),
    onSuccess: data => {
      setStudents(data);
      setShowSplash(false);
      setViewMode('imported');
    },
  });

  // Guardar seleccionados (añadir)
  const saveMutation = useMutation({
    mutationFn: payload =>
      fetch('http://localhost:8000/students/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(res => {
        if (!res.ok) throw new Error('Fallo al guardar alumnos');
        return res.json();
      }),
    onSuccess: () => {
      alert('¡Alumno/s añadido/s correctamente!');
      setSelectedIds(new Set());
    },
    onError: () => {
      alert('Alguno de los alumnos ya existe en la BBDD.');
    },
  });

  // Eliminar seleccionados
  const deleteMutation = useMutation({
    mutationFn: payload =>
      fetch('http://localhost:8000/students/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(res => {
        if (!res.ok) throw new Error('Fallo al eliminar alumnos');
        return res.json();
      }),
    onSuccess: () => {
      alert('¡Alumno/s eliminado/s correctamente!');
      setDeleteIds(new Set());
      // Refrescar lista
      handleViewStudents();
    },
    onError: () => {
      alert('Error al eliminar alumnos.');
    },
  });

  /* ---------- Handlers ---------- */
  const toggleId = id =>
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleDeleteId = id =>
    setDeleteIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    importMutation.mutate(form);
    e.target.value = '';
  };

  const handleSave = () => {
    const toSave = students
      .filter(s => selectedIds.has(s.id))
      .map(s => ({ full_name: s.full_name }));
    if (!toSave.length) return alert('No hay alumnos seleccionados.');
    saveMutation.mutate({ students: toSave });
  };

  const handleDelete = () => {
    const toDelete = persisted
      .filter(s => deleteIds.has(s.id))
      .map(s => ({ id: s.id }));
    if (!toDelete.length) return alert('No hay alumnos seleccionados para eliminar.');
    deleteMutation.mutate({ students: toDelete });
  };

  const handleViewStudents = () => {
    setShowSplash(false);
    setViewMode('persisted');
    setLoadingPers(true);
    setErrorPers(null);
    fetch('http://localhost:8000/students')
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar alumnos');
        return res.json();
      })
      .then(data => setPersisted(data))
      .catch(err => setErrorPers(err.message))
      .finally(() => setLoadingPers(false));
  };

  const handleGo = () => {
    setShowSplash(false);
    const id = alumnoId.trim() || 'test';
    navigate(`/alumno/${id}/trimestre/${trimestre}`);
  };

  /* ---------- Render ---------- */
  return (
    <div className="page-split">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Teacher CheatSheet</h2>

        <button className="mb-4 py-2 px-3 bg-gray-700 rounded" onClick={handleImportClick}>
          Importar Alumnos
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <button className="mb-4 py-2 px-3 bg-gray-700 rounded" onClick={handleViewStudents}>
          Ver Alumnos
        </button>

        <button className="mb-4 py-2 px-3 bg-gray-700 rounded">
          Gestionar Asignaturas
        </button>

        <div className="fields-container mt-auto">
          <div className="field-group">
            <label htmlFor="id-alumno">ID Alumno</label>
            <input
              id="id-alumno"
              type="text"
              placeholder="Nombre Alumno"
              value={alumnoId}
              onChange={e => setAlumnoId(e.target.value)}
            />
          </div>
          <div className="field-group">
            <label htmlFor="trimestre-select">Trimestre</label>
            <select
              id="trimestre-select"
              value={trimestre}
              onChange={e => setTrimestre(e.target.value)}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
          <button onClick={handleGo}>Ir a notas</button>
        </div>
      </aside>

      {/* Main pane */}
      <main className="content flex flex-col" style={{ backgroundColor: '#000' }}>
        {showSplash ? (
          <div
            className="splash flex-grow"
            style={{
              backgroundImage: `url(${background})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ) : importMutation.isLoading ? (
          <p className="text-white">Importando alumnos…</p>
        ) : viewMode === 'persisted' ? (
          <>
            <h1 className="text-white">Base de Datos de Alumnos</h1>
            {loadingPersisted ? (
              <p className="text-white">Cargando…</p>
            ) : errorPersisted ? (
              <p className="text-red-500">Error: {errorPersisted}</p>
            ) : (
              <>
                <div className="overflow-auto grow">
                  <table className="w-full mt-4 text-white">
                    <thead>
                      <tr>
                        <th className="w-8">ID</th>
                        <th className="w-8">Nombre</th>
                        <th>Ciclos</th>
                        <th>Módulos</th>
                        <th className="w-24 text-center">Eliminar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {persisted.map(s => (
                        <tr key={s.id}>
                          <td className="w-8">{s.id}</td>
                          <td className="w-8">{s.full_name}</td>
                          <td>{s.ciclos.join(', ')}</td>
                          <td>{s.modulos.join(', ')}</td>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              checked={deleteIds.has(s.id)}
                              onChange={() => toggleDeleteId(s.id)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  className="mt-auto self-end py-2 px-4 rounded"
                  style={{ backgroundColor: '#fff', color: '#000' }}
                  onClick={handleDelete}
                >
                  Guardar
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <h1 className="text-white">Alumnos importados</h1>
            <div className="overflow-auto grow">
              <table className="w-full mt-4 text-white">
                <thead>
                  <tr>
                    <th className="w-20">ID</th>
                    <th className="w-20">Nombre</th>
                    <th className="w-24 text-center">Añadir</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td className="w-20">{s.id}</td>
                      <td className="w-20">{s.full_name}</td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(s.id)}
                          onChange={() => toggleId(s.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              className="mt-auto self-end py-2 px-4 rounded"
              style={{ backgroundColor: '#fff', color: '#000' }}
              onClick={handleSave}
            >
              Guardar
            </button>
          </>
        )}
      </main>
    </div>
  );
}