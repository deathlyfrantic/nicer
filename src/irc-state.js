// @flow
import irc from "irc";
import * as actions from "./actions";
import type { Id } from "./types";

const clients = {};

export const getClient = (id: Id): irc.Client => {
  const client = clients[id];
  if (client) {
    return client;
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

export const newClient = (
  id: Id,
  server: string,
  nick: string,
  dispatch: Function
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
  client.connect();
  clients[id] = client;
  return client;
};
