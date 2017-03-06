import React from 'react';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';

require('./feedback.less');

class FeedbackConfig extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return <div className="feedback-config">
      <Card expanded={true}>
        <CardHeader title="Feedback" showExpandableButton={true}/>
        <CardText expandable={true}>
          <FeedbackSelector/>
          <FeedbackSelector/>
          <FeedbackSelector/>
        </CardText>
      </Card>
    </div>;
  }

}

class FeedbackSelector extends React.Component {

  render() {
    return <div className="feedback-selector">
      <RadioButtonGroup style={{ display: 'flex' }} name="feedback" defaultSelected="default">
        <RadioButton style={{ width: 'auto' }} value="default" label="Simple Feedback" />
        <RadioButton style={{ width: 'auto' }} value="none" label="No Feedback" />
        <RadioButton style={{ width: 'auto' }} value="custom" label="Customized Feedback" />
      </RadioButtonGroup>
    </div>;
  }

}

export default FeedbackConfig;