import Main from './main.jsx';
import React from 'react';
import ReactDOM from 'react-dom';
import PieConfigElement from './pie-config-element';
import cloneDeep from 'lodash/cloneDeep';

export default class CorespringMatchConfigReactElement extends PieConfigElement {

  constructor() {
    super();
  }

  onInputTypeChanged(event, key, value) {
    if (value !== this._model.config.inputType) {
      this._model.partialScoring = this.getDefaultScoring();
    }
    this._model.config.inputType = value;
    if (this._model.config.inputType === 'radio') {
      this._model.correctResponse = this._model.correctResponse.map(({id, matchSet}) => { 
        return {
          id: id,
          matchSet: matchSet.reduce((acc, value) => {
            acc.push((acc.indexOf(true) >= 0) ? false : value);
            return acc;
          }, [])
        };
      });
    }
    this.modelDidUpdate(true);
  }

  getDefaultScoring() {
    let partialScoring = undefined;
    return partialScoring;
  }

  onPartialScoringChanged(partialScoring) {
    this._model.partialScoring = partialScoring;
    this.modelDidUpdate(true);
  }

  onCorrectChanged(correctResponse) {
    let correctAnswersForRow = (rowId) => {
      let correctResponseRow = correctResponse.find(({ id }) => id === rowId);
      return correctResponseRow ? correctResponseRow.matchSet.reduce((acc, v) => acc + (v === true ? 1 : 0), 0) : 0;
    };
    this._model.correctResponse = correctResponse;
    if (this._model.config.inputType === 'checkbox' && this._model.partialScoring) {
      this._model.partialScoring.forEach(({rowId, scoring}, index) => {
        let maxCorrect = correctAnswersForRow(rowId);
        scoring = scoring.filter(({correctCount}) => correctCount < maxCorrect);
        this._model.partialScoring[index].scoring = scoring;
      });
    }
    this.modelDidUpdate(true);
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
      onCorrectChanged: this.onCorrectChanged.bind(this),
      onPartialScoringChanged: this.onPartialScoringChanged.bind(this)
    });
    ReactDOM.render(element, this);
  }

}