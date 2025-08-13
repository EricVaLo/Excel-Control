document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('excel-file');
    const uploadForm = document.getElementById('upload-form');
    const uploadStatus = document.getElementById('upload-status');
    const excelViewer = document.getElementById('excel-viewer');
    const excelFilename = document.getElementById('excel-filename');
    const excelRows = document.getElementById('excel-rows');
    const excelCols = document.getElementById('excel-cols');
    const spreadsheetContainer = document.getElementById('spreadsheet-container');
    
    let hot = null;
    const MAX_ROWS_TO_DISPLAY = 500; // Límite de filas para mostrar
    
    // Manejar clic en el área de drop
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Actualizar mensaje cuando se selecciona un archivo
    fileInput.addEventListener('change', (e) => {
        if (fileInput.files.length) {
            const fileName = fileInput.files[0].name;
            dropZone.querySelector('.file-msg').textContent = `Archivo seleccionado: ${fileName}`;
        }
    });
    
    // Manejar eventos de arrastrar y soltar
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropZone.classList.add('dragover');
    }
    
    function unhighlight() {
        dropZone.classList.remove('dragover');
    }
    
    // Manejar soltar archivo
    dropZone.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            fileInput.files = files;
            const fileName = files[0].name;
            dropZone.querySelector('.file-msg').textContent = `Archivo listo: ${fileName}`;
        }
    }
    
    // Manejar envío del formulario
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!fileInput.files.length) {
            showStatus('Por favor selecciona un archivo Excel', 'error');
            return;
        }
        
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            showStatus('Validando y subiendo archivo...', 'info');
            
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                showStatus(`Error: ${data.error}`, 'error');
                if (data.details) {
                    console.error('Detalles del error:', data.details);
                }
            } else {
                showUploadSuccess(data);
                showExcelData(data);
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            showStatus(`Error de conexión: ${error.message}`, 'error');
        }
    });
    
    function showStatus(message, type) {
        uploadStatus.textContent = message;
        uploadStatus.className = '';
        uploadStatus.classList.add(type);
        uploadStatus.style.display = 'block';
    }
    
    function showUploadSuccess(data) {
        let messageHTML = `
            <div class="status-header">✅ Archivo validado correctamente!</div>
            <div class="status-details">
                <p><strong>Nombre:</strong> ${data.filename}</p>
                <p><strong>Tamaño:</strong> ${(data.file_size / 1024).toFixed(2)} KB</p>
                <p><strong>Hojas:</strong> ${data.sheet_names.join(', ')}</p>
                <p><strong>Filas:</strong> ${data.row_count}</p>
                <p><strong>Columnas:</strong> ${data.col_count}</p>
        `;
        
        if (data.partial) {
            messageHTML += `<p class="warning"><strong>Nota:</strong> ${data.message}</p>`;
        }
        
        messageHTML += `</div>`;
        
        uploadStatus.innerHTML = messageHTML;
        uploadStatus.classList.add('success');
        uploadStatus.style.display = 'block';
    }
    
    function showExcelData(data) {
        // Actualizar información del archivo
        excelFilename.textContent = data.filename;
        excelRows.textContent = data.row_count;
        excelCols.textContent = data.col_count;
        
        // Preparar datos para Handsontable
        let tableData = [];
        
        // 1. Si hay headers y datos
        if (data.headers && Array.isArray(data.headers) && data.data && Array.isArray(data.data)) {
            tableData = [data.headers, ...data.data];
        }
        // 2. Si solo hay datos sin headers
        else if (data.data && Array.isArray(data.data)) {
            tableData = data.data;
        }
        // 3. Si solo hay headers
        else if (data.headers && Array.isArray(data.headers)) {
            tableData = [data.headers];
        }
        
        // Limitar filas para mostrar
        if (tableData.length > MAX_ROWS_TO_DISPLAY) {
            const originalRows = tableData.length;
            tableData = tableData.slice(0, MAX_ROWS_TO_DISPLAY);
            
            // Añadir mensaje de advertencia
            const warningRow = Array(tableData[0]?.length || 1).fill('');
            warningRow[0] = `⚠️ Se muestran solo ${MAX_ROWS_TO_DISPLAY} de ${originalRows} filas`;
            tableData.push(warningRow);
        }
        
        // Destruir instancia anterior si existe
        if (hot) {
            try {
                hot.destroy();
            } catch (e) {
                console.error('Error al destruir Handsontable:', e);
            }
            spreadsheetContainer.innerHTML = '';
        }
        
        // Si no hay datos, mostrar mensaje
        if (tableData.length === 0) {
            spreadsheetContainer.innerHTML = '<div class="no-data">No se encontraron datos en el archivo Excel</div>';
            excelViewer.style.display = 'block';
            return;
        }
        
        // Crear nuevo contenedor
        const hotContainer = document.createElement('div');
        hotContainer.style.width = '100%';
        hotContainer.style.height = '400px';
        spreadsheetContainer.appendChild(hotContainer);
        
        try {
            // Configuración segura de Handsontable
            const config = {
                data: tableData,
                rowHeaders: true,
                colHeaders: true,
                height: 400,
                width: '100%',
                manualColumnResize: true,
                manualRowResize: true,
                contextMenu: true,
                readOnly: true,
                stretchH: 'all',
                autoWrapRow: true,
                autoWrapCol: true,
                preventOverflow: 'horizontal',
                renderAllRows: false, // Solo renderizar filas visibles
                viewportRowRenderingOffset: 'auto',
                viewportColumnRenderingOffset: 'auto'
            };
            
            // Solo añadir funcionalidades pesadas para datasets pequeños
            if (tableData.length <= 100) {
                config.licenseKey = 'non-commercial-and-evaluation';
                config.columnSorting = true;
                config.filters = true;
                config.dropdownMenu = true;
            }
            
            hot = new Handsontable(hotContainer, config);
        } catch (error) {
            console.error('Error al crear Handsontable:', error);
            
            // Mostrar tabla simple como alternativa
            spreadsheetContainer.innerHTML = createSimpleTable(tableData);
        }
        
        // Mostrar la sección de visualización
        excelViewer.style.display = 'block';
        excelViewer.scrollIntoView({ behavior: 'smooth' });
    }
    
    function createSimpleTable(data) {
        if (!data || data.length === 0) return '<div class="no-data">No hay datos para mostrar</div>';
        
        let html = '<div class="simple-table-container"><table class="simple-table">';
        
        // Cabeceras (si existen)
        if (data[0] && Array.isArray(data[0])) {
            html += '<thead><tr>';
            for (let i = 0; i < data[0].length; i++) {
                html += `<th>${data[0][i] || ''}</th>`;
            }
            html += '</tr></thead>';
        }
        
        // Datos
        html += '<tbody>';
        const startRow = data[0] && data[0].length ? 1 : 0;
        
        for (let i = startRow; i < data.length; i++) {
            html += '<tr>';
            for (let j = 0; j < data[i].length; j++) {
                html += `<td>${data[i][j] || ''}</td>`;
            }
            html += '</tr>';
        }
        
        html += '</tbody></table></div>';
        return html;
    }
});