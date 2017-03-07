import React from 'react';
import ReactDom from 'react-dom';

// hack
window.$ = require('jquery');

require('froala-editor/js/froala_editor.pkgd.min.js');
require('froala-editor/css/froala_editor.pkgd.min.css');

import FroalaEditor from 'react-froala-wysiwyg';

export default class EditableHTML extends React.Component {

  render() {
    let config = {
      toolbarInline: true,
      charCounterCount: false
    };
    return <FroalaEditor tag='textarea' model={this.props.model} config={config} onModelChange={this.props.onChange}/>;
  }

}