import os
import zipfile

src_dir = os.path.join('backend', 'node_modules', '.prisma', 'client')

# Target 1: rhel-openssl-3.0.x (CloudLinux 9 / AlmaLinux 9 / modern cPanel)
# Target 2: rhel-openssl-1.1.x (CloudLinux 8 / CentOS 8)
for engine in ['rhel-openssl-3.0.x', 'rhel-openssl-1.1.x']:
    zip_name = f'dot_prisma_{engine}.zip'
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as z:
        for f in os.listdir(src_dir):
            if f.endswith('.node'):
                if engine in f:
                    z.write(os.path.join(src_dir, f), os.path.join('client', f))
            else:
                z.write(os.path.join(src_dir, f), os.path.join('client', f))
    size_mb = round(os.path.getsize(zip_name) / (1024 * 1024), 2)
    print(f"{zip_name} size: {size_mb} MB")

# Also test a combined RHEL (1.1.x and 3.0.x)
zip_combined = 'dot_prisma_rhel.zip'
with zipfile.ZipFile(zip_combined, 'w', zipfile.ZIP_DEFLATED) as z:
    for f in os.listdir(src_dir):
        if f.endswith('.node'):
            if 'rhel-openssl-3.0.x' in f or 'rhel-openssl-1.1.x' in f:
                z.write(os.path.join(src_dir, f), os.path.join('client', f))
        else:
            z.write(os.path.join(src_dir, f), os.path.join('client', f))
size_mb = round(os.path.getsize(zip_combined) / (1024 * 1024), 2)
print(f"{zip_combined} size: {size_mb} MB")

