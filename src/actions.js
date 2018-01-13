// @flow
import type { Id, ActiveType, Action } from "./types";

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
