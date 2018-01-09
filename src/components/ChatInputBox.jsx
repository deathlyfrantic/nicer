import React, { Component } from "react";
import PropTypes from "prop-types";

class ChatInputBox extends Component {
  constructor(props) {
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.focusInput = this.focusInput.bind(this);
    this.handleCompletion = this.handleCompletion.bind(this);
    this.populateCompletion = this.populateCompletion.bind(this);
    this.clearCompletion = this.clearCompletion.bind(this);
    this.clearCompletion();
  }

  focusInput() {
    this.input.focus();
  }

  populateCompletion(word) {
    let candidates = [];
    if (word.startsWith("/")) {
      candidates = this.props.commands
        .map(cmd => `/${cmd} `)
        .filter(cmd => cmd.toLowerCase().startsWith(word.toLowerCase()));
    } else {
      candidates = this.props.nicks
        .map(nick => `${nick}: `)
        .filter(nick => nick.toLowerCase().startsWith(word.toLowerCase()));
    }
    candidates.unshift(word);
    this.completion = { candidates, position: 0, inProgress: true };
  }

  clearCompletion() {
    this.completion = {
      candidates: [],
      position: -1,
      inProgress: false
    };
  }

  handleCompletion(input) {
    if (
      input.length !== this.input.selectionStart ||
      (!this.completion.inProgress && input.indexOf(" ") > -1)
    ) {
      return;
    }
    if (!this.completion.inProgress) {
      this.populateCompletion(input);
    }
    const pos = this.completion.position;
    const newPos = this.completion.candidates.length - 1 > pos ? pos + 1 : 0;
    this.input.value = this.completion.candidates[newPos];
    this.completion.position = newPos;
  }

  handleKeyDown(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      if (this.input.value !== "") {
        this.handleCompletion(this.input.value);
      }
    } else if (this.completion.inProgress) {
      this.clearCompletion();
    }
    if (e.key === "Enter") {
      e.stopPropagation();
      const input = this.input.value;
      this.input.value = "";
      this.props.processCommand(input, this.props.active, this.props.channel);
    }
  }

  componentDidMount() {
    this.focusInput();
  }

  render() {
    return (
      <div id="chatinputbox">
        <input
          id="chatinput"
          ref={node => (this.input = node)}
          onKeyDown={this.handleKeyDown}
          onBlur={this.focusInput}
        />
      </div>
    );
  }
}

ChatInputBox.defaultProps = {
  nicks: [],
  commands: [],
  active: {},
  channel: ""
};

ChatInputBox.propTypes = {
  processCommand: PropTypes.func.isRequired,
  commands: PropTypes.array,
  nicks: PropTypes.array,
  active: PropTypes.object,
  channel: PropTypes.string
};

export default ChatInputBox;
