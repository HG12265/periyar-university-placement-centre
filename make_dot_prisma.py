import os
import zipfile

zip_path = 'dot_prisma.zip'
base_dir = os.path.join('backend', 'node_modules', '.prisma')

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, base_dir)
            z.write(file_path, arcname)

size_mb = round(os.path.getsize(zip_path) / (1024 * 1024), 2)
print(f"Created {zip_path}, size: {size_mb} MB")

