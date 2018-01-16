// @flow
import { connect } from "react-redux";
import { getClient } from "../irc-state";
import ChatInputBox from "./ChatInputBox";
import * as actions from "../actions";
import type { State, Active } from "../types";

const commands = [
  "close",
  "connect",
  "disconnect",
  "join",
  "leave",
  "msg",
  "part",
  "query",
  "quit",
  "whois"
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

// export for testing because there's lots of logic in here
// TODO?(Zandr Martin/2018-01-15): move this somewhere else?
export const mapDispatchToProps = (dispatch: Function) => {
  // TODO(Zandr Martin/2018-01-15): all this stuff needs better (any!) error
  // handling that displays messages to the user
  return {
    processCommand(text: string, active: Active, target: string) {
      if (text === "") {
        return;
      }
      if (text.startsWith("/")) {
        // handle command here
        const words = text.split(/\s+/);
        const cmd = words
          .shift()
          .substring(1)
          .toLowerCase();
        const message = text.substring(cmd.length + 1).trimLeft();
        if (cmd === "connect") {
          // this doesn't require a client, so handle it before trying to get
          // the active client
          if (words.length < 2) {
            return; // TODO: handle this better
          }
          dispatch(actions.commandConnect(words[0], words[1]));
          return;
        }
        let client;
        try {
          client = getClient(active.connectionId);
        } catch (e) {
          console.log(e); // eslint-disable-line
          return;
        }
        switch (cmd) {
          case "disconnect": {
            const remove = () => {
              dispatch(actions.removeConnection(active.connectionId));
            };
            client.disconnect(message, remove);
            break;
          }

          case "join":
            if (words.length < 1) {
              return; // TODO: handle this better
            }
            client.join(message);
            break;

          case "close": // fallthrough
          case "leave": // fallthrough
          case "part":
            if (words.length > 0) {
              if (words[0].startsWith("#")) {
                target = words.shift();
              }
              client.part(target, words.join(" "));
            } else if (active.type === "channel") {
              client.part(target);
            } else if (active.type === "query") {
              dispatch(actions.removeQuery(active.id));
            }
            break;

          case "msg": // fallthrough
          case "query": {
            if (words.length === 0) {
              return;
            }
            const target = words.shift();
            if (words.length > 0) {
              // we're doing like "/msg user123 hello!" so say it to them and
              // let the message event take care of adding the query
              client.say(target, message.substring(target.length).trimLeft());
            } else {
              // we're doing "/query user123" with no message, so we just want
              // to open a window
              dispatch(actions.newQuery(active.connectionId, target));
            }
            break;
          }

          case "quit":
            break;

          case "whois":
            client.whois(message);
            break;

          default:
            break;
        }
      } else {
        try {
          const client = getClient(active.connectionId);
          client.say(target, text);
        } catch (e) {
          console.log(e); // eslint-disable-line
        }
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatInputBox);
