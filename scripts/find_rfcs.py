import re

def find_rfcs(file_path):
    # Regex para RFC de México (ASCII only for bytes)
    rfc_pattern = re.compile(rb'[A-Z&]{3,4}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{3}')
    
    found = set()
    with open(file_path, 'rb') as f:
        chunk_size = 10 * 1024 * 1024 # 10MB chunks
        while True:
            data = f.read(chunk_size)
            if not data:
                break
            for match in rfc_pattern.finditer(data):
                found.add(match.group(0).decode('ascii', errors='ignore'))
    return found

bak_path = r"C:\IA_nubes\auditorIA_1\ctTRANSPORTES_ELIZONDO_2024-20251024-1750\document_9aa3cd70-d41b-4905-8c9d-dc96db1a6e8a_content.bak"
print(f"Buscando RFCs reales en {bak_path}...")
rfcs = find_rfcs(bak_path)
print(f"Se encontraron {len(rfcs)} RFCs únicos.")
for r in sorted(list(rfcs))[:20]:
    print(r)
