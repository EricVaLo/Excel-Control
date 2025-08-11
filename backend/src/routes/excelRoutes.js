const express = require('express');
const router = express.Router();
const ExcelController = require('../controllers/excelController');
const upload = require('../utils/fileUpload');

// Subir archivo Excel
router.post('/upload', upload.single('file'), ExcelController.uploadFile);

// Leer archivo Excel
router.get('/read/:filename', ExcelController.readFile);

// Actualizar celda
router.post('/update/:filename', ExcelController.updateCell);

module.exports = router;