import React, { Component } from "react";
import PropTypes from "prop-types";

class ChatWindow extends Component {
  constructor(props) {
    super(props);
    this.renderMessages = this.renderMessages.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
  }

  renderMessages() {
    return this.props.messages.map(msg => {
      return (
        <div key={msg.id} className="message">
          {msg.author ? <span className="author">{msg.author}</span> : ""}
          <span className="text">{msg.text}</span>
        </div>
      );
    });
  }

  scrollToBottom() {
    this.window.scrollTop = this.window.scrollHeight;
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

ChatWindow.defaultProps = {
  messages: []
};

ChatWindow.propTypes = {
  messages: PropTypes.array
};

export default ChatWindow;
