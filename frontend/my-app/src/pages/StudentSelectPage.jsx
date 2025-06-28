// src/pages/StudentSelectPage.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import background from '../assets/background.jpg';

export default function StudentSelectPage() {
  const [alumnoId, setAlumnoId]       = useState('');
  const [trimestre, setTrimestre]     = useState('1');
  const [students, setStudents]       = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showSplash, setShowSplash]   = useState(true);
  const fileInputRef                  = useRef(null);
  const navigate                      = useNavigate();

  const toggleId = id => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    console.log('Saving students:', Array.from(selectedIds));
  };

  const importMutation = useMutation({
    mutationFn: formData =>
      fetch('http://localhost:8000/import/students', {
        method: 'POST',
        body: formData,
      }).then(res => {
        if (!res.ok) throw new Error('Error importing students');
        return res.json();
      }),
    onSuccess: data => {
      setStudents(data);
      setShowSplash(false);
    },
  });

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    importMutation.mutate(fd);
    e.target.value = '';
  };

  const handleGo = () => {
    setShowSplash(false);
    const id = alumnoId.trim() || 'test';
    navigate(`/alumno/${id}/trimestre/${trimestre}`);
  };

  return (
    <div className="page-split">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Teacher CheatSheet</h2>

        <button
          className="mb-4 py-2 px-3 bg-gray-700 rounded"
          onClick={handleImportClick}
        >
          Importar Alumnos
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <button className="mb-4 py-2 px-3 bg-gray-700 rounded">
          Gestionar Asignatura
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
      <main
        className="content flex flex-col"
        style={{ backgroundColor: '#000' }}
      >
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
        ) : (
          <>
            <h1 className="text-white">Alumnos importados</h1>
            <div className="overflow-auto grow">
              <table className="w-full mt-4 text-white">
                <thead>
                  <tr>
                    <th className="w-20">ID</th>
                    <th>Nombre</th>
                    <th className="w-24 text-center">Añadir</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.full_name}</td>
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
              onClick={handleSave}
              className="mt-auto self-end py-2 px-4 rounded"
              style={{ backgroundColor: '#fff', color: '#000' }}
            >
              Guardar
            </button>
          </>
        )}
      </main>
    </div>
  );
}