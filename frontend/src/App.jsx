import React, { useState } from 'react';
import ExcelUploader from './components/ExcelUploader.jsx';
import ExcelViewer from './components/ExcelViewer.jsx';
import './App.css';

function App() {
  const [currentFile, setCurrentFile] = useState(null);
  const [excelData, setExcelData] = useState(null);

  return (
    <div className="app-container">
      <header>
        <h1>Gestor de Archivos Excel</h1>
      </header>
      
      <main>
        <ExcelUploader 
          onFileUploaded={setCurrentFile} 
          onDataLoaded={setExcelData}
        />
        
        {excelData && (
          <ExcelViewer 
            data={excelData} 
            filename={currentFile} 
          />
        )}
      </main>
    </div>
  );
}

export default App;