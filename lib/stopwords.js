class Stopwords {
  constructor(words) {
    this.dictionary = {};
    words.forEach((word) => {
      this.dictionary[word] = true;
    });
  }

  isNotStopword(token) {
    return !this.dictionary[token];
  }

  isStopword(token) {
    return !!this.dictionary[token];
  }

  removeStopwords(tokens) {
    return tokens.filter((x) => this.isNotStopword(x));
  }
}

module.exports = { Stopwords };
