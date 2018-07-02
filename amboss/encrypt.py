import os
import sys
import pathlib
import subprocess

missing_folders = [
    "./content/Clinical Skills",
    "./content/Clinical Knowledge/5 Urology/7 Traumatic Injuries",
]

if __name__ == "__main__":

    if((len(sys.argv) < 2 or len(sys.argv) > 3) or (len(sys.argv) == 2 and (sys.argv[1] == '-i' or sys.argv[1] == '--index'))):
        print("Run as \"python encrypt.py <password> <optional ['-i' or '--index']>\"")
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

        # Puts in missing folders
        for folder in missing_folders:
            pathlib.Path(folder).mkdir(parents=True, exist_ok=True) 

    if((len(sys.argv) == 2) or (len(sys.argv) == 3 and (sys.argv[2] == '--index' or sys.argv[2] == '-i'))):
        # Encrypts index
        # os.system('staticrypt index-source.html ' + str(sys.argv[1]) + ' -o index.html -f index_template.html')
        subprocess.call(["staticrypt", "index-source.html", str(sys.argv[1]), "-o", "index.html", "-f", "index_template.html"])
