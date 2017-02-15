import React from 'react';
import { shallow } from 'enzyme';
import { stub, assert } from 'sinon';
import { expect } from 'chai';
import proxyquire from 'proxyquire';
import _ from 'lodash';
import ChoiceInput from '../src/choice-input';
import Checkbox from 'material-ui/Checkbox';
import RadioButton from 'material-ui/RadioButton';
import sinon from 'sinon';

describe('CorespringMatch', () => {

  let wrapper, toggle, CorespringMatch;

  beforeEach(() => {
    toggle = () => {
      return <div>mocked-toggle</div>;
    }

    toggle['@noCallThru'] = true;

    CorespringMatch = proxyquire('../src/corespring-match', {
      'corespring-correct-answer-toggle': toggle
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
          "columns": [
            {
              "labelHtml": "Header"
            },
            {
              "labelHtml": "True"
            },
            {
              "labelHtml": "False"
            }
          ],
          "rows" : [
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
          ],
          "config": {
            "inputType": input
          }
        }
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
        // config.onChange = (session) => {
        //   console.log(JSON.stringify(session, null, 2));
        // };
        it('only the most recent choice is selected', () => {
          let row = wrapper.find('.question-row').forEach((row) => {
            row.find(ChoiceInput).at(0).prop('onChange')({selected: true});
            row.find(ChoiceInput).at(0).prop('onChange')({selected: true});
          });
        });

      });

    });
    
  });

});