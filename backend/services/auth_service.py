import random
import string
import redis
from config import REDIS_CONFIG

r = redis.Redis(
    host=REDIS_CONFIG['HOST'],
    port=REDIS_CONFIG['PORT'],
    password=REDIS_CONFIG['PASSWORD'])

def generate_access_code(file_id):
    # Crear código de 6 dígitos (ej: "A1B2C3")
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    # Guardar en Redis con expiración (30 días)
    r.setex(f"access:{code}", 60*60*24*30, file_id)
    
    return code