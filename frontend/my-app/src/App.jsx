// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StudentSelectPage from './pages/StudentSelectPage';
import GradeLayout       from './pages/GradeLayout';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Routes>
       <Route path="/" element={<StudentSelectPage />} />
        <Route
          path="/alumno/:alumnoId/trimestre/:trimestre"
          element={<GradeLayout />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;