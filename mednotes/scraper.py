import os
import sys
import time
import pathlib
import pprint
import json
import glob
from tqdm import *
from selenium import webdriver
from selenium.webdriver.common.keys import Keys  
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait as wait
from selenium.webdriver.common.action_chains import ActionChains

pp = pprint.PrettyPrinter(indent=4)

chrome_options = Options()
# chrome_options.add_argument("--headless")
driver = webdriver.Chrome(executable_path=os.path.abspath("../chromedriver"), chrome_options=chrome_options)

global_previously_saved = None
global_previous_list = None


content_id = "PageContentContainer"

manual_blacklist = []


# # Finds highest level 1 folder it's started
# highest = (-1, '')
# for dirpath, dirs, files in os.walk("./content"):
#     if(dirpath != "./content"):
#         curr_num = int(dirpath.split("./content/")[-1].split(' ')[0])
#         if(curr_num > highest[0]):
#             highest = (curr_num, '/'.join(dirpath.split('/')[:4]))
# # if highest is still -1, then it hasn't started ANY level 1 folders
# blacklist = None
# lv1_root = highest[1]
# if(highest[0] != -1):
#     # Adds level 1 folders < lv1_root that it's done to blacklist
#     raw_blacklist = next(os.walk('./content'))[1]
#     blacklist = []
#     for i, lv1 in enumerate(raw_blacklist):
#         if(int(lv1.split(' ')[0]) < highest[0]):
#             blacklist.append("./content/" + lv1)

#     try:
#         # Finds the highest level 2 folder it's started
#         highest = (-1, '')
#         for dirpath, dirs, files in os.walk(lv1_root):
#             if(dirpath != lv1_root):
#                 curr_num = int(dirpath.split(lv1_root + '/')[-1].split(' ')[0])
#                 if(curr_num > highest[0]):
#                     highest = (curr_num, '/'.join(dirpath.split('/')[:5]))
#         # Adds all lower lv2 folders to blacklist
#         for dirpath, dirs, files in os.walk(lv1_root):
#             if(dirpath != lv1_root):
#                 curr_num = int(dirpath.split(lv1_root + '/')[-1].split(' ')[0])
#                 if(curr_num < highest[0]):
#                     to_add = '/'.join(dirpath.split('/')[:5])
#                     if(to_add not in blacklist):
#                         blacklist.append(to_add)
#     except:
#         pass

def gen_blacklist():
    blacklist = []
    for filename in glob.iglob('./content/**/*.html', recursive=True):
        blacklist.append(filename)


    if blacklist:
        blacklist = blacklist + manual_blacklist
    else:
        blacklist = manual_blacklist

    if blacklist:
        print("---------------")
        print("   Blacklist")
        print(json.dumps(blacklist, indent=4, sort_keys=True))
        print("---------------")

    return blacklist

def is_blacklisted(blacklist, curr_root):
    # If blacklist was successfully generated, checks if any item in it is in curr_root
    if any(substring in curr_root for substring in blacklist):
        return True
    else:
        return False

def wait_for_elem(id=None, css=None, xpath=None, root=None, prev_content=None, debug=False):
    if root and root.__class__.__name__ != "WebElement":
        print("WARNING: root must be WebElement, not " + root.__class__.__name__)
        return

    driver_or_root = driver
    if root:
        driver_or_root = root
    content = None
    keep_checking = True
    while keep_checking:
        if debug:
            if id:
                print(time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()) + " | id='" + id + "'")
            elif css:
                print(time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()) + " | css='" + css + "'")
            elif xpath:
                print(time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()) + " | xpath='" + xpath + "'")
            if prev_content:
                # print(prev_content, end="\n\n")
                pass

        try:
            # connect
            if id:
                content = driver_or_root.find_element_by_id(id)
            elif css:
                content = driver_or_root.find_element_by_css_selector(css)
            elif xpath:
                content = driver_or_root.find_element_by_xpath(xpath)
        except:
            pass

        if content is None:
            keep_checking = True
        else:
            if prev_content is not None:
                try:
                    # error_log = content.get_attribute("outerHTML").replace(content.get_attribute("outerHTML"), "")
                    # if error_log:
                    #     print(content.get_attribute("outerHTML").replace(content.get_attribute("outerHTML"), ""))
                    # else:
                    #     if id:
                    #         print("id = " + id)
                    #     elif css:
                    #         print("css = " + css)
                    #     elif xpath:
                    #         print("xpath = " + xpath)
                    if content.get_attribute("outerHTML") == prev_content:
                        keep_checking = True
                    else:
                        keep_checking = False
                except:
                    content = None
                    keep_checking = True
            else:
                keep_checking = False

    return content

