import os
import re
from werkzeug.utils import secure_filename
from io import BytesIO
import openpyxl
from flask import current_app
import openpyxl.utils.exceptions
import zipfile
import olefile
import tempfile
import shutil
import pandas as pd

# Configuración
ALLOWED_EXTENSIONS = {'xlsx', 'xls', 'xlsm', 'xlsb', 'csv'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_ROWS_TO_PROCESS = 1000  # Límite de filas a procesar

def allowed_file(filename):
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    return ext in ALLOWED_EXTENSIONS

def is_valid_excel(file_stream):
    """Verifica si es un archivo Excel válido usando múltiples métodos"""
    try:
        # Guardar en un archivo temporal para múltiples lecturas
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            shutil.copyfileobj(file_stream, tmp)
            tmp_path = tmp.name
        
        # Verificar por extensión
        ext = file_stream.filename.rsplit('.', 1)[1].lower() if '.' in file_stream.filename else ''
        
        # Para archivos .xlsb necesitamos un manejo especial
        if ext == 'xlsb':
            try:
                # Intentar leer con pandas
                df = pd.read_excel(tmp_path, engine='pyxlsb', nrows=1)
                return True
            except:
                return False
        
        # Intento 1: Verificar si es un ZIP que contiene archivos Excel
        with open(tmp_path, 'rb') as f:
            if f.read(4) == b'PK\x03\x04':
                f.seek(0)
                with zipfile.ZipFile(f) as z:
                    return any(name.startswith('xl/') for name in z.namelist())
        
        # Intento 2: Verificar si es un OLE container (formato antiguo)
        with open(tmp_path, 'rb') as f:
            if olefile.isOleFile(f):
                return True
        
        # Intento 3: Verificar firma de archivos .xls
        with open(tmp_path, 'rb') as f:
            if f.read(8) == b'\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1':
                return True
                
        # Intento 4: Leer con pandas como último recurso
        try:
            df = pd.read_excel(tmp_path, nrows=1)
            return True
        except:
            return False
            
    except Exception as e:
        current_app.logger.error(f"Error en validación de Excel: {str(e)}")
        return False
    finally:
        file_stream.seek(0)
        try:
            os.unlink(tmp_path)
        except:
            pass