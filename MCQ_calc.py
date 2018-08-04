topics = [
    "HSE",
    "Professional Development and Practice",
    "Anatomy/Histology",
    "Biochemistry",
    "Genetics",
    "PBL",
    "Physiology",
    "Pharmacology",
    "Microbiology/Immunology",
    "Pathology"
]

# Survey responses row#:      2     3     4     5     6     7     8     9     10    11    12    13    14    15    16    17    18    19    20    21    22    23    24    25    26
sub_percs = [
    [0.83, 0.83, 0.83, 1.00, 0.67, 0.67, 0.83, 1.00, 1.00, 0.83, 1.00, 0.67, 0.83, 0.83, 0.83, 0.67, 1.00, 1.00, 0.83, 0.67, 1.00, 0.50, 0.83, 0.67, 0.83, 0.83, 0.83, 1.00, 0.67],
    [0.25, 0.75, 0.25, 0.75, 1.00, 0.75, 0.75, 0.75, 1.00, 1.00, 0.75, 0.75, 0.75, 1.00, 0.75, 0.25, 0.75, 1.00, 1.00, 1.00, 1.00, 0.75, 0.75, 0.25, 0.75, 0.75, 0.50, 0.25, 0.25],
    [1.00, 0.25, 0.25, 0.75, 0.50, 0.75, 0.50, 0.75, 1.00, 1.00, 0.25, 0.75, 0.25, 0.50, 0.75, 0.75, 0.75, 1.00, 1.00, 0.75, 0.75, 0.75, 1.00, 0.75, 0.50, 0.75, 0.50, 0.75, 0.75],
    [0.78, 0.56, 0.22, 0.78, 0.56, 0.44, 0.78, 0.56, 0.89, 0.78, 0.78, 0.33, 0.67, 0.78, 0.56, 0.89, 0.67, 0.78, 0.33, 0.67, 0.78, 0.56, 0.44, 0.67, 0.67, 0.67, 0.78, 0.78, 0.44],
    [0.83, 0.67, 0.83, 1.00, 0.50, 0.50, 0.33, 0.83, 1.00, 0.83, 1.00, 0.83, 0.67, 1.00, 0.33, 0.67, 1.00, 0.50, 0.67, 0.67, 0.67, 0.83, 0.33, 0.67, 0.50, 0.83, 0.67, 0.67, 0.50],
    [0.70, 0.78, 0.56, 0.93, 0.78, 0.59, 0.56, 0.70, 0.93, 0.70, 0.81, 0.85, 0.67, 0.63, 0.59, 0.74, 0.63, 0.70, 0.63, 0.93, 0.74, 0.67, 0.70, 0.56, 0.52, 0.81, 0.67, 0.59, 0.59],
    [0.59, 0.63, 0.48, 0.89, 0.63, 0.63, 0.52, 0.67, 0.81, 0.78, 0.78, 0.81, 0.67, 0.81, 0.63, 0.78, 0.85, 0.70, 0.52, 0.63, 0.74, 0.89, 0.70, 0.56, 0.56, 0.67, 0.70, 0.70, 0.56],
    [0.82, 0.82, 0.71, 1.00, 0.71, 0.82, 0.88, 0.76, 0.82, 0.88, 0.76, 0.88, 0.71, 1.00, 0.76, 0.88, 0.94, 0.88, 0.65, 0.82, 0.65, 0.94, 0.76, 0.88, 0.82, 0.94, 0.76, 0.65, 0.53],
    [0.78, 0.67, 0.44, 0.78, 0.67, 0.56, 0.67, 0.89, 0.89, 1.00, 0.89, 0.78, 0.67, 0.89, 0.56, 1.00, 0.78, 0.89, 0.56, 0.89, 0.89, 0.78, 1.00, 0.89, 0.67, 0.89, 0.67, 0.78, 0.33],
    [0.88, 0.88, 0.63, 1.00, 0.75, 0.63, 0.63, 0.88, 0.88, 1.00, 0.75, 1.00, 0.75, 0.88, 0.88, 1.00, 0.88, 0.75, 1.00, 1.00, 0.88, 1.00, 0.75, 1.00, 0.63, 0.88, 0.75, 0.50, 0.63]
]

felicity_estimates = [6,4,4,9,6,27,27,17,9,8]
max_denom = 60
for i, topic in enumerate(sub_percs):
    for j, score in enumerate(topic):
        for denom in range(1, max_denom):
            for numer in range(0, denom):
                if round(numer/denom, 2) == score:
                    sub_percs[i][j] = numer/denom
                    # print(str(numer) + '/' + str(denom) + ': ', end='')
                    # print(str(numer/denom) + ' ' + str(score))


