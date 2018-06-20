import os
import sys
import pathlib
import subprocess

if(len(sys.argv) != 2 and len(sys.argv) != 3):
    print("Run as 'python encrypt.py <password>'")
    exit()

if(len(sys.argv) == 2):
    # Encrypts all data
    root_dir = './content-source'
    for old_dir, subdirectories, files in os.walk(root_dir):
        for file in files:
            # print(os.path.join(old_dir, file))
            # print(old_dir + '/' + file)
            new_dir = old_dir.split('/')
            new_dir[1] = 'content'
            new_dir = '/'.join(new_dir)

            pathlib.Path(new_dir).mkdir(parents=True, exist_ok=True) 
            old_file = os.path.join(old_dir, file)
            new_file = os.path.join(new_dir, file)

            # os.system('staticrypt "' + old_file + '" ' + str(sys.argv[1]) + ' -o "' + new_file + '" -f encrypt_template.html')
            subprocess.call(["staticrypt", old_file, str(sys.argv[1]), "-o", new_file, "-f", "encrypt_template.html"])

if((len(sys.argv) == 2) or (len(sys.argv) == 3 and (sys.argv[2] == '--index' or sys.argv[2] == '-i'))):
    # Encrypts index
    # os.system('staticrypt index-source.html ' + str(sys.argv[1]) + ' -o index.html -f index_template.html')
    subprocess.call(["staticrypt", "index-source.html", str(sys.argv[1]), "-o", "index.html", "-f", "index_template.html"])
