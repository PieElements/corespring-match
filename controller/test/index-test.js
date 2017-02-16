import * as controller from '../src/index';
import chai from 'chai';
import shallowDeepEqual from 'chai-shallow-deep-equal';
import _ from 'lodash';

chai.use(shallowDeepEqual);

const expect = chai.expect;

describe('index', () => {

  let env = (mode) => {
    return {
      "accessibility": {
        "colorContrast": "black_on_white"
      },
      "lang": "en-US",
      "mode": mode
    };
  };

  let columns = [
    {
      "labelHtml": "True"
    },
    {
      "labelHtml": "False"
    }
  ];

  let rows = [
    {
      "id": "row-1",
      "labelHtml": "Question 1"
    },
    {
      "id": "row-2",
      "labelHtml": "Question 2"
    }
  ];

  let correctResponse = [
    {
      "id": "row-1",
      "matchSet": [true, false]
    },
    {
      "id": "row-2",
      "matchSet": [false, true]
    }
  ];

  let config = {
    inputType: 'checkbox'
  };

  let question = (fields) => {
    fields = fields || {};
    return _.merge({
      "columns": columns,
      "rows": rows,
      "config": config,
      "correctResponse": correctResponse
    }, fields);
  };

  let correctSession = (question) => {
    return {
      answers: question.correctResponse.map((row) => {
        return {
          id: row.id,
          matchSet: row.matchSet
        };
      })
    };
  };

  let numberOfAnswers = (session) => {
    return _(session.answers).map('matchSet').flatten().countBy((value) => { return value === true; }).value()[true];
  }

  let correctnessMatrix = (question) => {
    return question.correctResponse.map((row) => {
      return {
        id: row.id,
        matchSet: row.matchSet.map((value) => {
          return {
            correctness: value === true ? 'correct' : 'unknown',
            value: value
          };
        })
      }; 
    });
  };

  let assertModel = (question, session, env, partialExpected) => {
    return (done) => {
      controller.model(question, session, env)
        .then(model => {
          if (_.isFunction(partialExpected)) {
            partialExpected(model);
          } else {
            expect(model).to.shallowDeepEqual(partialExpected);
          }
          done();
        })
        .catch(exception => {
          if (_.isFunction(partialExpected) && partialExpected.name === 'Error') {
            done();
          } else {
            done(exception);
          }
        });
      }
    };

  let assertModelNot = (question, session, env, field) => {
    return (done) => {
      controller.model(question, session, env)
        .then(model => {
          expect(model[field]).to.equal(undefined);
          done();
        })
        .catch(exception => {
          done(exception);
        });
      }
    };

  let returnsBasicProperties = (env) => {
    it('returns env', assertModel(question(), {}, env, {"env": env}));
    it('returns columns', assertModel(question(), {}, env, {"columns": columns}));
    it('returns rows', assertModel(question(), {}, env, {"rows" : rows}));
    it('returns config', assertModel(question(), {}, env, {"config": config}));
  }

  let gather = env('gather');
  returnsBasicProperties(gather);

  it('does not return correctnessMatrix', assertModelNot(question(), {}, gather, "correctnessMatrix"));
  it('does not return numAnswers', assertModelNot(question(), {}, gather, "numAnswers"));
  it('does not return correctResponse', assertModelNot(question(), {}, gather, "correctResponse"));

  describe('mode is evaluate', () => {
    let evaluate = env('evaluate');
    returnsBasicProperties(evaluate);

    describe('session.answers is empty', () => {
      it('returns empty correctnessMatrix', assertModel(question(), {}, evaluate, {"correctnessMatrix": {}}));
      it('returns numAnswers = 0', assertModel(question(), {}, evaluate, {numAnswers: 0}));
      it('returns correctResponse', assertModel(question(), {}, evaluate, {correctResponse: correctResponse}));
    });

    describe('session contains answers', () => {      
      let session = correctSession(question());
      it('returns correctResponse', assertModel(question(), session, evaluate, {correctResponse: correctResponse}));
      it('returns correctnessMatrix', assertModel(question(), session, evaluate, {"correctnessMatrix": correctnessMatrix(question())}));
      it('returns numAnswers', assertModel(question(), session, evaluate, {"numAnswers": numberOfAnswers(session)}));
    });

  });

  describe('mode is view', () => {
    let view = env('view');
    returnsBasicProperties(view);

    it('does not return correctnessMatrix', assertModelNot(question(), {}, gather, "correctnessMatrix"));
    it('does not return numAnswers', assertModelNot(question(), {}, gather, "numAnswers"));
    it('does not return correctResponse', assertModelNot(question(), {}, gather, "correctResponse"));
  });

});