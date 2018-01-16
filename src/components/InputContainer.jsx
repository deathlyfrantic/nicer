// @flow
import { connect } from "react-redux";
import { createCommandProcessor, commands } from "../irc-state";
import ChatInputBox from "./ChatInputBox";
import type { State } from "../types";

const mapStateToProps = (state: State) => {
  let nicks = [];
  let target = "";
  state.connections.forEach(conn => {
    if (conn.id === state.active.connectionId) {
      if (conn.id === state.active.id) {
        target = conn.name;
      } else {
        if (state.active.type === "channel") {
          conn.channels.forEach(chan => {
            if (chan.id === state.active.id) {
              target = chan.name;
              nicks = chan.users.filter(u => u !== conn.nick);
            }
          });
        } else if (state.active.type === "query") {
          conn.queries.forEach(query => {
            if (query.id === state.active.id) {
              target = query.name;
            }
          });
        }
      }
    }
  });
  return { active: state.active, commands, nicks, target };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    processCommand: createCommandProcessor(dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatInputBox);
