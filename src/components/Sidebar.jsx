import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.renderConnections = this.renderConnections.bind(this);
    this.renderChannels = this.renderChannels.bind(this);
  }

  renderChannels(connection) {
    return connection.channels.map(channel => {
      const classes = classnames("channel-label", {
        active: channel.id === this.props.active.id
      });
      return (
        <div
          key={channel.id}
          className={classes}
          onClick={() =>
            this.props.setActiveView(connection.id, "channel", channel.id)
          }
        >
          {channel.name}
        </div>
      );
    });
  }

  renderConnections() {
    return this.props.connections.map(connection => {
      const classes = classnames("connection-label", {
        active: connection.id === this.props.active.id
      });
      return (
        <Fragment key={"frag-" + connection.id}>
          <div
            key={connection.id}
            className={classes}
            onClick={() =>
              this.props.setActiveView(
                connection.id,
                "connection",
                connection.id
              )
            }
          >
            {connection.server}
          </div>
          {this.renderChannels(connection)}
        </Fragment>
      );
    });
  }

  render() {
    return <div id="sidebar">{this.renderConnections()}</div>;
  }
}

Sidebar.defaultProps = {
  connections: [],
  active: {}
};

Sidebar.propTypes = {
  connections: PropTypes.array,
  active: PropTypes.object,
  setActiveView: PropTypes.func.isRequired
};

export default Sidebar;
