from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from services.excel_service import process_excel, save_to_s3
from services.auth_service import generate_access_code
import os

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Endpoint para subir Excel
@app.route('/upload', methods=['POST'])
def upload_excel():
    file = request.files['file']
    if not file:
        return jsonify({"error": "No file provided"}), 400
    
    # Procesar archivo
    file_id, columns = process_excel(file)
    
    # Generar código de acceso
    access_code = generate_access_code(file_id)
    
    return jsonify({
        "file_id": file_id,
        "access_code": access_code,
        "columns": columns
    })

# WebSocket para colaboración
@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('join_spreadsheet')
def handle_join(data):
    file_id = data['file_id']
    # Lógica de validación de acceso
    # ...

@socketio.on('cell_update')
def handle_cell_update(data):
    # Propagación de cambios a otros usuarios
    socketio.emit('update_cell', data, room=data['file_id'])

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port)