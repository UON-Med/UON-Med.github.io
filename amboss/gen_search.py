import os
import json
import re
from string import punctuation
from collections import Counter

from tqdm import *
from bs4 import BeautifulSoup
from stop_words import get_stop_words
import msgpack

total_files = 1480
stop_words = get_stop_words('english')
exclusion_list = [
    '',
    'eg',
]
exclusion_substrings = [
    'http',
]

alphanumeric = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']


def splitnonalpha(s):
    ret = []

    prev_pos = 0
    curr_pos = 0
    last_was_alpha = False
    while curr_pos < len(s):
        if s[curr_pos].isalpha() == last_was_alpha:
            last_was_alpha = not last_was_alpha
            ret.append(s[prev_pos:curr_pos])
            prev_pos = curr_pos
        curr_pos += 1
    return ret

def word_valid(word):
    filtered_word = re.sub(r'\W+', '', word.rstrip(punctuation).lower())
    if (len(filtered_word) > 0 and
        filtered_word not in exclusion_list and
        filtered_word not in stop_words and
        not any(substring in filtered_word for substring in exclusion_substrings) ):
        return True
    else:
        return False

if __name__ == "__main__":
    # # Read msgpack file
    # with open('./search_data.json', 'rb') as data_file:
    #     # data_loaded = json.load(data_file)
    #     data_loaded = msgpack.unpack(data_file, encoding="utf8")
    # print(data_loaded)
    # exit()

    search_data = {}
    location_lookup = []

    # Encrypts all data
    root_dir = './content-source'
    i = 0
    with tqdm(total=total_files) as pbar:
        for old_dir, subdirectories, files in os.walk(root_dir):
            for file in files:
                curr_path = os.path.join(old_dir, file)
                if ".DS_Store" not in curr_path:
                    # Reads each html
                    with open(curr_path, 'r') as fp:
                        html = fp.read()

                        # Counts word frequencies
                        soup = BeautifulSoup(html, "lxml")
                        # kill all script and style elements
                        for script in soup(["script", "style"]):
                            script.extract()    # rip it out
                        # get text
                        text = soup.get_text()
                        # break into lines and remove leading and trailing space on each
                        lines = (line.strip() for line in text.splitlines())
                        # break multi-headlines into a line each
                        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                        # drop blank lines
                        text = '\n'.join(chunk for chunk in chunks if chunk)
                        words = text.split()
                        # Cleans words
                        cleaned_words = []
                        for word in words:
                            # cleaned_word = re.sub(r'\W+', '', word.rstrip(punctuation).lower())
                            word = word.lower()
                            split_word = splitnonalpha(word)
                            # split_word = re.split('(?=[^a-zA-Z])', word)
                            for word in split_word:
                                if(word_valid(word)):
                                    cleaned_words.append(word)
                        # print(text)
                        c = Counter(cleaned_words)

                        # Adds to search_data
                        for word_set in c.items():
                            new_set = (word_set[1], i)
                            if word_set[0] in search_data:
                                search_data[word_set[0]].append(new_set)
                            else:
                                search_data[word_set[0]] = [new_set]
                        # Adds page title to search_data
                        page_title = ' '.join(curr_path.split('/')[-1].split('.')[0].split(' ')[1:])
                        if page_title in search_data:
                            search_data[page_title].append((1, i))
                        else:
                            search_data[page_title] = [(1, i)]
                        # Adds to location lookup table
                        location_lookup.append(curr_path)
                        i += 1
                    pbar.update(1)
            # if i > 10:
            #     break

    array_data = []
    for word, freq_list in search_data.items():
        array_data.append({"w": word, "r":freq_list})

    # with open("./search_data.json", 'wb') as fp:
    #     msgpack.pack(array_data, fp)

    with open("./search_data.json", 'w') as fp:
        json.dump(array_data, fp, sort_keys=True, indent=None, separators=(',', ':'))

    with open("./location_lookup.json", 'w') as fp:
        json.dump(location_lookup, fp, sort_keys=True, indent=None, separators=(',', ':'))

    # with open("./search_data_indented.json", 'w') as fp:
    #     json.dump(search_data, fp, sort_keys=True, indent=4)

    # with open("./location_lookup_indented.json", 'w') as fp:
    #     json.dump(location_lookup, fp, sort_keys=True, indent=4)
