import React from 'react';
import {merge, clone} from 'lodash';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import EditableHTML from './editable-html';

require('./feedback.less');

class FeedbackSelector extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      feedback: this.props.feedback,
      feedbackType: this.props.feedbackType
    }
  }
  
  feedbackTypeChange(event, feedbackType) {
    this.setState({feedbackType: feedbackType});
    this.onChange({
      feedbackType: feedbackType,
      feedback: this.state.feedback
    });
  }

  feedbackChange(feedback) {
    this.setState({feedback: feedback});
    this.onChange({
      feedbackType: this.state.feedbackType,
      feedback: feedback
    });
  }

  onChange(feedback){
    this.props.onChange(feedback);
  }

  render() {
    return <div className="feedback-selector">
      <p className="feedback-prompt">{this.props.label}</p>
      <RadioButtonGroup 
          style={{ display: 'flex' }} name="feedback" defaultSelected="default" 
          valueSelected={this.state.feedbackType}
          onChange={this.feedbackTypeChange.bind(this)}>
        <RadioButton style={{ width: 'auto' }} value="default" label="Simple Feedback" />
        <RadioButton style={{ width: 'auto' }} value="none" label="No Feedback" />
        <RadioButton style={{ width: 'auto' }} value="custom" label="Customized Feedback" />
      </RadioButtonGroup>
      {
        (this.state.feedbackType === 'custom') ? (
          <div className="feedback-holder">
            <EditableHTML 
              placeholder="Enter feedback..."
              onChange={this.feedbackChange.bind(this)} 
              model={this.state.feedback}/>
          </div>
        ) : (
          (this.state.feedbackType === 'default') ? (
            <div className="feedback-holder default">{this.props.defaultFeedback}</div>
          ) : (
            <div></div>
          )
        )
      }
    </div>;
  }

}

export default class FeedbackConfig extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      feedback: merge({
        correctFeedbackType: 'default',
        partialFeedbackType: 'default',
        incorrectFeedbackType: 'default'
      }, this.props.feedback)
    };
  }

  onChange(key, data) {
    this.state.feedback[`${key}FeedbackType`] = data.feedbackType;
    if (data.feedback !== undefined) {
      this.state.feedback[`${key}Feedback`] = data.feedback;
    }
    this.props.onChange(this.state.feedback);
  }

  render() {
    return <div className="feedback-config">
      <Card>
        <CardHeader title="Feedback" showExpandableButton={true}/>
        <CardText expandable={true}>
          <FeedbackSelector 
            label="If correct, show"
            feedbackType={this.state.feedback.correctFeedbackType}
            customFeedback={this.state.feedback.correctFeedback}
            defaultFeedback={this.props.defaultCorrectFeedback}
            onChange={this.onChange.bind(this, 'correct')} />
          <FeedbackSelector 
            label="If partially correct, show"
            feedbackType={this.state.feedback.partialFeedbackType}
            customFeedback={this.state.feedback.partialFeedback}
            defaultFeedback={this.props.defaultPartialFeedback}
            onChange={this.onChange.bind(this, 'partial')} />
          <FeedbackSelector 
            label="If incorrect, show"
            feedbackType={this.state.feedback.incorrectFeedbackType}
            customFeedback={this.state.feedback.incorrectFeedback}
            defaultFeedback={this.props.defaultIncorrectFeedback}
            onChange={this.onChange.bind(this, 'incorrect')} />
        </CardText>
      </Card>
    </div>;
  }

}