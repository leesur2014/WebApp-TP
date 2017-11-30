def main():
    with open('words.txt') as f:
        for line in f:
            line = line.strip()
            if line:
                print("INSERT INTO dictionary VALUES ('{}');".format(line))

if __name__ == "__main__":
    main()
