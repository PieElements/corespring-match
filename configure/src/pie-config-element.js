export default class PieConfigElement extends HTMLElement {

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
    rerender = (rerender === undefined ? true : rerender);
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
      // sometimes the material-ui signatures only pass 2 arguments.
      if (value === undefined) {
        value = key;
      }
      update(self._model, path, value);
      self.modelDidUpdate(rerender);
    };
  }

}