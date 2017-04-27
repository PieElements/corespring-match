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
    return partialScoring;
  }

  onPartialScoringChanged(partialScoring) {
    this._model.partialScoring = partialScoring;
    console.log('this._model.partialScoring', this._model.partialScoring);
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
      onCorrectChanged: this.onModelUpdate('correctResponse').bind(this),
      onPartialScoringChanged: this.onPartialScoringChanged.bind(this)
    });
    ReactDOM.render(element, this);
  }

}