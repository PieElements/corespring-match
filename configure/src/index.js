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

  modelDidUpdate(rerender) {
    if (rerender) {
      this._rerender();
    }

    let detail = {
      update: this._model
    };
    this.dispatchEvent(new CustomEvent('model.updated', { bubbles: true, detail }));
  }

  onModelUpdate(path, rerender) {
    let self = this;
    rerender = (renrender === undefined ? true : rerender);

    // This function sets the value of `obj` to `value` at `is`
    function update(obj, is, value) {
      if (typeof is === 'string') {
        return update(obj, is.split('.'), value);
      } else if (is.length === 1 && value !== undefined) {
        return obj[is[0]] = value;
      } else if (is.length === 0) {
        return obj;
      } else {
        return update(obj[is[0]], is.slice(1), value);
      }
    }

    return (event, key, value) => {
      update(self._model, path, value);
      self.modelDidUpdate(rerender);
    };
  }

  _rerender() {
    let element = React.createElement(Main, {
      model: this._model,
      onLayoutChanged: this.onModelUpdate('config.layout').bind(this),
      onInputTypeChanged: this.onModelUpdate('config.inputType').bind(this)
    });
    ReactDOM.render(element, this);
  }

}