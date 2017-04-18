function countWhenTrue(acc, bool) {
  return acc + (bool ? 1 : 0);
}

function countTrueValues(arr) {
  return _.reduce(arr, countWhenTrue, 0);
}

function whereIdIsEqual(id) {
  return function(match) {
    return match.id === id;
  };
}

function makeEmptyAnswerRow(correctRow) {
  var answerRow = _.cloneDeep(correctRow);
  answerRow.matchSet = _.map(answerRow.matchSet, function() {
    return false;
  });
  return answerRow;
}

export function buildCorrectnessMatrix(question, answer) {
  function validateRow(correctRow) {
    let answerRow = _.find(answer, whereIdIsEqual(correctRow.id));
    if (!answerRow) {
      answerRow = makeEmptyAnswerRow(correctRow);
    }
    let zippedMatchSet = _.zip(correctRow.matchSet, answerRow.matchSet);
    let matchSet = zippedMatchSet.map(function(zippedMatches) {
      let correctMatch = zippedMatches[0];
      let answeredMatch = zippedMatches[1];
      let correctness = "";

      if (answeredMatch) {
        correctness = correctMatch ? "correct" : "incorrect";
      } else {
        correctness = "unknown";
      }
      return {
        correctness: correctness,
        value: answeredMatch
      };
    });

    let returnValue = {
      id: correctRow.id,
      matchSet: matchSet
    };

    let numberOfExpectedAnswers = countTrueValues(correctRow.matchSet);
    let numberOfActualAnswers = countTrueValues(answerRow.matchSet);
    let answerExpected = numberOfExpectedAnswers > 0 && numberOfActualAnswers === 0;
    if (answerExpected) {
      returnValue.answerExpected = true;
    }

    return returnValue;
  }

  let matrix = question.correctResponse.map(validateRow);
  return matrix;
}


function radioPartialScore(question, session) {
  if (question.partialScoring) {
    let correctness = buildCorrectnessMatrix(question, session.answer);
    console.log('correctness', correctness);
  }
  return 0;
}

function checkboxPartialScore(question, session) {
  return 0;
}

function partialScore(question, session) {
  if (question.config.inputType === 'checkbox') {
    return checkboxPartialScore(question, session);
  }
  return radioPartialScore(question, session);
}

export function score(question, session) {
  return partialScore(question, session);
}