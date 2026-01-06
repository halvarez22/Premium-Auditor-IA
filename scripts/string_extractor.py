import re

def extract_strings(file_path, min_len=4):
    with open(file_path, 'rb') as f:
        # Leer por trozos para no saturar memoria
        chunk_size = 1024 * 1024
        while True:
            data = f.read(chunk_size)
            if not data:
                break
            # Buscar secuencias de caracteres imprimibles
            yield from re.findall(rb'[ -~]{' + str(min_len).encode() + rb',}', data)

# Prueba con Elizondo
bak_path = r"C:\IA_nubes\auditorIA_1\ctTRANSPORTES_ELIZONDO_2024-20251024-1750\document_9aa3cd70-d41b-4905-8c9d-dc96db1a6e8a_content.bak"

print(f"Buscando cadenas en {bak_path}...")
count = 0
with open('extracted_strings.txt', 'w', encoding='utf-8') as out:
    for s in extract_strings(bak_path):
        try:
            line = s.decode('ascii')
            out.write(line + '\n')
            count += 1
            if count > 10000: # Limitar para la prueba
                break
        except:
            pass

print(f"Se extrajeron {count} cadenas potenciales.")
