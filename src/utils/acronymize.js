const acronymize = (string, specialCase) => {
  if (specialCase) {
    for (var index in specialCase) {
      if (string === specialCase[index].input) {
        return specialCase[index].output;
      }
    }
  }

  var words, acronym, nextWord;

  words = string.split(" ");
  acronym = "";
  var index = 0;
  while (index < words.length) {
    nextWord = words[index];
    acronym = acronym + nextWord.charAt(0);
    index = index + 1;
  }
  return acronym;
};

export default acronymize;
