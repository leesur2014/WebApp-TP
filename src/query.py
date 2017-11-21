import csv

def main():
    my_words = []
    with open('/Users/xuhuiwang/Documents/words.csv', 'rb') as f:
        reader = csv.reader(f)
        for row in reader:
            # print('Number of elements:', len(row))
            # append all nouns
            if 'n' in row[1] and row[0] not in my_words:
                my_words.append((row[0]))

    print("'), ('".join(my_words))


if __name__ == "__main__":
    main()
