// src/components/Sidebar.jsx
import React from 'react';

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-black text-white p-6 flex flex-col space-y-6">
      <h2 className="text-2xl font-bold">Teacher CheatSheet</h2>

      <div>
        <label htmlFor="alumno-name" className="block mb-1">Nombre alumno</label>
        <input
          id="alumno-name"
          type="text"
          placeholder="Introduce nombre…"
          className="w-full p-2 bg-gray-800 text-white rounded"
        />
      </div>

      <div>
        <label htmlFor="trimestre-select" className="block mb-1">Trimestre</label>
        <select
          id="trimestre-select"
          className="w-full p-2 bg-gray-800 text-white rounded"
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      </div>
    </aside>
  );
}