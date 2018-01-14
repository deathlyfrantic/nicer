// @flow
import React, { Component } from "react";
import type { Active } from "../types";

type Props = {
  active: Active,
  commands: Array<string>,
  nicks: Array<string>,
  target: string,
  processCommand: (
    text: string,
    active: Active,
    target: string
  ) => typeof undefined
};

class ChatInputBox extends Component<Props> {
  handleKeyDown: (
    event: SyntheticKeyboardEvent<HTMLInputElement>
  ) => typeof undefined;
  focusInput: () => typeof undefined;
  input: ?HTMLInputElement;
  handleCompletion: (input: string) => typeof undefined;
  populateCompletion: (word: string) => typeof undefined;
  clearCompletion: () => typeof undefined;
  completion: {
    candidates: Array<string>,
    position: number,
    inProgress: boolean
  };

  constructor(props: Props) {
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.focusInput = this.focusInput.bind(this);
    this.handleCompletion = this.handleCompletion.bind(this);
    this.populateCompletion = this.populateCompletion.bind(this);
    this.clearCompletion = this.clearCompletion.bind(this);
    this.clearCompletion();
  }

  focusInput() {
    if (this.input) {
      this.input.focus();
    }
  }

  populateCompletion(word: string) {
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

  handleCompletion(input: string) {
    if (
      !this.input ||
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

  handleKeyDown(e: SyntheticKeyboardEvent<HTMLInputElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      if (this.input && this.input.value !== "") {
        this.handleCompletion(this.input.value);
      }
    } else if (this.completion.inProgress) {
      this.clearCompletion();
    }
    if (e.key === "Enter") {
      e.stopPropagation();
      if (this.input) {
        const input = this.input.value;
        this.input.value = "";
        this.props.processCommand(input, this.props.active, this.props.target);
      }
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

export default ChatInputBox;
