import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import background from '../assets/background.jpg';

/**
 * StudentSelectPage
 * - Importar PDF de alumnos
 * - Añadir alumnos manualmente mediante modal
 * - Tabla de alumnos persistidos (añadir/eliminar)
 */
export default function StudentSelectPage() {
  /* ---------------- State ---------------- */
  const [alumnoId, setAlumnoId] = useState('');
  const [trimestre, setTrimestre] = useState('1');
  const [students, setStudents] = useState([]);      // importados
  const [persisted, setPersisted] = useState([]);    // BBDD
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleteIds, setDeleteIds]   = useState(new Set());
  const [showSplash, setShowSplash] = useState(true);
  const [viewMode, setViewMode]     = useState(null); // 'imported' | 'persisted'
  const [loadingPersisted, setLoadingPers] = useState(false);
  const [errorPersisted,  setErrorPers]    = useState(null);

  /* ---- Estado del modal de alta manual ---- */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFullName,   setNewFullName]   = useState('');
  const [newCiclos,     setNewCiclos]     = useState(''); // coma-separados
  const [newModulos,    setNewModulos]    = useState(''); // coma-separados

  const fileInputRef = useRef(null);
  const navigate     = useNavigate();

  /* ---------------- Mutations ---------------- */
  // 1) Importar PDF
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

  // 2) Guardar seleccionados (bulk add)
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
      if (viewMode === 'persisted') handleViewStudents();
    },
    onError: () => {
      alert('Alguno de los alumnos ya existe en la BBDD.');
    },
  });

  // 3) Eliminar seleccionados
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
      handleViewStudents();
    },
    onError: () => {
      alert('Error al eliminar alumnos.');
    },
  });

  // 4) Añadir alumno manual (modal)
  const manualAddMutation = useMutation({
    mutationFn: payload =>
      fetch('http://localhost:8000/students/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(res => {
        if (!res.ok) throw new Error('Fallo al añadir alumno');
        return res.json();
      }),
    onSuccess: () => {
      setIsModalOpen(false);
      setNewFullName('');
      setNewCiclos('');
      setNewModulos('');
      if (viewMode === 'persisted') {
        handleViewStudents();
      } else {
        alert('Alumno añadido correctamente');
      }
    },
    onError: () => alert('Error: el alumno puede que ya exista.'),
  });

  /* ---------------- Handlers ---------------- */
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
  const handleFileChange  = e => {
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

  const handleRefresh = () => window.location.reload();

  // --- Modal actions ---
  const openManualModal   = () => setIsModalOpen(true);
  const closeManualModal  = () => {
    setIsModalOpen(false);
    setNewFullName('');
    setNewCiclos('');
    setNewModulos('');
  };
  const saveManualStudent = () => {
    if (!newFullName.trim()) return alert('El nombre es obligatorio');
    manualAddMutation.mutate({
      students: [
        {
          full_name: newFullName.trim(),
          ciclos:  newCiclos.split(',').map(c => c.trim()).filter(Boolean),
          modulos: newModulos.split(',').map(m => m.trim()).filter(Boolean),
        },
      ],
    });
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="page-split">
      {/* ---------------- Sidebar ---------------- */}
      <aside className="sidebar">
        <h2 onClick={handleRefresh} style={{ cursor: 'pointer' }}>Teacher CheatSheet</h2>

        <button className="mb-4 py-2 px-3 bg-gray-700 rounded" onClick={handleImportClick}>Importar Alumnos</button>
        <input ref={fileInputRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleFileChange} />

        <button className="mb-4 py-2 px-3 bg-gray-700 rounded" onClick={handleViewStudents}>Ver Alumnos</button>
        <button className="mb-4 py-2 px-3 bg-gray-700 rounded">Gestionar Asignaturas</button>

        {/* Atajos rápidos */}
        <div className="fields-container mt-auto">
          <div className="field-group">
            <label htmlFor="id-alumno">ID Alumno</label>
            <input id="id-alumno" type="text" placeholder="Nombre Alumno" value={alumnoId} onChange={e => setAlumnoId(e.target.value)} />
          </div>
          <div className="field-group">
            <label htmlFor="trimestre-select">Trimestre</label>
            <select id="trimestre-select" value={trimestre} onChange={e => setTrimestre(e.target.value)}>
              <option value="1">1</option><option value="2">2</option><option value="3">3</option>
            </select>
          </div>
          <button onClick={handleGo}>Ir a notas</button>
        </div>
      </aside>

      {/* ---------------- Main Pane ---------------- */}
      <main className="content flex flex-col" style={{ backgroundColor: '#000' }}>
        {/* Splash / loader */}
        {showSplash ? (
          <div className="splash flex-grow" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        ) : importMutation.isLoading ? (
          <p className="text-white">Importando alumnos…</p>
        ) : viewMode === 'persisted' ? (
          /* ----- Vista BBDD ----- */
          <>
            <h1 className="text-white">Base de Datos de Alumnos</h1>
            {loadingPersisted ? (
              <p className="text-white">Cargando…</p>
            ) : errorPersisted ? (
              <p className="text-red-500">Error: {errorPersisted}</p>
            ) : (
              <>
                {/* Tabla */}
                <div className="overflow-auto grow">
                  <table className="w-full mt-4 text-white">
                    <thead><tr><th className="w-8">ID</th><th className="w-8">Nombre</th><th>Ciclos</th><th>Módulos</th><th className="w-24 text-center">Eliminar</th></tr></thead>
                    <tbody>
                      {persisted.map(s => (
                        <tr key={s.id}>
                          <td className="w-8">{s.id}</td><td className="w-8">{s.full_name}</td>
                          <td>{s.ciclos.join(', ')}</td><td>{s.modulos.join(', ')}</td>
                          <td className="text-center"><input type="checkbox" checked={deleteIds.has(s.id)} onChange={() => toggleDeleteId(s.id)} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Botones acción */}
                <div className="mt-4 flex">
                  <button disabled={deleteIds.size === 0} onClick={handleDelete} className="py-2 px-4 rounded" style={{ backgroundColor: '#fff', color: 'red' }}>Eliminar seleccionados</button>
                  <button onClick={openManualModal} className="py-2 px-4 rounded" style={{ marginLeft: '1rem', backgroundColor: '#fff', color: '#000' }}>Añadir Alumno Manualmente</button>
                </div>
              </>
            )}
          </>
        ) : (
          /* ----- Vista IMPORTADOS ----- */
          <>
            <h1 className="text-white">Alumnos importados</h1>
            <div className="overflow-auto grow">
              <table className="w-full mt-4 text-white">
                <thead><tr><th className="w-20">ID</th><th className="w-20">Nombre</th><th className="w-24 text-center">Añadir</th></tr></thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td className="w-20">{s.id}</td><td className="w-20">{s.full_name}</td>
                      <td className="text-center"><input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggleId(s.id)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="mt-auto self-end py-2 px-4 rounded" style={{ backgroundColor: '#fff', color: '#000' }} onClick={handleSave}>Guardar</button>
          </>
        )}
      </main>

      {/* ---------------- Modal alta manual ---------------- */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.95)', overflowX: 'hidden' }}
        >
          {/*
            * Mantener ancho fijo (24rem -> w-96) y evitar expansión hacia la derecha.
            * Se elimina la sobrescritura width: '100vw' y se añade maxWidth para prevenir overflow.
          */}
          <div
            className="w-[90rem] max-w-full rounded-lg shadow-lg p-6"
            style={{ backgroundColor: '#000', color: '#fff', width: '25vw' }}
          >
            <h3 className="text-lg font-semibold mb-4">Añadir Alumno Manualmente</h3>
            <label className="block text-sm font-medium mb-1">Nombre completo</label>
            <input className="w-full border rounded px-2 py-1 mb-3" style={{ backgroundColor: '#000', color: '#fff', border: '1px solid #fff' }} value={newFullName} onChange={e => setNewFullName(e.target.value)} />

            <label className="block text-sm font-medium mb-1">Ciclos - OPCIONAL- (separados por comas)</label>
            <input className="w-full border rounded px-2 py-1 mb-3" style={{ backgroundColor: '#000', color: '#fff', border: '1px solid #fff' }} value={newCiclos} onChange={e => setNewCiclos(e.target.value)} />

            <label className="block text-sm font-medium mb-1">Módulos - OPCIONAL- (separados por comas)</label>
            <input className="w-full border rounded px-2 py-1 mb-4" style={{ backgroundColor: '#000', color: '#fff', border: '1px solid #fff' }} value={newModulos} onChange={e => setNewModulos(e.target.value)} />

            {manualAddMutation.isError && <p className="text-red-600 text-sm mb-2">{manualAddMutation.error?.message || 'Error desconocido'}</p>}
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeManualModal}
                className="py-2 px-4 rounded"
                style={{ marginLeft: '1rem', backgroundColor: '#fff', color: '#000' }}
              >
                Cancelar
              </button>
              <button
                onClick={saveManualStudent}
                disabled={!newFullName.trim() || manualAddMutation.isLoading}
                className="py-2 px-4 rounded"
                style={{ marginLeft: '1rem', backgroundColor: '#fff', color: '#000' }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}