for i, topic_scores in enumerate(sub_percs):
    print(topics[i], end=': ')
    for score in topic_scores:
        if score == 0.83:
            score = 5/6
        elif score == 0.67:
            score = 2/3
        elif score == 0.33:
            score = 1/31
        raw = score*felicity_estimates[i]
        if (raw % 1) > 0.2 and (raw % 1) < 0.8:
            print(raw % 1, end=', ')
    print()

sum = 0
for n in felicity_estimates:
    sum += n
print(sum)

exit()



total = 120
max_n = 20
lowest_n = 4

results = {}

for max_n in range(lowest_n+1, total):
    estimated_total = 0
    total_confidence = 0
    results[max_n] = {}
    cop_out = False
    for i, topic in enumerate(topics):
        # possible n is key, vals are [mark1, mark2, .. , markN]
        possible_raws = {}

        for n in range(lowest_n, max_n):
            possible_raws[n] = []
            # Gets unique scores to avoid confidence being biased by high frequency
            for sub_perc in list(set(sub_percs[i])):
                possible_raws[n].append(n*sub_perc)
                # print(str(n*sub_perc), end=' ')
            # print('')

        # Worst possible score = sum of decimal parts of sub_percs
        best_score = len(sub_percs[i])
        best_n = None
        best_percs = None
        for possible_n in possible_raws:
            curr_score = 0
            for sub_perc in possible_raws[possible_n]:
                curr_score += sub_perc % 1
            if curr_score < best_score:
                best_score = curr_score
                best_n = possible_n
                best_percs = possible_raws[possible_n]
        if best_n == 100 or best_n == 50:
            # Is a cop out guess
            del results[max_n]
            cop_out = True
            break

        # print(topic, end=' | ')
        # print(best_n, end=', ')
        # print(best_score, end=', ')
        # print(best_percs, end=' ')
        # print()
        # if topic == "HSE":
        #     best_score = 0
        #     best_n = 6
        # elif topic == "Professional Development and Practice":
        #     best_score = 0
        #     best_n = 4
        # elif topic == "Anatomy/Histology":
        #     best_score = 0
        #     best_n = 4
        # elif topic == "Biochemistry":
        #     best_score = 0
        #     best_n = 9
        # elif topic == "Genetics":
        #     best_score = 0
        #     best_n = 6
        # elif topic == "PBL":
        #     best_score = 0
        #     best_n = 27
        # elif topic == "Physiology":
        #     best_score = 0
        #     best_n = 46
        # elif topic == "Microbiology/Immunology":
        #     best_score = 0
        #     best_n = 9
        best_score = best_score/len(sub_percs[0])
        results[max_n][topic] = [best_n, best_score, best_percs]
        estimated_total += best_n
        total_confidence += best_score

    if cop_out:
        continue

    results[max_n]["est_total"] = estimated_total
    results[max_n]["confidence"] = total_confidence
    # print("Estimated total = " + str(estimated_total) + ", Total confidence: " + str(total_confidence))


print("Topic | Total, Confidence(lower = better)")
print("========================================")

nth_guess = 0
average_topic_totals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
for max_n in results:
    # print(results[max_n]["est_total"])
    # if results[max_n]["est_total"] > 115 and results[max_n]["est_total"] < 125:
    if True:
        nth_guess += 1
        print("Guess " + str(nth_guess))
        print("-------")
        for i, topic in enumerate(results[max_n]):
            if topic is not "est_total" and topic is not "confidence":
                print(topic, end=' | ')
            # print(results[max_n][topic])
            if isinstance(results[max_n][topic], list):
                average_topic_totals[i] += results[max_n][topic][0]
                for data in results[max_n][topic]:
                    if not isinstance(data, list):
                        print(data, end=", ")
                print('')
            else:
                # print(results[max_n][topic])
                pass
        # print(results[max_n])
        print("-------")
        print("Estimated total: " + str(results[max_n]["est_total"]) + ', ' + "Confidence: " + str(results[max_n]["confidence"]))
        print("")

# for i, total in enumerate(average_topic_totals):
#     average_topic_totals[i] = total/nth_guess

# scores = []
# for person in sub_percs[0]:
#     scores.append(0)
# for topic_i, topic_result in enumerate(sub_percs):
#     for person_i, result in enumerate(topic_result):
#         scores[person_i] += result*average_topic_totals[topic_i]

# for i, score in enumerate(scores):
#     scores[i] = score/120

# print(scores)
