import React, { PropTypes } from 'react';
import CorespringCorrectAnswerToggle from 'corespring-correct-answer-toggle';

import update from 'immutability-helper';
import * as _ from 'lodash';
import ChoiceInput from './choice-input.jsx';
import SvgIcon from 'corespring-icon';

export default class CorespringMatch extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      showCorrect: false
    };
  }

  componentWillMount(props) {
    this.setState({
      model: this._prepareModel() 
    });
  }

  _className() {
    return 'corespring-match-table';
  }

  _prepareModel() {
    const $log = console;
    const YES_LABEL = 'Yes';
    const YES_NO = 'YES_NO';
    const TRUE_FALSE = 'TRUE_FALSE';
    const TRUE_LABEL = 'True';
    const FALSE_LABEL = 'False';


    let self = this;

    let prepareColumns = () => {
      let columns = _.cloneDeep(self.props.model.columns);
      let answerType = self.props.model.answerType;
      if (answerType === YES_NO || answerType === TRUE_FALSE) {
        if (columns.length !== 3) {
          $log.warn('Match interaction with boolean answer type should have 2 columns, found ' + columns.length);
          while (columns.length < 3) {
            columns.push({
              labelHtml: ''
            });
          }
        }
        if (_.isEmpty(columns[1].labelHtml)) {
          columns[1].labelHtml = answerType === TRUE_FALSE ? TRUE_LABEL : YES_LABEL;
        }
        if (_.isEmpty(columns[2].labelHtml)) {
          columns[2].labelHtml = answerType === TRUE_FALSE ? FALSE_LABEL : NO_LABEL;
        }
      }

      function isDefaultLabel(s){
        switch(s){
          case "Custom header":
          case "Column 1":
          case "Column 2":
          case "Column 3":
          case "Column 4":
          case "Column 5":
            return true;
          default:
            return false;
        }
      }

      _.forEach(columns, function(col, index) {
        col.cssClass = index === 0 ? 'question-header' : 'answer-header';
        col.labelHtml = isDefaultLabel(col.labelHtml) ? '' : col.labelHtml;
      });

      return columns;
    };


    let whereIdIsEqual = (id) => {
      return function(match) {
        return match.id === id;
      };
    };

    let prepareRows = () => {
      let createMatchSetFromSession = (id) => {
        return _.find(self.props.session.answers, whereIdIsEqual(id))
          .matchSet.map((match) => {
            return {
              value: match
            };
          });
      };

      let createEmptyMatchSet = (length) => {
        return _.range(length).map(() => {
          return {
            value: false
          };
        });
      };

      let answersExist = (self.props.session && self.props.session.answers);
      let rows = self.props.model.rows.map((row) => {
        let cloneRow = _.cloneDeep(row);
        cloneRow.matchSet = answersExist === true ? createMatchSetFromSession(row.id) : createEmptyMatchSet(self.props.model.columns.length - 1);
        return cloneRow;
      });
      return rows;
    };

    return {
      columns: prepareColumns(),
      rows: this.props.model.shuffle ? _.shuffle(prepareRows()) : prepareRows()
    };
  }

  change(rowIndex, columnIndex, value) {
    let stateToSession = (state) => {
      return state.model.rows.map(row => {
        return {
          id: row.id,
          matchSet: row.matchSet.map(match => match.value)
        };
      });
    };

    let callback = () => {
      this.props.session.answers = stateToSession(this.state);
      this.props.onChange(this.props.session);
    };

    if (this.props.model.config.inputType === 'radio') {
      let row = Array.apply(null, Array(this.props.model.columns.length - 1)).map((a, index) => {return {value: (index === columnIndex) };});
      this.setState(update(this.state, { model: { rows: { [rowIndex] : { matchSet: { "$set": row } } } } }), callback);
    } else {
      this.setState(update(this.state, { model: { rows: { [rowIndex] : { matchSet: { [columnIndex] : { value: { "$set": value } } } } } } }), callback);      
    }
  }

  onToggle() {
    if (this.props.mode === 'evaluate') {
      this.setState(update(this.state, {showCorrect: {"$set" : !this.state.showCorrect}}));
    }
  }

  render() {
    let self = this;
    let rows = this.state.model.rows;
    let columns = this.state.model.columns;
    let disabled = this.props.mode !== 'gather';
    let showCorrect = (this.props.mode === 'evaluate' && this.state.showCorrect);

    let correctness = (rowIndex, columnIndex) => {
      if (showCorrect) {
        return this.props.model.correctResponse[rowIndex].matchSet[columnIndex] ? 'correct' : undefined;
      } else if (this.props.model.correctnessMatrix) {
        return this.props.model.correctnessMatrix[rowIndex].matchSet[columnIndex].correctness;
      }
      return undefined;
    };

    let answerExpected = (rowIndex) => {
      return !showCorrect && (this.props.model.correctnessMatrix && this.props.model.correctnessMatrix[rowIndex].answerExpected);
    }

    let checked = (rowIndex, columnIndex) => {
      if (showCorrect) {
        return this.props.model.correctResponse[rowIndex].matchSet[columnIndex];
      } else {
        return rows[rowIndex].matchSet[columnIndex].value;
      }
    };

    let showToggle = this.props.mode === 'evaluate' && this.props.model.numAnswers !== 0;

    return <div className="corespring-match">
      <CorespringCorrectAnswerToggle
        show={showToggle}
        toggled={this.state.showCorrect}
        onToggle={this.onToggle.bind(this)} />
      <table className={self._className()}>
        <thead>
          <tr className="header-row">
          {
            columns.map((column, index) => {
              return <th colSpan={index?1:2} key={index}>{column.labelHtml}</th>;
            })
          }
          </tr>
        </thead>
        <tbody>
          { 
            rows.map((row, rowIndex) => {
              return <tr className="question-row" key={rowIndex}>
                <td className="question-cell match-td-padded">{row.labelHtml}</td>
                <td className="answer-expected-warning match-td-padded">
                {
                  (answerExpected(rowIndex)) ?
                    <div className="warning-holder">
                        <SvgIcon category="feedback" iconKey="nothing-submitted" shape="square" iconSet="emoji"/>
                    </div> :
                    <div></div>
                }
                </td>
                {
                  row.matchSet.map((match, columnIndex) => {
                    return <td className="answer-cell match-td-padded" key={columnIndex}>
                      <ChoiceInput
                          choiceMode={self.props.model.config.inputType}
                          checked={checked(rowIndex, columnIndex)}
                          disabled={disabled}
                          correctness={correctness(rowIndex, columnIndex)}
                          onChange={(result) => { self.change(rowIndex, columnIndex, result.selected); }}
                        />
                    </td>;
                  })
                }
              </tr>;
            })
          }
        </tbody>
      </table>
    </div>;
  }

}

CorespringMatch.propTypes = {
  mode: PropTypes.oneOf(['gather', 'view', 'evaluate']),
  model: PropTypes.object,
  outcomes: PropTypes.array,
  session: PropTypes.object,
  onChange: PropTypes.func
};

CorespringMatch.defaultProps = {
  session: {
    answers: {}
  }
};