import React, { PropTypes } from 'react';
import Checkbox from 'material-ui/Checkbox';
import RadioButton from 'material-ui/RadioButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import muiThemeable from 'material-ui/styles/muiThemeable';
import cloneDeep from 'lodash/cloneDeep';

export class ChoiceInput extends React.Component {

  onCheck(el) {
    this.props.onChange({
      value: this.props.value,
      selected: el.target.checked
    });
  }

  _checked() {
    return (this.props.correct !== undefined) ? this.props.correct : this.props.checked;
  }

  getTheme() {
    let theme = cloneDeep(this.props.muiTheme);
    if (this.props.correctness === 'correct') {
      theme.checkbox.disabledColor = theme.correctColor;
    } else if (this.props.correctness === 'incorrect') {
      theme.checkbox.disabledColor = theme.incorrectColor;
    }
    return theme;
  }

  render() {

    const muiTheme = this.getTheme();
    const Tag = this.props.choiceMode === 'checkbox' ? Checkbox : RadioButton;
    const classSuffix = this.props.choiceMode === 'checkbox' ? 'checkbox' : 'radio';
    /**
     * TODO: should only really have 1 theme provider in the component tree.
     * but the way Checkbox is set up you can't tweak the styles via the props fully.
     * So have to use an additional MuiThemeProvider for now.
     */
    return <div className={"corespring-" + classSuffix}>
      <div className="checkbox-holder">
        <MuiThemeProvider muiTheme={muiTheme}>
          <Tag
            disabled={this.props.disabled}
            checked={this._checked.bind(this)()}
            onCheck={this.onCheck.bind(this)} />
        </MuiThemeProvider>
      </div>
    </div>
  }
};

ChoiceInput.propTypes = {
  choiceMode: React.PropTypes.oneOf(['radio', 'checkbox']),
  choiceMode: PropTypes.string,
  checked: PropTypes.bool,
  correct: PropTypes.bool,
  correctness: PropTypes.string,
  disabled: PropTypes.bool,
  feedback: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string
};


ChoiceInput.defaultProps = {
};

export default muiThemeable()(ChoiceInput);
