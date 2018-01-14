// @flow
import type { Id, ActiveType, Action, WhoisData } from "./types";

const asyncDispatch = () => {};

// commands
export const commandConnect = (server: string, nick: string): Action => {
  return {
    type: "COMMAND_CONNECT",
    server,
    nick,
    asyncDispatch
  };
};

export const commandDisconnect = (id: Id, message: string = ""): Action => {
  return {
    type: "COMMAND_DISCONNECT",
    id,
    message,
    asyncDispatch
  };
};

export const commandJoin = (id: Id, channel: string): Action => {
  return {
    type: "COMMAND_JOIN",
    id,
    channel,
    asyncDispatch
  };
};

export const commandPart = (
  id: Id,
  channel: string,
  reason: string = ""
): Action => {
  return {
    type: "COMMAND_PART",
    id,
    channel,
    reason,
    asyncDispatch
  };
};

export const commandSay = (id: Id, target: string, message: string): Action => {
  return {
    type: "COMMAND_SAY",
    id,
    target,
    message,
    asyncDispatch
  };
};

// events
export const eventConnect = (id: Id, server: string, nick: string): Action => {
  return {
    type: "EVENT_CONNECT",
    id,
    server,
    nick,
    asyncDispatch
  };
};

export const eventMotd = (id: Id, motd: string): Action => {
  return {
    type: "EVENT_MOTD",
    id,
    motd,
    asyncDispatch
  };
};

export const eventJoin = (id: Id, channel: string, nick: string): Action => {
  return {
    type: "EVENT_JOIN",
    id,
    channel,
    nick,
    asyncDispatch
  };
};

export const eventPart = (
  id: Id,
  channel: string,
  nick: string,
  reason: string
): Action => {
  return {
    type: "EVENT_PART",
    id,
    channel,
    nick,
    reason,
    asyncDispatch
  };
};

export const eventNames = (
  id: Id,
  channel: string,
  nicks: Array<string>
): Action => {
  return {
    type: "EVENT_NAMES",
    id,
    channel,
    nicks,
    asyncDispatch
  };
};

export const eventTopic = (
  id: Id,
  channel: string,
  topic: string,
  nick: string
): Action => {
  return {
    type: "EVENT_TOPIC",
    id,
    channel,
    topic,
    nick,
    asyncDispatch
  };
};

export const eventQuit = (
  id: Id,
  nick: string,
  reason: string,
  channels: Array<string>
): Action => {
  return {
    type: "EVENT_QUIT",
    id,
    nick,
    reason,
    channels,
    asyncDispatch
  };
};

export const eventKick = (
  id: Id,
  channel: string,
  nick: string,
  by: string,
  reason: string
): Action => {
  return {
    type: "EVENT_KICK",
    id,
    channel,
    nick,
    by,
    reason,
    asyncDispatch
  };
};

export const eventNick = (
  id: Id,
  oldnick: string,
  newnick: string,
  channels: Array<string>
): Action => {
  return {
    type: "EVENT_NICK",
    id,
    oldnick,
    newnick,
    channels,
    asyncDispatch
  };
};

export const eventWhois = (id: Id, data: WhoisData): Action => {
  return {
    type: "EVENT_WHOIS",
    id,
    ...data,
    asyncDispatch
  };
};

export const eventMessage = (
  id: Id,
  nick: string,
  to: string,
  text: string
): Action => {
  return {
    type: "EVENT_MESSAGE",
    id,
    nick,
    to,
    text,
    asyncDispatch
  };
};

export const eventSelfMessage = (id: Id, to: string, text: string): Action => {
  return {
    type: "EVENT_SELFMESSAGE",
    id,
    to,
    text,
    asyncDispatch
  };
};

// ui
export const setActiveView = (
  connectionId: Id,
  activeType: ActiveType,
  id: Id
): Action => {
  return {
    type: "SET_ACTIVE_VIEW",
    connectionId,
    activeType,
    id,
    asyncDispatch
  };
};

// misc
export const removeConnection = (id: Id): Action => {
  return {
    type: "REMOVE_CONNECTION",
    id,
    asyncDispatch
  };
};
