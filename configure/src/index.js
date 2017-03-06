import Main from './main.jsx';
import React from 'react';
import ReactDOM from 'react-dom';

export default class CorespringMatchConfigReactElement extends HTMLElement {

  constructor() {
    console.log('constructing element');
    super();
    this._model = null;
    this._session = null;
  }

  set model(s) {
    this._model = s;
    console.log('setting model in element!');
    this._rerender();
  }

  onLayoutChanged(event, key, layout) {
    let updatedModel = _.cloneDeep(this._model);
    updatedModel.config.layout = layout;

    let detail = {
      update: updatedModel
    };

    console.log('updatedModel', JSON.stringify(updatedModel, null, 2));
    this.dispatchEvent(new CustomEvent('model.updated', { bubbles: true, detail }));
  }

  onInputTypeChanged(event, key, inputType) {
    let updatedModel = _.cloneDeep(this._model);
    updatedModel.config.inputType = inputType;

    let detail = {
      update: updatedModel
    };

    console.log('updatedModel', JSON.stringify(updatedModel, null, 2));
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