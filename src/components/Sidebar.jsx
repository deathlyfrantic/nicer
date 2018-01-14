// @flow
import React, { Component, Fragment } from "react";
import classnames from "classnames";
import type { Connection, Active, Id, ActiveType, Action } from "../types";

type Props = {
  connections: Array<Connection>,
  active: Active,
  setActiveView: (connectionId: Id, type: ActiveType, id: Id) => Action
};

class Sidebar extends Component<Props> {
  renderConnections: () => Fragment;
  renderChannels: Connection => Component<*>;

  constructor(props: Props) {
    super(props);
    this.renderConnections = this.renderConnections.bind(this);
    this.renderChannels = this.renderChannels.bind(this);
  }

  renderChannels(connection: Connection) {
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
        active: connection.id === this.props.active.id,
        disconnected: !connection.connected
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
            {connection.name}
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

export default Sidebar;
