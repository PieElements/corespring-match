import React from 'react';
import * as _ from 'lodash';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import ActionDelete from 'material-ui/svg-icons/action/delete';

import update from 'immutability-helper';

class MultiPartialScoringConfig extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      rows: {
        id: 'row-1',
        scoring: [
          { correctCount: 1, weight: 0.5 }
        ]
      }
    };
  }

  _toState(props) {
    let { partialScoring, numberOfCorrectRowResponses } = props;
    reutrn {
      // partialScoring: (props.partialScoring === undefined) ? [

      // ]
    }
  }

  render() {
    let canDoScoring = Object.values(this.props.numberOfCorrectRowResponses).find(n => n > 1) !== undefined;
    return <div className="mutli-partial-scoring-config">
      <p className="scoring-header-text">
        If there is more than one correct answer per row, you may allow partial credit based on 
        the number of correct answers submitted per row. This is optional.
      </p>
      <Card>
        <CardHeader title="Partial Scoring Rules" showExpandableButton={canDoScoring}/>
        <CardText expandable={true}>{
          JSON.stringify(this.props.partialScoring)
        }</CardText>
      </Card>
    </div>;
  }

}

export default MultiPartialScoringConfig;