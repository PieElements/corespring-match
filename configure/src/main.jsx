import _ from 'lodash';
import React from 'react';
import ReactDom from 'react-dom';
import {Tabs, Tab} from 'material-ui/Tabs';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';
import IconButton from 'material-ui/IconButton';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';

import ChoiceInput from 'choice-input';
import EditableHTML from 'corespring-editable-html';
import FeedbackConfig from 'corespring-feedback-config/src/index.jsx';
import PartialScoringConfig from 'corespring-scoring-config/src/index.jsx';
import MultiPartialScoringConfig from './multi-partial-scoring-config';

require('./index.less');

injectTapEventPlugin();

class Main extends React.Component {

  constructor(props) {
    super(props);
  }

  _getNumberOfColumnsForLayout(layout) {
    switch (layout) {
      case 'four-columns':
        return 4;
      case 'five-columns':
        return 5;
      default:
        return Main.MIN_COLUMNS;
    }
  }

  _addRowToCorrectResponseMatrix(rowId) {
    let createEmptyMatchSet = (length) => {
      return _.range(length).map(function() {
        return false;
      });
    }

    let matchSet = createEmptyMatchSet(this.props.model.columns.length - 1);
    this.props.model.correctResponse.push({
      id: rowId,
      matchSet: matchSet
    });
  }

  _addRow(event) {
    let findFreeRowSlot = () => {
      let slot = 1;
      let rows = _.map(this.props.model.rows, 'id');
      while (_.includes(rows, `row-${slot}`)) {
        slot++;
      }
      return slot;
    };
    let slot = findFreeRowSlot();

    this.props.model.rows.push({
      id: `row-${slot}`,
      labelHtml: `Question text ${slot}`
    });
    this._addRowToCorrectResponseMatrix(`row-${slot}`)
    this.props.onRowsChanged(event, this.props.model.rows);
  }

  _deleteRow(index) {
    this.props.model.rows.splice(index, 1);
    this.props.onRowsChanged(event, this.props.model.rows);
  }

  edit(index) {
    console.log(`edit ${index}`);
  }

  onQuestionChange(index, html) {
    this.props.model.rows[index].labelHtml = html;
    this.props.onRowsChanged(event, this.props.model.rows);
  }

  onHeaderChange(index, html) {
    this.props.model.columns[index].labelHtml = html;
    this.props.onColumnsChanged(event, this.props.model.columns);
  }

  onFeedbackChange(feedback) {
    this.props.model.feedback = feedback;
    this.props.onFeedbackChanged(this.props.model.feedback);
  }

  onPartialScoringChange(partialScoring) {
    this.props.onPartialScoringChanged(partialScoring);
  }

  _sumCorrectAnswers() {
    let total = _.reduce(this.props.model.correctResponse, (sum, row) => {
      return sum + ((row.matchSet && row.matchSet.indexOf(true) >= 0) ? 1 : 0);
    }, 0);
    return total;
  }

  setCorrect(rowId, columnIndex, value) {
    let row = _.find(this.props.model.correctResponse, (row) => {
      return row.id === rowId;
    });
    if (row !== undefined) {
      if (this.props.model.config.inputType === 'radio') {
        row.matchSet = _.times(this.props.model.columns.length - 1, _.constant(false));
      }
      row.matchSet[columnIndex] = value.selected;
    }
    this.props.onCorrectChanged(this.props.model.correctResponse);
  }

  onInputTypeChanged(event, value, three) {
    this.props.onInputTypeChanged(event, value, three);
  }

