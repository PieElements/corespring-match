import React from 'react';
import { shallow } from 'enzyme';
import { stub, assert } from 'sinon';
import { expect } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import _ from 'lodash';
import ChoiceInput from '../src/choice-input';
import Checkbox from 'material-ui/Checkbox';
import RadioButton from 'material-ui/RadioButton';

describe('CorespringMatch', () => {

  let wrapper, toggle, icon, CorespringMatch;

  beforeEach(() => {
    toggle = () => {
      return <div>mocked-toggle</div>;
    };

    icon = () => {
      return <div class="nothing-submitted-icon"/>;
    };

    icon['@noCallThru'] = true;
    toggle['@noCallThru'] = true;

    CorespringMatch = proxyquire('../src/corespring-match', {
      'corespring-correct-answer-toggle': toggle,
      'corespring-icon/nothing-submitted-icon': icon
    }).default;
  })

  let mkWrapper = (opts, clone = true) => {
    opts = clone ? opts = _.merge({
      model: {},
      mode: 'gather'
    }, opts) : opts;

    return shallow(<CorespringMatch
      model={opts.model}
      outcomes={opts.outcomes}
      session={opts.session}
      mode={opts.mode}
      onChange={opts.onChange} />);
  }

  describe('render', () => {

    let rows = [
      {
        "id" : "row-1",
        "labelHtml": "Question text 1"
      },
      {
        "id" : "row-2",
        "labelHtml": "Question text 2"
      },
      {
        "id" : "row-3",
        "labelHtml": "Question text 3"
      },
      {
        "id" : "row-4",
        "labelHtml": "Question text 4"
      }
    ];

    let columns = [
      {
        "labelHtml": "Header"
      },
      {
        "labelHtml": "True"
      },
      {
        "labelHtml": "False"
      }
    ];

    let buildConfig = (input) => {
      return {
        "model": {
          "correctResponse": [
            {
              "id" : "row-1",
              "matchSet" : [true,false]
            },
            {
              "id" : "row-2",
              "matchSet" : [true,false]
            },
            {
              "id" : "row-3",
              "matchSet" : [true,false]
            },
            {
              "id" : "row-4",
              "matchSet" : [true,false]
            }
          ],
          "columns": columns,
          "rows" : rows,
          "config": {
            "inputType": input
          }
        }
      };
    };

    let correctResponse = () => {
      return {
        "correctness": "correct",
        "value": true
      };
    };

    let unknownResponse = () => {
      return {
        "correctness": "unknown",
        "value": false
      }
    };

    let incorrectResponse = () => {
      return {
        "correctness": "incorrect",
        "value": true
      };
    };

    describe('with 4 rows, 2 columns', () => {
      let config = buildConfig('checkbox');

      beforeEach(() => {
        wrapper = mkWrapper(config);
      });

      it('has corespring-match class', () => {
        expect(wrapper.hasClass('corespring-match')).to.equal(true);
      });

      it('has 4 .question-rows', () => {
        expect(wrapper.find('.question-row')).to.have.length(4);
      });

      describe('.header-row', () => {
        it('contains labels from columns in config', () => {
          let header = wrapper.find('.header-row');
          header.find('th').forEach((th, index) => {
            expect(th.text()).to.eql(config.model.columns[index].labelHtml);
          });
        });
      });

      describe('.question-row', () => {

        it('contains label', () => {
          let rows = wrapper.find('.question-row');
          rows.forEach((row, index) => {
            expect(config.model.rows[index].labelHtml)
                .to.eql(row.find('.question-cell').text());
          });
        });

        it('contains 2 ChoiceInputs', () => {
          let rows = wrapper.find('.question-row');
          rows.forEach((row) => {
            expect(row.find(ChoiceInput).length).to.eql(2);
          });
        });

      });

    });

    describe('with radio input', () => {
      let config = buildConfig('radio');
      let session = {};

      beforeEach(() => {
        config.session = session;
        wrapper = mkWrapper(config);
      });

      describe('when two choices in a row are clicked', () => {
        var callback = sinon.spy();
        config.onChange = callback;
        it('only the most recent choice is selected', () => {
          let row = wrapper.find('.question-row').forEach((row, index) => {
            row.find(ChoiceInput).at(0).prop('onChange')({selected: true});
            row.find(ChoiceInput).at(1).prop('onChange')({selected: true});
            let session = callback.lastCall.args[0];
            let matchSet = session.answers[index].matchSet;
            expect(matchSet[0]).to.eql(false);
            expect(matchSet[1]).to.eql(true);
          });
        });

      });

    });

    describe('with checkbox input', () => {
      let config = buildConfig('checkbox');
      let session = {};

      beforeEach(() => {
        config.session = session;
        wrapper = mkWrapper(config);
      });

      describe('when two choices in a row are clicked', () => {
        var callback = sinon.spy();
        config.onChange = callback;
        it('both choices are selected', () => {
          let row = wrapper.find('.question-row').forEach((row, index) => {
            row.find(ChoiceInput).at(0).prop('onChange')({selected: true});
            row.find(ChoiceInput).at(1).prop('onChange')({selected: true});
            let session = callback.lastCall.args[0];
            let matchSet = session.answers[index].matchSet;
            expect(matchSet[0]).to.eql(true);
            expect(matchSet[1]).to.eql(true);
          });
        });

      });

    });

    describe('all unanswered rows', () => {
      let correctnessMatrix = [
        {
          answerExpected: true,
          matchSet: [false, false]
        },
        {
          answerExpected: true,
          matchSet: [false, false]
        },
        {
          answerExpected: true,
          matchSet: [false, false]
        },
        {
          answerExpected: true,
          matchSet: [false, false]
        }
      ];

      let config = _.merge(buildConfig('checkbox'), {
        model: {
          numAnswers: 0,
          correctnessMatrix: correctnessMatrix
        }
      });

      beforeEach(() => {
        config.session = {};
        config.mode = 'evaluate';
        wrapper = mkWrapper(config);
      });

      it('should contain .warning-holder', () => {
        expect(wrapper.find('.warning-holder').length).to.eql(correctnessMatrix.length);
      });

      it('should not display .correct-answer-toggle', () => {
        expect(wrapper.find('.correct-answer-toggle').length).to.eql(0);
      });

    });

    describe('rows with correct answers', () => {

      let correctnessMatrix = [
        {
          id: 'row-1',
          matchSet: [correctResponse(), unknownResponse()]
        }, {
          id: 'row-2',
          matchSet: [correctResponse(), unknownResponse()]          
        }, {
          id: 'row-3',
          matchSet: [correctResponse(), unknownResponse()]          
        }, {
          id: 'row-4',
          matchSet: [correctResponse(), unknownResponse()]          
        }
      ];

      let config = _.merge(buildConfig('checkbox'), {
        model: {
          numAnswers: 1,
          correctness: 'correct',
          correctnessMatrix: correctnessMatrix
        }
      });

      beforeEach(() => {
        config.session = {};
        config.mode = 'evaluate';
        wrapper = mkWrapper(config);
      });

      it('should not display .correct-answer-toggle', () => {
        expect(wrapper.find('.correct-answer-toggle').length).to.eql(0);
      });

      it('adds correct class to cells with correct response', () => {
        expect(wrapper.find('.correct').length).to.eql(4);
      });

    });


    describe('rows with incorrect answers', () => {

      let correctnessMatrix = [
        {
          id: 'row-1',
          matchSet: [unknownResponse(), incorrectResponse()]
        }, {
          id: 'row-2',
          matchSet: [unknownResponse(), incorrectResponse()]          
        }, {
          id: 'row-3',
          matchSet: [unknownResponse(), incorrectResponse()]          
        }, {
          id: 'row-4',
          matchSet: [unknownResponse(), incorrectResponse()]          
        }
      ];

      let config = _.merge(buildConfig('checkbox'), {
        model: {
          numAnswers: 1,
          correctness: 'incorrect',
          correctnessMatrix: correctnessMatrix
        }
      });

      beforeEach(() => {
        config.session = {};
        config.mode = 'evaluate';
        wrapper = mkWrapper(config);
      });

      it('should display .correct-answer-toggle', () => {
        expect(wrapper.find('.correct-answer-toggle').length).to.eql(1);
      });

      it('adds incorrect class to cells with incorrect response', () => {
        expect(wrapper.find('.incorrect').length).to.eql(4);
      });

      describe('showCorrect is toggled', () => {
        beforeEach(() => {
          wrapper.setState({showCorrect: true});          
        });
        
        it('does not display .incorrect', () => {
          expect(wrapper.find('.incorrect').length).to.eql(0);
        });

        it('displays .correct', () => {
          expect(wrapper.find('.correct').length).to.eql(4);
        });
      });

    });
    
  });

});