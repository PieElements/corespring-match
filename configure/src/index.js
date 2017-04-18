import Main from './main.jsx';
import React from 'react';
import ReactDOM from 'react-dom';
import PieConfigElement from './pie-config-element';

export default class CorespringMatchConfigReactElement extends PieConfigElement {

  constructor() {
    super();
  }

  onInputTypeChanged(event, key, value) {
    if (value !== this._model.config.inputType) {
      this.onModelUpdate('config.inputType')(event, key, value);
      this._model.partialScoring = this.getDefaultScoring();
    }
  }

  getDefaultScoring() {
    let partialScoring = undefined;
    if (this._model.config.scoringType === 'checkbox') {
      partialScoring = this.props.model.partialScoring || {
        sections: []
      };
      this._model.rows.forEach((row, index) => {
        let partialSection = _.find(this._model.partialScoring.sections, {
          catId: row.id
        });
        if (!partialSection) {
          partialSection = {
            catId: row.id,
            label: `Row ${index + 1}`,
            partialScoring: []
          };
          partialScoring.sections.push(partialSection);
        }
        let correctResponseForRow = _.find(this._model.correctResponse, { id: row.id });
        let trueCount = _.reduce(correctResponseForRow.matchSet, (acc, m) => {
          return acc + (m ? 1 : 0);
        });
        partialSection.numberOfCorrectResponses = Math.max(trueCount, 0);
        partialSection.partialScoring = _.filter(partialSection.partialScoring, (ps) => {
          return ps.numberOfCorrect < trueCount;
        });
      });
      partialScoring.sections = _.filter(this.props.model.partialScoring.sections, (section) => {
        return _.find(this.props.model.rows, {
          id: section.catId
        });
      });
    }
    return partialScoring;
  }

  onPartialScoringChanged(partialScoring) {
    this._model.partialScoring = partialScoring;
    this.modelDidUpdate();
  }

  _rerender() {
    let element = React.createElement(Main, {
      model: this._model,
      onLayoutChanged: this.onModelUpdate('config.layout').bind(this),
      onInputTypeChanged: this.onInputTypeChanged.bind(this),
      onShuffleChanged: this.onModelUpdate('config.shuffle').bind(this),
      onFeedbackChanged: this.onModelUpdate('feedback').bind(this),
      onRowsChanged: this.onModelUpdate('rows').bind(this),
      onColumnsChanged: this.onModelUpdate('columns').bind(this),
      onCorrectChanged: this.onModelUpdate('correctResponse').bind(this),
      onPartialScoringChanged: this.onPartialScoringChanged.bind(this)
    });
    ReactDOM.render(element, this);
  }

}