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

import FeedbackConfig from './feedback-config';

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
        return this.MIN_COLUMNS;
    }
  }

  set model(m) {
    console.log('calling setModel');
    this._model = m;
  }

  connectedCallback() {
    this.dispatchEvent(new CustomEvent('pie.register', { bubbles: true }));
  }

  _addRow() {

  }

  _removeRow(index) {

  }
  render() {
    let theme = getMuiTheme({});
    return <MuiThemeProvider muiTheme={theme}>
      <div className="corespring-match-config-root">
        <Tabs>
          <Tab label="Design">
            <p>
              In Choice Matrix, students associate choices in the first column with options in the adjacent 
              rows. This interaction allows for either one or more correct answers. Setting more than one 
              answer as correct allows for partial credit (see the Scoring tab).
            </p>
            <SelectField floatingLabelText="Layout" value={this.props.model.config.layout} onChange={this.props.onLayoutChanged.bind(this)}>
              <MenuItem value="three-columns" primaryText="3 Columns"/>
              <MenuItem value="four-columns" primaryText="4 Columns"/>
              <MenuItem value="five-columns" primaryText="5 Columns"/>
            </SelectField>
            <SelectField floatingLabelText="Response Type" value={this.props.model.config.inputType} onChange={this.props.onInputTypeChanged}>
              <MenuItem value="radio" primaryText="Radio - One Answer"/>
              <MenuItem value="checkbox" primaryText="Checkbox - Multiple Answers"/>
            </SelectField>
            <p>
              Click on the labels to edit or remove. Set the correct answers by clicking each correct
              answer per row.
            </p>
            <table>
              <thead>
                <tr>
                  {
                    this.props.model.columns.map((column, index) => {
                      return <th key={index}>
                        <TextField name={`col-${index}`} value={this.props.model.columns[index].labelHtml} onChange={this.modelUpdated} />
                      </th>;
                    })
                  }
                </tr>
              </thead>
              <tbody>
                {
                  this.props.model.rows.map((row, index) => {
                    return <tr key={index}>
                      </tr>;
                  })
                }
              </tbody>
            </table>
            <RaisedButton label="+ Add a row"/>
            <Checkbox label="Shuffle Choices"/>
            <FeedbackConfig/>
          </Tab>
          <Tab label="Scoring">
            <div>
              Scoring!
            </div>
          </Tab>
        </Tabs>
      </div>
    </MuiThemeProvider>;
  }

}

Main.MIN_COLUMNS = 3;

export default Main;