import React from 'react';
import ReactDom from 'react-dom';
import $ from 'jquery';
import _ from 'lodash';
import {Editor, EditorState, RichUtils} from 'draft-js';
import {stateFromHTML} from 'draft-js-import-html';
import {stateToHTML} from 'draft-js-export-html';

require('./editable-html.less');

export default class EditableHTML extends React.Component {

  constructor(props) {
    super(props);
    const content = this.props.model === undefined ? '' : this.props.model;
    this.state = {
      showToolbar: false,
      active: false,
      editorState: EditorState.createWithContent(stateFromHTML(content))
    };

  }

  onChange(editorState) {
    const content = stateToHTML(editorState.getCurrentContent());
    this.setState({editorState});
    this.setState({
      hasText: !_.isEmpty($(content).text())
    });
    this.props.onChange(content);
  }

  handleKeyCommand(command) {
    const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
    if (newState) {
      this.onChange(newState)
    }
  }

  onEditorBlur() {
    this.blurTimeoutId = setTimeout(() => {
      this.setState({
        active: false
      });
    }, 200);
  }

  onStyle(style) {
    if (this.blurTimeoutId) {
      clearTimeout(this.blurTimeoutId);
      this.blurTimeoutId = undefined;
    }
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, style));
  }

  toggleHtml() {
    if (this.state.active) {
      this.setState({
        active: false
      });
    } else {
      this.setState({
        active: true,
        editorState: EditorState.moveFocusToEnd(this.state.editorState)
      });
    }
  }

  render() {
    return (
      <div className="editable-html-container">{
        (this.state.active === true) ? (
          <div className="editable-html">
            <Toolbar 
              onStyle={this.onStyle.bind(this)} />
            <div className="editor">
              <Editor 
                onBlur={this.onEditorBlur.bind(this)}
                editorState={this.state.editorState}
                handleKeyCommand={this.handleKeyCommand.bind(this)}
                onChange={this.onChange.bind(this)} />
            </div>
          </div>
        ) : (
          this.state.hasText ? (
            <div dangerouslySetInnerHTML={{__html: stateToHTML(this.state.editorState.getCurrentContent())}} 
              onClick={this.toggleHtml.bind(this)}></div>
          ) : (
            <div onClick={this.toggleHtml.bind(this)}>{this.props.placeholder}</div>
          )
        )
      }</div>
    );
  }

}

class Toolbar extends React.Component {
  render() {
    return (
      <ul className="toolbar">
        <li className="button" onClick={this.props.onStyle.bind(this, 'BOLD')}>B</li>
        <li className="button" onClick={this.props.onStyle.bind(this, 'ITALIC')}>I</li>
        <li className="button" onClick={this.props.onStyle.bind(this, 'UNDERLINE')}>U</li>
      </ul>
    );
  }
}