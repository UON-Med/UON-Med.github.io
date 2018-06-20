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
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

if(len(sys.argv) != 3):
    print("Run as 'python amboss.py <username> <password>'")
    exit()

pp = pprint.PrettyPrinter(indent=4)

manual_blacklist = ['./content/Clinical Knowledge/5 Urology/7 Traumatic Injuries']


# Finds highest level 1 folder it's started
highest = (-1, '')
for dirpath, dirs, files in os.walk("./content/Clinical Knowledge"):
    if(dirpath != "./content/Clinical Knowledge"):
        curr_num = int(dirpath.split("./content/Clinical Knowledge/")[-1].split(' ')[0])
        if(curr_num > highest[0]):
            highest = (curr_num, '/'.join(dirpath.split('/')[:4]))
# if highest is still -1, then it hasn't started ANY level 1 folders
blacklist = None
lv1_root = highest[1]
if(highest[0] != -1):
    # Adds level 1 folders < lv1_root that it's done to blacklist
    raw_blacklist = next(os.walk('./content/Clinical Knowledge'))[1]
    blacklist = []
    for i, lv1 in enumerate(raw_blacklist):
        if(int(lv1.split(' ')[0]) < highest[0]):
            blacklist.append("./content/Clinical Knowledge/" + lv1)

    try:
        # Finds the highest level 2 folder it's started
        highest = (-1, '')
        for dirpath, dirs, files in os.walk(lv1_root):
            if(dirpath != lv1_root):
                curr_num = int(dirpath.split(lv1_root + '/')[-1].split(' ')[0])
                if(curr_num > highest[0]):
                    highest = (curr_num, '/'.join(dirpath.split('/')[:5]))
        # Adds all lower lv2 folders to blacklist
        for dirpath, dirs, files in os.walk(lv1_root):
            if(dirpath != lv1_root):
                curr_num = int(dirpath.split(lv1_root + '/')[-1].split(' ')[0])
                if(curr_num < highest[0]):
                    to_add = '/'.join(dirpath.split('/')[:5])
                    if(to_add not in blacklist):
                        blacklist.append(to_add)
    except:
        pass
if blacklist:
    blacklist = blacklist + manual_blacklist
else:
    blacklist = manual_blacklist
print(json.dumps(blacklist, indent=4, sort_keys=True))

chrome_options = Options()
# chrome_options.add_argument("--headless")
driver = webdriver.Chrome(executable_path=os.path.abspath("chromedriver"), chrome_options=chrome_options)

global_previously_saved = None
global_previous_list = None


def wait_until(polling_func, timeout, period=0.25, end_buffer=2):
    mustend = time.time() + timeout
    while time.time() < mustend:
        if polling_func(): 
            time.sleep(end_buffer)
            return True
        time.sleep(period)
    return False

def is_loaded():
    loader = driver.find_element_by_id('LibraryContent').find_element_by_class_name('Wait')
    if 'Active' in loader.get_attribute("class"):
        return False
    else:
        return True

def is_blacklisted(curr_root):
    # If blacklist is None, nothing is completed
    if blacklist is None:
        return False
    else:
        # If blacklist was successfully generated, checks if any item in it is in curr_root
        if any(substring in curr_root for substring in blacklist):
            return True
        else:
            return False
    # if('0 Internal Medicine/' in curr_root): 
    #     return True
    # elif('1 Surgery/' in curr_root):
    #     # Splits get the number range
    #     surg_path = curr_root.split('1 Surgery/')[-1]
    #     # If just looking through the surgery list, then is not blacklisted
    #     if not surg_path:
    #         return False
    #     surg_num = int(surg_path.split(' ')[0])
    #     if(surg_num < 4):
    #         return True
    #     elif(surg_num == 4):
    #         neurosurg_path = surg_path.split('4 Neurosurgery/')[-1]
    #         # If just looking through the neuro list, then is not blacklisted
    #         if not neurosurg_path:
    #             return False
    #         neurosurg_num = int(neurosurg_path.split(' ')[0])
    #         if(neurosurg_num <= 11):
    #             return True
    #         else:
    #             return False
    #     else:
    #         return False
    # else:
    #     return False

