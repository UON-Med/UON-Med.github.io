import os
import json
import re

# data = {'content':{'Clinical Knowledge':{}}}

# for dirpath, dirs, files in os.walk("./content/Clinical Knowledge"):
#     curr_path = dirpath[1:].split('/')[1:]
#     prev_root = None
#     curr_root = data
#     # Walks down path
#     for step in curr_path:
#         if step not in curr_root:
#             print(step)
#             curr_root[step] = {}
#         prev_root = curr_root
#         curr_root = curr_root[step]
#     if files:
#         prev_root[step] = files
#         pass
#     else:
#         prev_root = []

#     # print(dirpath[1:])
#     # print(files)

# print(json.dumps(data, indent=4, sort_keys=True))

# def make_tree(path):
#     tree = dict(name=os.path.basename(path), children=[])
#     try: lst = os.listdir(path)
#     except OSError:
#         pass #ignore errors
#     else:
#         for name in lst:
#             if(name == '.DS_Store'):
#                 continue
#             fn = os.path.join(path, name)
#             if os.path.isdir(fn):
#                 tree['children'].append(make_tree(fn))
#             else:
#                 tree['children'].append(dict(name=name))
#     return tree

# def custom_sort(a, b):
#     try:
#         a = int(a.split(' ')[0])
#         b = int(b.split(' ')[0])
#     except:
#         pass

#     if a > b:
#         return -1
#     elif a == b:
#         if a > b:
#             return 1
#         else:
#             return -1
#     else:
#         return 1

def custom_key(elem):
    try:
        elem = int(elem.split(' ')[0])
    except:
        elem = 0
    return elem

def generate_tree(path, html=""):
    for file in sorted(os.listdir(path), key=custom_key):
        if(file == '.DS_Store'):
            continue
        if("'" in file):
            # file = re.escape(file)
            file = file.replace("'", "&#39;")
        rel = path + "/" + file
        num = ''
        try:
            int(file.split(' ')[0])
        except:
            pass
        else:
            num = ' '.join(file.split(' ')[0]) + ' '
            file = ' '.join(file.split(' ')[1:])
        if os.path.isdir(rel):
            html += "<li><a class='menu-nav-toggle'>%s</a><ol id=%s class='menu-nav-child' style='display: none;''>" % (file, (num+file).replace(" ", ""))
            html += generate_tree(rel)
            html += "</ol></li>"
        else:
            if '.html' in file:
                href = rel[1:]
                html += "<li class='menu-nav-leaf' data-endpoint='%s'><a id='%s' href='#%s'>%s</a></li>" % (href, (num+file).replace(" ", ""), href[1:], file.split('.html')[0])
            else:
                html += "<li>%s</li>" % (file)
    return html

if __name__ == "__main__":
    html = '<ul>'
    html += generate_tree('./content') + '</ul>'

    with open('nav.html', 'w') as fp:
        fp.write(html)
