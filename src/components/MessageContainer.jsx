// @flow
import { connect } from "react-redux";
import ChatWindow from "./ChatWindow";
import type { State, Dispatch } from "../types";

const mapStateToProps = (state: State) => {
  let messages = [];
  const conn = state.connections.find(c => c.id === state.active.connectionId);
  if (conn) {
    switch (state.active.type) {
      case "channel":
        conn.channels.forEach(channel => {
          if (channel.id === state.active.id) {
            messages = Array.from(channel.messages);
          }
        });
        break;
      case "query":
        conn.queries.forEach(query => {
          if (query.id === state.active.id) {
            messages = Array.from(query.messages);
          }
        });
        break;
      case "connection": // fallthrough
      default:
        messages = Array.from(conn.messages);
        break;
    }
  }
  return { messages };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatWindow);
