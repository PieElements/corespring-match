import { expect } from 'chai';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

import { score, maxScore } from '../src/scoring';

describe('score', () => {

  let baseQuestion = {
    rows: [
      { id: 'row-1', labelHtml: 'Row 1' },
      { id: 'row-2', labelHtml: 'Row 2' },
      { id: 'row-3', labelHtml: 'Row 3' }
    ]
  };

  describe('partial scoring', () => {

    describe('for radio buttons', () => {
      let partialScoring = [
        { correctCount: 1, weight: 0.5 },
        { correctCount: 2, weight: 0.75 }
      ];

      let question = merge(cloneDeep(baseQuestion), {
        correctResponse: [
          { id: "row-1", matchSet: [ true, false, false ] }, 
          { id: "row-2", matchSet: [ false, true, false ]}, 
          { id: "row-3", matchSet: [ true, false, false ]}
        ],
        config: {
          inputType: 'radio'
        },
        partialScoring: partialScoring
      });

      let sessionForCorrectCount = (num) => {
        let rv = question.correctResponse.slice(0);
        return {
          answers: rv.slice(0, num)
        };
      };

      describe('no answers are correct', () => {
        it('returns 0', () => {
          let session = sessionForCorrectCount(0);
          expect(score(question, session)).to.equal(0);
        });
      });

      [1, 2].forEach((n) => {
        describe(`${n} < total correct are correct`, () => {
          it('returns partialScoring weight * maxScore', () => {
            let session = sessionForCorrectCount(n);
            expect(score(question, session)).to.equal(
              maxScore * partialScoring.find(({ correctCount }) => correctCount === n).weight);
          });
        });
      });

      describe('all answers are correct', () => {
        it('returns maxScore', () => {
          let session = sessionForCorrectCount(question.correctResponse.length);
          expect(score(question, session)).to.equal(maxScore);
        });
      });

    });

    describe('for checkboxes', () => {
      
      let partialScoring = [
        {
          id: 'row-1',
          scoring: [
            { correctCount: 1, weight: Math.random() },
            { correctCount: 2, weight: Math.random() }
          ]
        },
        {
          id: 'row-2',
          scoring: [
            { correctCount: 1, weight: Math.random() },
            { correctCount: 2, weight: Math.random() }
          ]
        },
        {
          id: 'row-3',
          scoring: [
            { correctCount: 1, weight: Math.random() },
            { correctCount: 2, weight: Math.random() }
          ]
        }
      ];

      let question = merge(cloneDeep(baseQuestion), {
        correctResponse: [
          { id: "row-1", matchSet: [ true, true, false, true ] }, 
          { id: "row-2", matchSet: [ true, true, true, false ]}, 
          { id: "row-3", matchSet: [ true, false, true, true ]}
        ],
        config: {
          inputType: 'checkbox'
        },
        partialScoring: partialScoring
      });

      let sessionFor = (correctCounts) => {
        return {
          answers: question.correctResponse.map((response, index) => {
            return {
              id: response.id,
              matchSet: response.matchSet.reduce((acc, value) => {
                let correctCount = acc.filter(v => v === true).length;
                acc.push(value === true && correctCount < correctCounts[index]);
                return acc;
              }, [])
            };
          })
        };
      };
      
      it('returns sum of correct count partial scoring for all rows', () => {
        let correctCounts = [1,2,1];
        let session = sessionFor(correctCounts);
        let sumOfPartialScoreCounts = correctCounts.reduce((acc, count, index) => 
          acc + partialScoring[index].scoring.find(({ correctCount }) => count === correctCount).weight, 0);
        expect(score(question, session)).to.equal(sumOfPartialScoreCounts);
      });

    });


  });

});