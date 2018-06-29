import os
import json

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

wrapper_prefix = "<div id='OreoPageColumn' class='Resizer__resizable___3cXGT navPanePageColumn pageColumn__column___BiVzv column__column___lF07v' aria-label='Page List'> <div id='PageList' class='pageColumn__fullWidth___f1Bc3 column__itemList___2uf3c '> <div class='ms-SelectionZone'> <div class='ms-FocusZone pagesContainer' data-focuszone-id='FocusZone3'>"
wrapper_suffix = "</div></div></div><span class='Resizer__resizer___1UnJ4'></span></div>"
leaf_format = "<div class='pageNode menu-nav-leaf' data-endpoint='%s' id='%s' href='#%s'> <div class='insertionHint__insertionHint___FN2xl' style='overflow: hidden;'> <div class='insertionHint__insertionHintInner___258_S'> <div class='insertionHint__circleOuter___2Q6Al'> <div class='insertionHint__circleMiddle___1Kv3b'> <div class='insertionHint__circleInner___36PFZ'></div></div></div></div><div class='insertionHint__line___2WNeO'></div></div><div class='pageListItem mainItem__item___3C3H5' draggable='true'> <div class='navItem mainItem__navItem___6MqNm navItem__item___3XSQD pageItem mainItem__highContrastOutline___26BC9' aria-activedescendant='true' data-is-focusable='true' role='treeitem' aria-label='%s, Page. Selected. Press Ctrl + F6 to navigate to page contents.' data-tip='%s' tabindex='0' data-selection-index='0'> <div class='mainItem__backgroundSelected___21wxb' style='background-color: rgb(193, 0, 82);'></div><div class='mainItem__itemWrap___3tojD' style='margin-left: 0px;'> <div title='%s' class='undefined active mainItem__wrapper___2fpxM'> <content class='navItem__content___2Ol4W'>%s</content> </div></div></div></div><div class='insertionHint__insertionHint___FN2xl' style='overflow: hidden;'> <div class='insertionHint__insertionHintInner___258_S'> <div class='insertionHint__circleOuter___2Q6Al'> <div class='insertionHint__circleMiddle___1Kv3b'> <div class='insertionHint__circleInner___36PFZ'></div></div></div></div><div class='insertionHint__line___2WNeO'></div></div></div>"
item_format = "<div class='menu-nav-section'><div class='pageNode menu-nav-toggle' id='%s'> <div class='insertionHint__insertionHint___FN2xl' style='overflow: hidden;'> <div class='insertionHint__insertionHintInner___258_S'> <div class='insertionHint__circleOuter___2Q6Al'> <div class='insertionHint__circleMiddle___1Kv3b'> <div class='insertionHint__circleInner___36PFZ'></div></div></div></div><div class='insertionHint__line___2WNeO'></div></div><div class='pageListItem mainItem__item___3C3H5' draggable='true'> <div class='navItem mainItem__navItem___6MqNm navItem__item___3XSQD pageItem mainItem__highContrastOutline___26BC9' aria-activedescendant='true' data-is-focusable='true' role='treeitem' aria-label='%s, Page. Selected. Press Ctrl + F6 to navigate to page contents.' data-tip='%s' tabindex='0' data-selection-index='0'> <div class='mainItem__backgroundSelected___21wxb' style='background-color: rgb(193, 0, 82);'></div><div class='mainItem__itemWrap___3tojD' style='margin-left: 0px;'> <div title='%s' class='undefined active mainItem__wrapper___2fpxM'> <content class='navItem__content___2Ol4W'>%s</content> </div></div></div></div><div class='insertionHint__insertionHint___FN2xl' style='overflow: hidden;'> <div class='insertionHint__insertionHintInner___258_S'> <div class='insertionHint__circleOuter___2Q6Al'> <div class='insertionHint__circleMiddle___1Kv3b'> <div class='insertionHint__circleInner___36PFZ'></div></div></div></div><div class='insertionHint__line___2WNeO'></div></div></div>"


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
            # html += "<li><a class='menu-nav-toggle'>%s</a><ol id='%s' class='menu-nav-child' style='display: none;''>" % (file, (num+file).replace(" ", ""))
            html += item_format % ((num+file).replace(" ", ""), file, file, file, file)
            html += "<div id='%sChildren' class='menu-nav-child' style='display: none;'>" % ((num+file).replace(" ", ""))
            html += generate_tree(rel)
            html += "</div></div>"
            # html += "</ol></li>"
        else:
            if '.html' in file:
                href = rel[1:]
                # html += "<li class='menu-nav-leaf' data-endpoint='%s'><a id='%s' href='#%s'>%s</a></li>" % (href, (num+file).replace(" ", ""), href[1:], file.split('.html')[0])
                name = file.split('.html')[0]
                html += leaf_format % (href, (num+file).replace(" ", ""), href[1:], name, name, name, name)

            else:
                # html += "<li>%s</li>" % (file)
                html += item_format % ((num+file).replace(" ", ""), name, name, name, name)

    return html

if __name__ == "__main__":
    # html = '<ul>'
    html = wrapper_prefix
    html += generate_tree('./content')
    html += wrapper_suffix
    # html += '</ul>'

    with open('nav.html', 'w') as fp:
        fp.write(html)
