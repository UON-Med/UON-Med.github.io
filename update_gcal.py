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
driver = webdriver.Chrome(executable_path=os.path.abspath("chromedriver"), chrome_options=chrome_options)


def wait_for_elem(id=None, css=None, xpath=None, name=None, root=None, prev_content=None, debug=False, get_all=False):
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
            elif name:
                print(time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()) + " | name='" + name + "'")
            if prev_content:
                # print(prev_content, end="\n\n")
                pass

        try:
            # connect
            if not get_all:
                if id:
                    content = driver_or_root.find_element_by_id(id)
                elif css:
                    content = driver_or_root.find_element_by_css_selector(css)
                elif xpath:
                    content = driver_or_root.find_element_by_xpath(xpath)
                elif name:
                    content = driver_or_root.find_element_by_name(name)
            else:
                if id:
                    content = driver_or_root.find_elements_by_id(id)
                elif css:
                    content = driver_or_root.find_elements_by_css_selector(css)
                elif xpath:
                    content = driver_or_root.find_elements_by_xpath(xpath)
                elif name:
                    content = driver_or_root.find_elements_by_name(name)

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


def scrape():
    # Loads page and focuses correct iframe
    driver.get("https://accounts.google.com/signin/v2/identifier?service=cl&passive=1209600&osid=1&continue=https%3A%2F%2Fcalendar.google.com%2Fcalendar%2Frender&followup=https%3A%2F%2Fcalendar.google.com%2Fcalendar%2Frender&scc=1&flowName=GlifWebSignIn&flowEntry=ServiceLogin")
    username = wait_for_elem(id="identifierId") #username form field
    username.send_keys(str(sys.argv[1]))
    submitButton = driver.find_element_by_id("identifierNext")
    submitButton.click()

    password = wait_for_elem(name="password") #password form field
    time.sleep(1)
    password.send_keys(str(sys.argv[2]))
    submitButton = driver.find_element_by_id("passwordNext")
    submitButton.click()

    overflow_button = wait_for_elem(xpath="//div[@role='button'][@aria-label='Settings menu']")
    overflow_button.click()
    time.sleep(1)

    settings_button = wait_for_elem(xpath="//content[@role='menuitem'][@aria-label='Settings']")
    settings_button.click()
    time.sleep(1)

    calendars = wait_for_elem(xpath="//a[text()[contains(., 'JMP - ')]]", get_all=True)
    cals_scraped = {}
    cal_links = []
    for i, calendar in enumerate(calendars):
        name = calendar.get_attribute('innerHTML').split(' - ')[1]
        cal_id = calendar.find_element_by_xpath('../..').get_attribute('data-calendarid')
        # print(cal_id)
        cals_scraped[name] = cal_id
        cal_links.append({'n': name, 'l': cal_id})
    for i, name in enumerate(sorted(cals_scraped.keys())):
        print(str(i+1) + '. ' + name)

    # https://calendar.google.com/calendar?cid=
    # print(json.dumps(cal_links, indent=4, sort_keys=True))
    with open('cal_links.json', 'w') as outfile:
        json.dump(cal_links, outfile)


    # password = driver.find_element_by_xpath("//input[@type='password']") #password form field


    # wait(driver, 10).until(EC.frame_to_be_available_and_switch_to_it("sdx_ow_iframe"))

    # waits for content to load
    # content = wait_for_elem(id="")

    # # Gathering menus to click
    # sections = get_sections()

    # # Gathering pages to save
    # prev_page_list = None
    # prev_page = None
    # for i in range(0, len(sections)):
    #     sections = get_sections()
    #     section = sections[i]

    #     curr_section_path = "./content/"+' '.join(section["name"].split('/'))
    #     if is_blacklisted(blacklist, curr_section_path):
    #         print("Error: '" + curr_section_path + "' already finished, skipping.")
    #         continue

        # # Accesses page list in section
        # section["button"].click()
        # # Waits for page list to load
        # time.sleep(3)
        # pages_html = get_pages()

        # pages = []
        # prev_page = None
        # for j in range(0, len(pages_html)):
        #     print(j)
        #     pages_html = get_pages()
        #     page = pages_html[j]
        #     page_name = str(j) + ' ' + page.find_element_by_css_selector("div.pageListItem").find_element_by_css_selector("div.navItem").get_attribute("data-tip")
        #     pages.append({"name": page_name, "button": page})

        #     curr_page_path = "./content/"+section["name"]+"/"+' '.join(page_name.split('/'))+".html"
        #     if is_blacklisted(blacklist, curr_page_path):
        #         print("Error: '" + curr_page_path + "' already finished, skipping.")
        #         continue

        #     # Saves each page in the section
        #     actions = ActionChains(driver)
        #     actions.move_to_element(page).perform()
        #     page.click()

        #     time.sleep(3)
        #     curr_page = wait_for_elem(id=content_id, prev_content=prev_page)

        #     # Goes to move to all images to get them to load
        #     images = driver.find_elements_by_css_selector("img.WACImage")
        #     for k in range(0, len(images)):
        #         images = driver.find_elements_by_css_selector("img.WACImage")
        #         image = images[k]
        #         actions = ActionChains(driver)
        #         actions.move_to_element(image).perform()
        #         time.sleep(1)

        #     curr_page = driver.find_element_by_id(content_id)
        #     prev_page = curr_page.get_attribute("outerHTML")

        # section["pages"] = pages

    # pp.pprint(sections)

    return True

if __name__ == "__main__":

    scrape()

    # is_done = False
    # while is_done != True:
    #     try:
    #         blacklist = gen_blacklist()
    #         is_done = scrape(blacklist)
    #     except Exception as ex:
    #         print('\n' + time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()))
    #         print(ex)

    # blacklist = gen_blacklist()
    # is_done = scrape(blacklist)

    driver.close()
