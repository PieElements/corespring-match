import Main from './main.jsx';
import React from 'react';
import ReactDOM from 'react-dom';

export default class CorespringMatchReactElement extends HTMLElement {

  constructor() {
    super();
    this._model = null;
    this._session = null;
  }

  set model(s) {
    this._model = s;
    this._rerender();
  }

  get session() {
    return this._session;
  }

  set session(s) {
    this._session = s;
    this._rerender();
  }

  _onChange(data) {
    console.log(data);
    var event = new CustomEvent('pie', {
      bubbles: true,
      detail: {
        type: 'sessionChanged',
        component: this.tagName.toLowerCase()
      }
    });

    this.dispatchEvent(event);
  };

  _rerender() {
    if (this._model && this._session) {
      var element = React.createElement(Main, {
        model: this._model,
        session: this._session,
        onChange: this._onChange.bind(this)
      });
      ReactDOM.render(element, this, () => {
        console.log('rendered');
      });
    } else {
      console.log('skip');
    }
  }

  connectedCallback() {
    this.dispatchEvent(new CustomEvent('pie.register', { bubbles: true }));
    this._rerender();
  }

}