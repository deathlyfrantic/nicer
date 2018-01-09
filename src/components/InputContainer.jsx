import { connect } from "react-redux";
import ChatInputBox from "./ChatInputBox";
import * as actions from "../actions";

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

const mapStateToProps = state => {
  let nicks = [];
  const conn = state.connections.find(c => c.id === state.active.connectionId);
  let channel = "";
  if (conn !== undefined) {
    const chan = conn.channels.find(c => c.id === state.active.id);
    if (chan !== undefined) {
      channel = chan.name;
      nicks = chan.users.filter(user => user !== conn.nick);
    }
  }
  return { active: state.active, commands, nicks, channel };
};

const mapDispatchToProps = dispatch => {
  return {
    processCommand(text, active, channel) {
      if (text === "") {
        return;
      }
      if (text.startsWith("/")) {
        // handle command here
        const words = text.split(/\s+/);
        const cmd = words.shift().substring(1);
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
            dispatch(actions.commandJoin(active.connectionId, words.join(" ")));
            break;
          case "leave": // fallthrough
          case "part":
            if (words.length > 0) {
              if (words[0].startsWith("#")) {
                channel = words.shift();
              }
              dispatch(
                actions.commandPart(
                  active.connectionId,
                  channel,
                  words.join(" ") // this is the reason for leaving
                )
              );
            } else {
              dispatch(actions.commandPart(active.connectionId, channel));
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
        // say command is here
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatInputBox);
