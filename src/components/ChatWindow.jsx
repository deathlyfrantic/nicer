// @flow
import React, { Component } from "react";
import type { Message } from "../types";
import type { Node } from "react";
import classnames from "classnames";

type Props = {
  messages: Array<Message>
};

class ChatWindow extends Component<Props> {
  renderMessages: () => Node;
  scrollToBottom: () => typeof undefined;
  window: ?HTMLDivElement;

  constructor(props: Props) {
    super(props);
    this.renderMessages = this.renderMessages.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
  }

  renderMessages() {
    return this.props.messages.map(msg => {
      const classes = classnames("message", msg.type);
      return (
        <div key={msg.id} className={classes}>
          {msg.type === "normal" || msg.type === "self" ? (
            <span className="author">{msg.user}</span>
          ) : (
            ""
          )}
          <span className="text">{msg.text}</span>
        </div>
      );
    });
  }

  scrollToBottom() {
    if (this.window) {
      this.window.scrollTop = this.window.scrollHeight;
    }
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  render() {
    return (
      <div id="chatwindow" ref={node => (this.window = node)}>
        {this.renderMessages()}
      </div>
    );
  }
}

export default ChatWindow;
