// src/pages/StudentSelectPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import background from '../assets/background.jpg';

export default function StudentSelectPage() {
  const [alumnoId, setAlumnoId]         = useState('');
  const [trimestre, setTrimestre]       = useState('1');
  const [asignatura, setAsignatura]     = useState('');
  const [showSplash, setShowSplash]     = useState(true);
  const navigate = useNavigate();

  const handleGo = () => {
    setShowSplash(false);
    const id = alumnoId.trim() || 'test';
    navigate(`/alumno/${id}/trimestre/${trimestre}`);
  };

  return (
    <div className="page-split">
      {/* Sidebar izquierdo */}
      <aside className="sidebar">
        <h2>Teacher CheatSheet</h2>

        {/* Botones de gestión */}
        <button className="mb-4 py-2 px-3 bg-gray-700 rounded">Importar Alumnos</button>
        <button className="mb-4 py-2 px-3 bg-gray-700 rounded">Gestionar Asignatura</button>

        {/* Inputs al pie del sidebar */}
        <div className="fields-container mt-auto">
          {/* Campo ID Alumno */}
          <div className="field-group">
            <label htmlFor="id-alumno">ID Alumno  </label>
            <input
              id="id-alumno"
              type="text"
              placeholder="Nombre Alumno"
              value={alumnoId}
              onChange={e => setAlumnoId(e.target.value)}
            />
          </div>

          {/* Campo Trimestre */}
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

          {/* Campo Asignatura */}
          <div className="field-group">
            <label htmlFor="asignatura">ID Módulo </label>
            <input
              id="asignatura"
              type="text"
              placeholder="Nombre Asignatura"
              value={asignatura}
              onChange={e => setAsignatura(e.target.value)}
            />
          </div>

          {/* Botón Ir a notas */}
          <button onClick={handleGo}>Ir a notas</button>
        </div>
      </aside>

      {/* Sección derecha */}
      <main className="content">
        {showSplash ? (
          <div
            className="splash"
            style={{ backgroundImage: `url(${background})` }}
          />
        ) : (
          <>
            <h1>Selecciona un alumno</h1>
            <p>Introduce un ID y selecciona un trimestre para continuar.</p>
          </>
        )}
      </main>
    </div>
  );
}