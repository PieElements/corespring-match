import * as _ from 'lodash';

function countWhenTrue(acc, bool) {
  return acc + (bool ? 1 : 0);
}

const colorMap = {
  black_on_rose: 'black-on-rose',
  white_on_black: 'white-on-black',
  black_on_white: 'default'
};

const Feedback = {
  defaults: {
    correct: "Correct!",
    incorrect: "Good try but that is not the correct answer",
    partial: "Almost!",
    notChosen: "This answer is correct",
    warning: "You did not enter a a response."
  }
}

function getFeedback(question, answer, settings, numAnswered, numAnsweredCorrectly, totalCorrectAnswers) {
  function getCorrectness() {
    console.log('numAnswered', numAnswered);
    return (numAnswered === 0) ? 'warning' : (numAnsweredCorrectly === totalCorrectAnswers) ? 'correct' : (
      (numAnsweredCorrectly > 0) ? 'partial' : 'incorrect'
    );
  }
  
  function getFeedbackMessage(correctness) {
    let key = `${correctness}FeedbackType`;
    let feedback = question.feedback;
    let feedbackType = (feedback && feedback[key]) ? feedback[key] : 'default';

    switch(feedbackType) {
      case 'custom':
        return feedback[`${correctness}Feedback`];
      case 'default':
        return Feedback.defaults[correctness];
      default:
        return undefined;
    }
  }

  let correctness = getCorrectness();
  return {
    correctness: correctness,
    feedback: getFeedbackMessage(correctness)
  };
}

function countIncorrect(acc, correct_answer_pair) {
  var correct = correct_answer_pair[0];
  var answer = correct_answer_pair[1];
  return countWhenTrue(acc, answer && !correct);
}

function countWhenTrueAndCorrect(acc, correct_answer_pair) {
  var correct = correct_answer_pair[0];
  var answer = correct_answer_pair[1];
  return countWhenTrue(acc, answer && correct);
}


function countCorrectAnswers(answer, correctAnswer) {
  return _.reduce(answer, function(acc1, answerRow) {
    let correctMatchSet = _.find(correctAnswer, function(correctRow) {
      return correctRow.id === answerRow.id;
    }).matchSet;

    let zippedMatchSet = _.zip(correctMatchSet, answerRow.matchSet);
    let numIncorrect = _.reduce(zippedMatchSet, countIncorrect, 0);

    return acc1 + ((0 === numIncorrect) ?
        _.reduce(zippedMatchSet, countWhenTrueAndCorrect, 0) : 0);
  }, 0);
}

export function outcome(question, session) {

  return new Promise((resolve) => {
    let numAnsweredCorrectly = countCorrectAnswers(session.answers, question.correctResponse);
    let totalCorrectAnswers = countCorrectAnswers(question.correctResponse, question.correctResponse);
    let response = {
      score: {
        scaled: numAnsweredCorrectly / totalCorrectAnswers
      }
    };
    resolve(response);
  });

}

export function model(question, session, env) {

  function countTrueValues(arr) {
    return _.reduce(arr, countWhenTrue, 0);
  }

  function numberOfAnswers(answer) {
    if (!answer) {
      return 0;
    }
    var sum = _.reduce(answer, function(sum, row) {
      return sum + countTrueValues(row.matchSet);
    }, 0);

    return sum;
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

  function buildCorrectnessMatrix(question, answer) {
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

  return new Promise((resolve) => {
    let response = {};
    response.env = env;
    response.columns = question.columns;
    response.rows = question.rows || [];
    response.config = question.config;

    if (env.mode === 'evaluate') {
      let numAnswered = numberOfAnswers(session.answers);

      if (session !== undefined) {
        let numAnsweredCorrectly = countCorrectAnswers(session.answers, question.correctResponse);
        let totalCorrectAnswers = countCorrectAnswers(question.correctResponse, question.correctResponse); 
        response.correctness = (numAnsweredCorrectly === totalCorrectAnswers) ? 'correct' : 'incorrect';

        let settings = {showFeedback: true};
        let feedback = getFeedback(question, session.answers, settings, numAnswered, numAnsweredCorrectly, totalCorrectAnswers);
        _.merge(response, feedback);
      }

      response.correctnessMatrix = buildCorrectnessMatrix(question, session.answers);
      response.numAnswers = numAnswered;
      response.correctResponse = question.correctResponse;
    }

    if (env.accessibility && env.accessibility.colorContrast && colorMap[env.accessibility.colorContrast]) {
      response.className = colorMap[env.accessibility.colorContrast];
    }

    resolve(response);
  });

}