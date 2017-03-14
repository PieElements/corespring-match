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
      sections: [
        {
            "catId" : "row-1",
            "label" : "Row 1",
            "partialScoring" : [ 
                {
                    "numberOfCorrect" : 1.0,
                    "scorePercentage" : 10.0
                }
            ],
            "numberOfCorrectResponses" : 2.0,
            "maxNumberOfScoringScenarios" : 1.0,
            "canAddScoringScenario" : false,
            "canRemoveScoringScenario" : false
        }, 
        {
            "catId" : "row-2",
            "label" : "Row 2",
            "partialScoring" : [ 
                {
                    "numberOfCorrect" : 1.0,
                    "scorePercentage" : 19.0
                }
            ],
            "numberOfCorrectResponses" : 2.0,
            "maxNumberOfScoringScenarios" : 1.0,
            "canAddScoringScenario" : false,
            "canRemoveScoringScenario" : false
        }, 
        {
            "catId" : "row-3",
            "label" : "Row 3",
            "partialScoring" : [ 
                {
                    "numberOfCorrect" : 1.0,
                    "scorePercentage" : 40.0
                }
            ],
            "numberOfCorrectResponses" : 2.0,
            "maxNumberOfScoringScenarios" : 1.0,
            "canAddScoringScenario" : false,
            "canRemoveScoringScenario" : false
        }, 
        {
            "catId" : "row-4",
            "label" : "Row 4",
            "partialScoring" : [ 
                {
                    "numberOfCorrect" : 1.0,
                    "scorePercentage" : 0.0
                }
            ],
            "numberOfCorrectResponses" : 1.0,
            "maxNumberOfScoringScenarios" : 1.0,
            "canAddScoringScenario" : false,
            "canRemoveScoringScenario" : false
        }
      ]
    };
  }

  addScoringScenario(sectionIndex) {
    let self = this;
    var maxNumberOfCorrect = findMaxNumberOfCorrectInScoringScenarios(sectionIndex);
    console.log('this.state.sections', this.state.sections);
    this.state.sections[sectionIndex].partialScoring.push(this._makeScenario(maxNumberOfCorrect + 1, 0));
    this._updateScoring(this.state);

    function findMaxNumberOfCorrectInScoringScenarios(sectionIndex) {
      let maxNumberOfCorrect = 0;
      _.each(self.state.sections[sectionIndex], (ps) => {
        if (ps.numberOfCorrect > maxNumberOfCorrect) {
          maxNumberOfCorrect = ps.numberOfCorrect;
        }
      });
      return maxNumberOfCorrect;
    }
  }

  removeScoringScenario(sectionIndex, index) {
    this.state.sections[sectionIndex].partialScoring.splice(index, 1);
    this._updateScoring(this.state);
  }

  onNumberOfCorrectChange(sectionIndex, index, event) {
    try {
      this.setState(update(this.state, { sections: { [sectionIndex] : { partialScoring: {[index] : { numberOfCorrect: {"$set": parseFloat(event.target.value)}}}}}}), () => {
        this._updateScoring(this.state);
      });
    } catch (e) {
      console.log('error', e);
    }
  }

  onPercentageChange(sectionIndex, index, event) {
    try {
      this.setState(update(this.state, { sections: { [sectionIndex] : { partialScoring: {[index] : { scorePercentage: {"$set": parseFloat(event.target.value)}}}}}}), () => {
        this._updateScoring(this.state);
      });
    } catch (e) {
      console.log('error', e);
    }
  }

  _updateScoring(newScoring) {
    this.setState(newScoring, (state) => {
      this.props.onPartialScoringChange(newScoring);
    });
  }

  _makeScenario(numberOfCorrect, scorePercentage) {
    return {
      numberOfCorrect: numberOfCorrect,
      scorePercentage: scorePercentage
    };
  }

  render() {
    const scoringFieldStyle = {display: 'inline-block', width: '50px', margin: '10px'};
    let addRemoveProperties = this.state.sections.map((section, sectionIndex) => {
      return {
        canAddScoringScenario: section.partialScoring.length < section.maxNumberOfScoringScenarios,
        canRemoveScoringScenario: section.partialScoring.length > 1
      };
    });

    return <div className="mutli-partial-scoring-config">
      <p className="scoring-header-text">{this.props.headerText}</p>
      <Card>
        <CardHeader title="Partial Scoring Rules" showExpandableButton={true}/>
        <CardText expandable={true}>{
          this.state.sections.map((section, sectionIndex) => {
            return <div className="section" key={sectionIndex}>
              <div className="html-wrapper" dangerouslySetInnerHTML={{__html: section.label}}/>
              <ul>{
                section.partialScoring.map((scenario, index) => {
                  return <li key={index} className="scoring-item">
                    If
                    <TextField id={`numberOfCorrect-${index}`} style={scoringFieldStyle}
                      value={scenario.numberOfCorrect || ''}
                      onChange={this.onNumberOfCorrectChange.bind(this, sectionIndex, index)} />
                    of correct answers is/are selected, award
                    <TextField id={`scorePercentage-${index}`} style={scoringFieldStyle}
                      value={scenario.scorePercentage || ''}
                      onChange={this.onPercentageChange.bind(this, sectionIndex, index)} />
                    % of full credit.
                    {
                      (!addRemoveProperties[sectionIndex].canRemoveScoringScenario) ? (
                        <IconButton onClick={this.removeScoringScenario.bind(this, sectionIndex, index)}><ActionDelete/></IconButton>
                      ) : <div/>
                    }
                  </li>
                })
              }</ul>
              {
                (!addRemoveProperties[sectionIndex].canAddScoringScenario) ? (
                  <div className="add-scoring-scenario">
                    <RaisedButton label="Add another scenario" onClick={this.addScoringScenario.bind(this, sectionIndex)}/>
                  </div>
                ) : <div/>
              }
            </div>
          })
        }</CardText>
      </Card>
    </div>;
  }

}

export default MultiPartialScoringConfig;