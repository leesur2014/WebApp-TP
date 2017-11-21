# render and extract all words in csv file
import csv

def main():
    with open('/Users/xuhuiwang/Documents/words.csv', 'rb') as f:
        reader = csv.reader(f)
        for row in reader:
            print('Number of elements:', len(row))
            print ', '.join(row)
if __name__ == "__main__":
    main()
