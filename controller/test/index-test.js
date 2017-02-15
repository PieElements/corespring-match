import * as controller from '../src/index';
import chai from 'chai';
import shallowDeepEqual from 'chai-shallow-deep-equal';
import _ from 'lodash';

chai.use(shallowDeepEqual);

const expect = chai.expect;

describe('index', () => {

  let question = (fields) => {
    fields = fields || {};
    return _.merge({
      "columns": [
        {
          "labelHtml": "great"
        }
      ]
    }, fields);
  }

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
          console.log('model', 'wat');
          if (_.isFunction(partialExpected) && partialExpected.name === 'Error') {
            done();
          } else {
            done(exception);
          }
        });
      }
    }

  it('is dope', assertModel(question(), {}, {}, {"columns": [{"labelHtml": "greattoaco"}]}));
});