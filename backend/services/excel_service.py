import openpyxl
import uuid
import boto3
from io import BytesIO
from config import S3_CONFIG

def process_excel(file):
    # Leer Excel
    wb = openpyxl.load_workbook(BytesIO(file.read()))
    sheet = wb.active
    
    # Extraer datos
    columns = [cell.value for cell in sheet[1]]
    data = []
    for row in sheet.iter_rows(min_row=2, values_only=True):
        data.append(row)
    
    # Generar ID único
    file_id = str(uuid.uuid4())
    
    # Guardar en S3
    save_to_s3(file_id, file)
    
    return file_id, columns

def save_to_s3(file_id, file):
    s3 = boto3.client('s3', 
                      aws_access_key_id=S3_CONFIG['ACCESS_KEY'],
                      aws_secret_access_key=S3_CONFIG['SECRET_KEY'])
    
    file.seek(0)
    s3.upload_fileobj(file, S3_CONFIG['BUCKET'], f"excels/{file_id}.xlsx")