def get_sections(debug=False):
    sections_container = wait_for_elem(id="NavPaneSectionList")
    wait_for_elem(root=sections_container, css="div.navItem", debug=debug)
    sections_html = sections_container.find_element_by_xpath("//div[@class='sectionList']").find_elements_by_xpath("*")

    sections = []
    i = 0
    for section in sections_html:
        section_name = str(i) + ' ' + section.find_element_by_css_selector("div.navItem").get_attribute("data-tip")
        sections.append({"name": section_name, "button": section})
        i += 1
    return sections

def get_pages(debug=False):
    pages_container = wait_for_elem(id="PageList", debug=debug)
    pages_html = pages_container.find_element_by_css_selector("div.ms-SelectionZone").find_element_by_css_selector("div.pagesContainer").find_elements_by_xpath("*")
    return pages_html

def scrape(blacklist):
    # Loads page and focuses correct iframe
    driver.get("https://onedrive.live.com/view.aspx?ref=button&Bsrc=SMIT&resid=708DB7CA3B6187FE!1939&cid=708db7ca3b6187fe&app=OneNote&authkey=!Aqsda1BkgAhQO1Y")
    wait(driver, 10).until(EC.frame_to_be_available_and_switch_to_it("sdx_ow_iframe"))

    # waits for content to load
    content = wait_for_elem(id=content_id)

    # Gathering menus to click
    sections = get_sections()

    # Gathering pages to save
    prev_page_list = None
    prev_page = None
    for i in range(0, len(sections)):
        sections = get_sections()
        section = sections[i]

        curr_section_path = "./content/"+' '.join(section["name"].split('/'))
        if is_blacklisted(blacklist, curr_section_path):
            print("Error: '" + curr_section_path + "' already finished, skipping.")
            continue

        # Accesses page list in section
        section["button"].click()
        # Waits for page list to load
        time.sleep(3)
        pages_html = get_pages()

        pages = []
        prev_page = None
        for j in range(0, len(pages_html)):
            print(j)
            pages_html = get_pages()
            page = pages_html[j]
            page_name = str(j) + ' ' + page.find_element_by_css_selector("div.pageListItem").find_element_by_css_selector("div.navItem").get_attribute("data-tip")
            pages.append({"name": page_name, "button": page})

            curr_page_path = "./content/"+section["name"]+"/"+' '.join(page_name.split('/'))+".html"
            if is_blacklisted(blacklist, curr_page_path):
                print("Error: '" + curr_page_path + "' already finished, skipping.")
                continue

            # Saves each page in the section
            actions = ActionChains(driver)
            actions.move_to_element(page).perform()
            page.click()

            time.sleep(3)
            curr_page = wait_for_elem(id=content_id, prev_content=prev_page)

            # Goes to move to all images to get them to load
            images = driver.find_elements_by_css_selector("img.WACImage")
            for k in range(0, len(images)):
                images = driver.find_elements_by_css_selector("img.WACImage")
                image = images[k]
                actions = ActionChains(driver)
                actions.move_to_element(image).perform()
                time.sleep(1)

            curr_page = driver.find_element_by_id(content_id)
            prev_page = curr_page.get_attribute("outerHTML")

            # Stores page in file
            parent_root = curr_section_path + '/'
            pathlib.Path(parent_root).mkdir(parents=True, exist_ok=True)
            filename = os.path.join(parent_root, ' '.join(page_name.split('/'))+".html")
            if os.path.isfile(filename):
                print("Error: '" + filename + "' already exists, skipping.")
            else:
                with open(filename, 'w') as fp:
                    fp.write(prev_page)

        section["pages"] = pages

    # pp.pprint(sections)

    return True

if __name__ == "__main__":

    is_done = False
    while is_done != True:
        try:
            blacklist = gen_blacklist()
            is_done = scrape(blacklist)
        except Exception as ex:
            print('\n' + time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()))
            print(ex)

    # blacklist = gen_blacklist()
    # is_done = scrape(blacklist)

    # driver.close()