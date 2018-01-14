// @flow
import { connect } from "react-redux";
import ChatInputBox from "./ChatInputBox";
import * as actions from "../actions";
import type { State } from "../types";

const commands = [
  "connect",
  "disconnect",
  "join",
  "leave",
  "msg",
  "part",
  "query",
  "quit"
];

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
    processCommand(text, active, target) {
      if (text === "") {
        return;
      }
      if (text.startsWith("/")) {
        console.log("text startswith /");
        // handle command here
        const words = text.split(/\s+/);
        const cmd = words
          .shift()
          .substring(1)
          .toLowerCase();
        const message = text.substring(cmd.length + 1).trimLeft();
        switch (cmd) {
          case "connect":
            if (words.length < 2) {
              return; // TODO: handle this better
            }
            dispatch(actions.commandConnect(words[0], words[1]));
            break;
          case "disconnect":
            dispatch(actions.commandDisconnect(active.connectionId));
            break;
          case "join":
            if (words.length < 1) {
              return; // TODO: handle this better
            }
            dispatch(actions.commandJoin(active.connectionId, message));
            break;
          case "leave": // fallthrough
          case "part":
            // TODO(Zandr Martin/2018-01-14): handle parting from query or
            // connection
            if (words.length > 0) {
              if (words[0].startsWith("#")) {
                target = words.shift();
              }
              dispatch(
                actions.commandPart(
                  active.connectionId,
                  target,
                  words.join(" ") // this is the reason for leaving
                )
              );
            } else {
              dispatch(actions.commandPart(active.connectionId, target));
            }
            break;
          case "msg": // fallthrough
          case "query":
            break;
          case "quit":
            break;
          default:
            break;
        }
      } else {
        dispatch(actions.commandSay(active.connectionId, target, text));
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatInputBox);
