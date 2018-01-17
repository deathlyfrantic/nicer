// @flow
import irc from "irc";
import * as actions from "./actions";
import type { Id, Active } from "./types";

export const commands = [
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

const clients = {};

export const getClient = (id: Id): irc.Client => {
  if (id in clients) {
    return clients[id];
  }
  throw new Error(`Unable to find client with id ${id}.`);
};

export const removeClient = (id: Id): typeof undefined => {
  if (id in clients) {
    delete clients[id];
  } else {
    throw new Error(`Unable to find client with id ${id}.`);
  }
};

export const addClient = (id: Id, client: irc.Client) => {
  // this is not intended for normal use, it really only exists for testing
  clients[id] = client;
};

export const newClient = (
  id: Id,
  server: string,
  nick: string,
  dispatch: Function,
  connect: boolean = true
): irc.Client => {
  const client = new irc.Client(server, nick, {
    stripColors: true,
    autoConnect: false
  });
  client.on("registered", () => {
    dispatch(actions.eventConnect(id, client.server, client.nick));
  });
  client.on("motd", motd => {
    dispatch(actions.eventMotd(id, motd));
  });
  client.on("join", (channel, nick) => {
    dispatch(actions.eventJoin(id, channel, nick));
  });
  client.on("part", (channel, nick, reason) => {
    dispatch(actions.eventPart(id, channel, nick, reason));
  });
  client.on("names", (channel, nicks) => {
    dispatch(actions.eventNames(id, channel, Object.keys(nicks)));
  });
  client.on("topic", (channel, topic, nick) => {
    dispatch(actions.eventTopic(id, channel, topic, nick));
  });
  client.on("quit", (nick, reason, channels) => {
    dispatch(actions.eventQuit(id, nick, reason, channels));
  });
  client.on("kick", (channel, nick, by, reason) => {
    dispatch(actions.eventKick(id, channel, nick, by, reason));
  });
  client.on("nick", (oldnick, newnick, channels) => {
    dispatch(actions.eventNick(id, oldnick, newnick, channels));
  });
  client.on("whois", info => {
    const data = {
      nick: info.nick || "",
      user: info.user || "",
      host: info.host || "",
      realname: info.realname || "",
      server: info.server || "",
      serverinfo: info.serverinfo || "",
      idle: info.idle || "",
      channels: info.channels || []
    };
    dispatch(actions.eventWhois(id, data));
  });
  client.on("message", (nick, to, text) => {
    dispatch(actions.eventMessage(id, nick, to, text));
  });
  client.on("selfMessage", (to, text) => {
    dispatch(actions.eventSelfMessage(id, to, text));
  });
  client.on("kill", (nick, reason, channels) => {});
  client.on("notice", (nick, to, text) => {});
  client.on("invite", (channel, from) => {});
  client.on("+mode", (channel, by, mode, argument) => {});
  client.on("-mode", (channel, by, mode, argument) => {});
  client.on("action", (from, to, text) => {});
  client.on("error", message => {
    console.dir(message); // eslint-disable-line
  });
  if (connect) {
    client.connect();
  }
  addClient(id, client);
  return client;
};

// TODO(Zandr Martin/2018-01-15): all this stuff needs better (any!) error
// handling that displays messages to the user
export const createCommandProcessor = (dispatch: Function) => {
  return (text: string, active: Active, target: string) => {
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
            let remainder = message;
            if (words[0].startsWith("#")) {
              target = words.shift();
              remainder = message.substring(target.length).trimLeft();
            }
            client.part(target, remainder);
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
  };
};
