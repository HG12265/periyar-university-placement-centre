import os
import zipfile

zip_path = 'backend_deploy.zip'
base_dir = 'backend'

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(base_dir):
        # Exclude node_modules, .git, uploads
        if 'node_modules' in root or '.git' in root or 'uploads' in root:
            continue
        for file in files:
            if file in ['backend.zip', 'backend_deploy.zip', '.env']:
                continue
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, base_dir)
            z.write(file_path, arcname)

print("Created backend_deploy.zip successfully.")

