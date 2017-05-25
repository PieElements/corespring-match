import Main from './main.jsx';
import React from 'react';
import ReactDOM from 'react-dom';
import reduce from 'lodash/reduce';

/**
 * Is complete if 1 option in the entire match has been selected. 
 * @param {*} answers 
 */
export const isComplete = (answers) => {
  const numberOfAnswers = 0;
  const reduceMatchSet = (acc, m) => acc + (m ? 1 : 0);
  const reduceRow = (acc, row) => acc + reduce(row.matchSet, reduceMatchSet, 0);
  const noOfSelected = reduce(answers, reduceRow, 0);
  return noOfSelected > 0;
}

export default class CorespringMatchReactElement extends HTMLElement {

  constructor() {
    super();
    this._model = null;
    this._session = null;
  }

  set model(s) {
    this._model = s;
    this._rerender();
    this.dispatch('model-set');
  }

  get session() {
    return this._session;
  }

  dispatch(name) {
    const complete = isComplete(this._session ? (this._session.answers || []) : []);
    const event = new CustomEvent(name, { bubbles: true, detail: { complete } });
    this.dispatchEvent(event);
  }

  set session(s) {
    this._session = s;
    this._rerender();
    this.dispatch('session-changed');
  }

  _onChange(data) {
    this.dispatch('session-changed');
  };

  _rerender() {
    if (this._model && this._session) {
      var element = React.createElement(Main, {
        model: this._model,
        session: this._session,
        onChange: this._onChange.bind(this)
      });
      ReactDOM.render(element, this)
    }
  }

  connectedCallback() {
    this._rerender();
  }

}