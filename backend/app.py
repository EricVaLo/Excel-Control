import os
import logging
from flask import Flask, request, jsonify, render_template, send_from_directory
from dotenv import load_dotenv
from services.excel_service import validate_excel, allowed_file, MAX_ROWS_TO_PROCESS

# Configurar logging
logging.basicConfig(level=logging.ERROR)

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'secret-key-default')
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB

# Servir archivos estáticos
@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

# Ruta principal
@app.route('/')
def index():
    return render_template('index.html')

# Ruta de verificación de salud
@app.route('/health')
def health_check():
    return jsonify({
        "status": "active",
        "message": "Excel Collaboration Service",
        "version": "1.0.0"
    })

# Endpoint para subir Excel
@app.route('/upload', methods=['POST'])
def upload_excel():
    try:
        # Verificar si se envió un archivo
        if 'file' not in request.files:
            return jsonify({"error": "No se encontró el archivo en la solicitud"}), 400
        
        file = request.files['file']
        
        # Verificar si se seleccionó un archivo
        if file.filename == '':
            return jsonify({"error": "No se seleccionó ningún archivo"}), 400
        
        # Validar extensión
        if not allowed_file(file.filename):
            return jsonify({"error": "Extensión de archivo no permitida"}), 400
        
        # Validar y procesar el archivo
        file_metadata, error = validate_excel(file)
        
        if error:
            return jsonify({"error": error}), 400
        
        # Limitar el número de filas procesadas
        if file_metadata.get('row_count', 0) > MAX_ROWS_TO_PROCESS:
            file_metadata['data'] = file_metadata['data'][:MAX_ROWS_TO_PROCESS]
            file_metadata['partial'] = True
            file_metadata['message'] = f"Se muestran solo las primeras {MAX_ROWS_TO_PROCESS} filas"
        
        file_metadata['status'] = "Archivo validado correctamente"
        file_metadata['message'] = file_metadata.get('message', "Próximamente se guardará y generará código de acceso")
        
        return jsonify(file_metadata)
        
    except Exception as e:
        app.logger.error(f"Error en endpoint /upload: {str(e)}")
        return jsonify({
            "error": "Error interno del servidor",
            "details": str(e)
        }), 500