# Return true means all was good, false means it should skip to next
def recursiveScrape(curr_root, is_leaf):
    global global_previous_list
    # input(curr_root)
    # wait_until(is_loaded, 10)
    # Backs up root url to return to at end of exploration
    root_url = driver.current_url

    LibraryContent = None
    while LibraryContent is None:
        try:
            # connect
            LibraryContent = driver.find_element_by_id('LibraryContent')
        except:
            pass

    # If error, then skips
    if("No results found." in driver.find_element_by_id('LibraryContent').get_attribute('innerHTML')):
        print("Error: Loading problems for '" + curr_root  + "', backtracking...")
        global_previous_list = None
        return False

    LibraryList = None
    while LibraryList is None:
        try:
            # connect
            LibraryList = driver.find_element_by_id('LibraryList')
        except:
            pass

    # Won't wait for list to lead if is leaf
    if not is_leaf:
        LibraryList = None
        while (LibraryList is None) or (LibraryList == global_previous_list):
            try:
                # connect
                LibraryList = driver.find_element_by_id('LibraryList').get_attribute('innerHTML')
                if(LibraryList is None):
                    # Checks if at a leaf rather than still loading, in which case it should stop waiting
                    if(driver.find_element_by_id('LibraryContent').find_element_by_xpath("//div[@class='Content']").value_of_css_property('display') != 'block'):
                        break
            except:
                pass
        global_previous_list = LibraryList
    LibraryList = driver.find_element_by_id('LibraryList')

    # Checks if LibraryList's parent is visible, if so then still needs to search
    if not is_leaf:
        # If is list, explores all folders
        to_explore = []
        folders = LibraryList.find_elements_by_xpath("//tbody/tr/td[3]/a")
        for i, folder in enumerate(folders):
            folder_is_leaf = 'Folder' not in folder.find_element_by_xpath("../..").get_attribute("class")
            to_explore.append((str(i) + ' ' + folder.get_attribute('innerHTML').strip(),folder.get_attribute('href'),folder_is_leaf))
        # pp.pprint(to_explore)
        for page in to_explore:
            next_root = curr_root + page[0] + '/'
            # Checks if next root is blacklisted
            if is_blacklisted(next_root):
                # Skips the exploration of that path
                continue
            # Calls itself with the new curr_root
            driver.get(page[1])
            recursiveScrape(next_root, page[2])
            # After calling itself and that call returning, restores to saved root
        driver.get(root_url)
    else:
        # If is LearningCard, saves that learning card's contents

        # Waits for LearningCard to load, and ensures it is different from the previously loaded one
        LearningCard = None
        global global_previously_saved
        while (LearningCard is None) or (LearningCard == global_previously_saved):
            try:
                # connect
                LearningCard = driver.find_element_by_id('LearningCard').find_element_by_xpath("//div[@class='Grid Content spaced centered']/div[@class='Row']/div[@class='Column']/div[@class='LearningCard ng-scope force-disable-condensed']/div[@class='amboss-learningcard lc-normal ng-scope']").get_attribute('innerHTML')
            except:
                pass
        global_previously_saved = LearningCard
        data = driver.find_element_by_id('LearningCard').find_element_by_xpath("//div[@class='Grid Content spaced centered']/div[@class='Row']/div[@class='Column']").get_attribute('innerHTML')

        parent_root = '/'.join(curr_root.split('/')[:-2]) + '/'
        pathlib.Path(parent_root).mkdir(parents=True, exist_ok=True) 
        filename = os.path.join(parent_root, curr_root.split('/')[-2]+".html")
        if os.path.isfile(filename):
            print("Error: '" + filename + "' already exists, skipping.")
        else:
            with open(filename, 'w') as fp:
                fp.write(data)
    return True

if __name__ == "__main__":
    # Logs into account
    driver.get("https://www.amboss.com/us/app/index")
    username = driver.find_element_by_id("signin_username") #username form field
    password = driver.find_element_by_id("signin_password") #password form field
    username.send_keys(str(sys.argv[1]))
    password.send_keys(str(sys.argv[2]))
    submitButton = driver.find_element_by_css_selector("input.amboss-button.amboss-button--flat.amboss-button--small.amboss-button--full")
    submitButton.click()

    if "https://www.amboss.com/us/app/index" not in driver.current_url:
        print("Login failed")
        exit()


    # Should now be logged in
    # Navigates to library page
    driver.find_element_by_css_selector("a.prevent_doubleclick[href='/us/library']").click();
    if "https://www.amboss.com/us/library" not in driver.current_url:
        print("Navigation to library failed")
        exit()


    # Should now be on library page
    # # Scrapes clinical knowledge (CK)
    # driver.find_element_by_css_selector("div.View.libraryTree.libraryTreekh0mVf.amboss-library-tree-clinic.full").click();
    # recursiveScrape('./content/Clinical Knowledge/', False)


    # # Scrapes clinical steps (CS)
    driver.find_element_by_css_selector("div.View.libraryTree.libraryTree4h03Vf.amboss-library-tree-unknown.full").click();
    recursiveScrape('./content/Clinical Skills/', False)


    # driver.close()