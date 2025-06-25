// src/pages/GradeLayout.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

export default function GradeLayout() {
  const { alumnoId, trimestre } = useParams();

  return (
    <div className="page-split">
      {/* Sidebar 25% */}
      <aside className="sidebar">
        <h2 className="text-2xl font-bold mb-6">Teacher CheatSheet</h2>
        {/* Aquí meterías el autocomplete y el select de trimestre */}
      </aside>

      {/* Zona de notas 75% */}
      <main className="content">
        <h1 className="text-xl font-medium mb-6">
          Alumno: <strong>{alumnoId}</strong>, Trimestre: <strong>{trimestre}</strong>
        </h1>
        {/* Aquí tus tabs, tablas y KPIs */}
      </main>
    </div>
  );
}