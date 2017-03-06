import Main from './main.jsx';
import React from 'react';
import ReactDOM from 'react-dom';

export default class CorespringMatchConfigReactElement extends HTMLElement {

  constructor() {
    super();
    this._model = null;
  }

  set model(s) {
    this._model = s;
    this._rerender();
  }

  onLayoutChanged(event, key, layout) {
    this._model.config.layout = layout;
    this.modelDidUpdate();
  }

  onInputTypeChanged(event, key, inputType) {
    this._model.config.inputType = inputType;
    this.modelDidUpdate();
  }

  modelDidUpdate() {
    let detail = {
      update: this._model
    };
    this._rerender();
    this.dispatchEvent(new CustomEvent('model.updated', { bubbles: true, detail }));
  }

  _rerender() {
    let element = React.createElement(Main, {
      model: this._model,
      onLayoutChanged: this.onLayoutChanged.bind(this),
      onInputTypeChanged: this.onInputTypeChanged.bind(this)
    });
    ReactDOM.render(element, this, () => {
      console.log('rendered config');
    });
  }

}