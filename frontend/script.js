document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('excel-file');
    const uploadForm = document.getElementById('upload-form');
    const uploadStatus = document.getElementById('upload-status');
    
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
            
            const data = await response.json();
            
            if (response.ok) {
                showUploadSuccess(data);
            } else {
                showStatus(`Error: ${data.error || 'Error en el servidor'}`, 'error');
            }
        } catch (error) {
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
        uploadStatus.innerHTML = `
            <div class="status-header">✅ Archivo validado correctamente!</div>
            <div class="status-details">
                <p><strong>Nombre:</strong> ${data.filename}</p>
                <p><strong>Tamaño:</strong> ${(data.file_size / 1024).toFixed(2)} KB</p>
                <p><strong>Hojas:</strong> ${data.sheet_names.join(', ')}</p>
                <p><strong>Filas:</strong> ${data.row_count}</p>
                <p><strong>Columnas:</strong> ${data.col_count}</p>
                <p><strong>Mensaje:</strong> ${data.message}</p>
            </div>
        `;
        uploadStatus.classList.add('success');
        uploadStatus.style.display = 'block';
    }
});