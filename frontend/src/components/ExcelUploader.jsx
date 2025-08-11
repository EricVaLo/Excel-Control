import React, { useState } from 'react';
import axios from 'axios';

const ExcelUploader = ({ onFileUploaded, onDataLoaded }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Subir archivo
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await axios.post(
        'http://localhost:5000/api/excel/upload', 
        formData
      );
      
      onFileUploaded(uploadRes.data.filename);
      
      // Cargar datos del Excel
      const dataRes = await axios.get(
        `http://localhost:5000/api/excel/read/${uploadRes.data.filename}`
      );
      
      onDataLoaded(dataRes.data);
    } catch (err) {
      setError('Error al procesar el archivo: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <form onSubmit={handleSubmit}>
        <input 
          type="file" 
          accept=".xlsx, .xls" 
          onChange={handleFileChange} 
          disabled={loading}
        />
        <button 
          type="submit" 
          disabled={!file || loading}
        >
          {loading ? 'Procesando...' : 'Subir y Ver Excel'}
        </button>
      </form>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default ExcelUploader;