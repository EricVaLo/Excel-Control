const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

class ExcelController {
  static async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
      }
      res.json({ 
        filename: req.file.filename,
        message: 'Archivo subido correctamente' 
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al subir archivo' });
    }
  }

  static async readFile(req, res) {
    try {
      const filename = req.params.filename;
      const filePath = path.join(__dirname, '../../storage', filename);
      
      // Verificar si el archivo existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Archivo no encontrado' });
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      
      const sheetsData = [];
      workbook.eachSheet((worksheet) => {
        const sheet = {
          name: worksheet.name,
          rows: []
        };
        
        worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
          const rowData = {
            row: rowNumber,
            cells: []
          };
          
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            rowData.cells.push({
              col: colNumber,
              value: cell.value,
              type: cell.type
            });
          });
          
          sheet.rows.push(rowData);
        });
        
        sheetsData.push(sheet);
      });
      
      res.json(sheetsData);
    } catch (error) {
      res.status(500).json({ error: 'Error al leer archivo Excel' });
    }
  }

  static async updateCell(req, res) {
    try {
      const { filename } = req.params;
      const { sheetName, row, col, value } = req.body;
      const filePath = path.join(__dirname, '../../storage', filename);
      
      // Verificar si el archivo existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Archivo no encontrado' });
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      
      const worksheet = workbook.getWorksheet(sheetName);
      if (!worksheet) {
        return res.status(404).json({ error: `Hoja "${sheetName}" no encontrada` });
      }
      
      const cell = worksheet.getRow(row).getCell(col);
      cell.value = value;
      
      await workbook.xlsx.writeFile(filePath);
      res.json({ 
        message: 'Celda actualizada correctamente',
        cell: { row, col, value }
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar celda' });
    }
  }
}

module.exports = ExcelController;