import React from 'react';

const ExcelViewer = ({ data, filename }) => {
  return (
    <div className="excel-viewer">
      <h2>Visualizando: {filename}</h2>
      
      {data.map((sheet, sheetIndex) => (
        <div key={sheetIndex} className="sheet-container">
          <h3>Hoja: {sheet.name}</h3>
          
          <div className="table-container">
            <table>
              <tbody>
                {sheet.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.cells.map((cell, cellIndex) => (
                      <td key={cellIndex}>
                        {cell.value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExcelViewer;