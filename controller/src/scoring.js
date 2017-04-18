import _ from 'lodash';

export const maxScore = 1;

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

function getNumCorrect(question, session) {
  let matrix = buildCorrectnessMatrix(question, session.answers);
  return matrix.reduce((acc, { matchSet }) => {
    let correct = matchSet.find(({ correctness }) => correctness === 'correct') !== undefined;
    return acc + (correct ? 1 : 0);
  }, 0);
}

function radioPartialScore(question, session) {
  if (question.partialScoring) {
    let numCorrect = getNumCorrect(question, session);
    if (numCorrect === question.rows.length) {
      return maxScore;
    }
    let scoring = question.partialScoring.find(({ correctCount }) => correctCount === numCorrect);
    return scoring ? (scoring.weight * maxScore) : 0;
  }
  return 0;
}

function getCorrectCount(answerRow, correctResponseRow) {
  return answerRow.matchSet.map((value, index) => [value, correctResponseRow.matchSet[index]]).reduce((acc, [answerValue, correctValue]) =>
    acc + ((answerValue === true && correctValue === true) ? 1 : 0), 0);
}


function checkboxPartialScore(question, session) {
  let { answers } = session;
  if (question.partialScoring) {
    return question.correctResponse.map((correctResponseRow) => {
      let { id, matchSet } = correctResponseRow;
      let answer = answers.find((answer) => answer.id === id);
      if (answer) {
        let correctAnswerCount = getCorrectCount(answer, correctResponseRow);
        let row = question.partialScoring.find((scoring) => scoring.id === id);
        if (row) {
          let scenario = row.scoring.find(({ correctCount }) => correctCount === correctAnswerCount);
          return scenario ? scenario.weight * maxScore : 0;
        }
      }
      return 0;
    }).reduce((a, b) => a + b, 0);
  }
  return 0;
}

function defaultScoring(question, session) {
  let [totalCorrect, responseCorrect] = question.correctResponse.reduce(([totalCorrect, responseCorrect], correctResponseRow) => {
    let { id, matchSet } = correctResponseRow;
    let answerRow = session.answers.find(({ id }) => id === correctResponseRow.id);
    let correctForRow = matchSet.filter(v => v === true).length;
    return [totalCorrect + correctForRow, responseCorrect + (answerRow ? getCorrectCount(answerRow, correctResponseRow) : 0)];
  }, [0, 0]);
  return (totalCorrect === responseCorrect) ? maxScore : 0;
}

function partialScore(question, session) {
  if (question.config.inputType === 'checkbox') {
    return checkboxPartialScore(question, session);
  }
  return radioPartialScore(question, session);
}

export function score(question, session) {
  if (question.partialScoring) {
    return partialScore(question, session);
  }
  return defaultScoring(question, session);
}