  render() {
    let theme = getMuiTheme({});
    return <MuiThemeProvider muiTheme={theme}>
      <div className="corespring-match-config-root">
        <Tabs>
          <Tab label="Design">
            <div className="design-tab">
              <p>
                In corespring-match, students associate choices in the first column with options in the adjacent 
                rows. This interaction allows for either one or more correct answers. Setting more than one 
                answer as correct allows for partial credit (see the Scoring tab).
              </p>
              <SelectField floatingLabelText="Layout" value={this.props.model.config.layout} onChange={this.props.onLayoutChanged}>
                <MenuItem value="three-columns" primaryText="3 Columns"/>
                <MenuItem value="four-columns" primaryText="4 Columns"/>
                <MenuItem value="five-columns" primaryText="5 Columns"/>
              </SelectField>
              <SelectField floatingLabelText="Response Type" value={this.props.model.config.inputType} onChange={this.onInputTypeChanged.bind(this)}>
                <MenuItem value={Main.InputTypes.Radio} primaryText="Radio - One Answer"/>
                <MenuItem value={Main.InputTypes.Checkbox} primaryText="Checkbox - Multiple Answers"/>
              </SelectField>
              <p>
                Click on the labels to edit or remove. Set the correct answers by clicking each correct
                answer per row.
              </p>
              <table>
                <thead>
                  <tr className="corespring-match-row">
                    {
                      this.props.model.columns.map((column, columnIndex) => {
                        return <th key={columnIndex}>
                          <EditableHTML model={this.props.model.columns[columnIndex].labelHtml} placeholder={`Column ${columnIndex + 1}`} onChange={this.onHeaderChange.bind(this, columnIndex)} />
                        </th>;
                      })
                    }
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {
                    this.props.model.rows.map((row, rowIndex) => {
                      return <tr className="corespring-match-row" key={rowIndex}>
                          <td>
                            <EditableHTML model={row.labelHtml} placeholder="Question text" onChange={this.onQuestionChange.bind(this, rowIndex)} />
                          </td>
                          {
                            this.props.model.columns.slice(1, this.props.model.columns.length).map((column, columnIndex) => {
                              return <td className="answer-col" key={columnIndex}>
                                <ChoiceInput choiceMode={this.props.model.config.inputType} 
                                  onChange={this.setCorrect.bind(this, row.id, columnIndex)}
                                  checked={this.props.model.correctResponse[rowIndex].matchSet[columnIndex]}/>
                              </td>;
                            })
                          }
                          <td><IconButton onClick={this._deleteRow.bind(this, rowIndex)}><ActionDelete/></IconButton></td>
                        </tr>;
                    })
                  }
                </tbody>
              </table>
              <div className="add-row">
                <RaisedButton label="+ Add a row" onClick={this._addRow.bind(this)}/>
              </div>
              <div className="shuffle">
                <Checkbox label="Shuffle Choices" value={this.props.model.config.shuffle} onCheck={this.props.onShuffleChanged}/>
              </div>
              <FeedbackConfig 
                feedback={this.props.model.feedback} 
                onChange={this.onFeedbackChange.bind(this)}
                defaultCorrectFeedback="Correct"
                defaultPartialFeedback="Almost!"
                defaultIncorrectFeedback="Incorrect" />
            </div>
          </Tab>
          <Tab label="Scoring">
            <div className="scoring-tab">{
                (this.props.model.config.inputType === Main.InputTypes.Radio) ? (
                  <PartialScoringConfig 
                    numberOfCorrectResponses={this._sumCorrectAnswers()}
                    partialScoring={this.props.model.partialScoring}
                    onPartialScoringChange={this.onPartialScoringChange.bind(this)} />
                ) : (this.props.model.config.inputType === Main.InputTypes.Checkbox) ? (
                  <MultiPartialScoringConfig
                    headerText="If there is more than one correct answer per row, you may allow partial credit based on the number of correct answers submitted per row. This is optional."
                    onPartialScoringChange={this.onPartialScoringChange.bind(this)}
                  />
                ) : 
                  <div/>
              }
            </div>
          </Tab>
        </Tabs>
      </div>
    </MuiThemeProvider>;
  }

}

Main.MIN_COLUMNS = 3;

Main.InputTypes = {
  Checkbox: 'checkbox',
  Radio: 'radio'
};

export default Main;