import Main from './main.jsx';
import React from 'react';
import ReactDOM from 'react-dom';
import PieConfigElement from './pie-config-element';

export default class CorespringMatchConfigReactElement extends PieConfigElement {

  constructor() {
    super();
  }

  _rerender() {
    let element = React.createElement(Main, {
      model: this._model,
      onLayoutChanged: this.onModelUpdate('config.layout').bind(this),
      onInputTypeChanged: this.onModelUpdate('config.inputType').bind(this),
      onShuffleChanged: this.onModelUpdate('config.shuffle').bind(this),
      onRowsChanged: this.onModelUpdate('rows').bind(this)
    });
    ReactDOM.render(element, this);
  }

}