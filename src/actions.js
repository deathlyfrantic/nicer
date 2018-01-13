// @flow
import type {
  Id,
  ActiveType,
  ThunkAction,
  CommandJoinAction,
  CommandPartAction,
  EventConnectAction,
  EventMotdAction,
  SetActiveViewAction
} from "./types";

// commands
export const commandConnect = (server: string, nick: string): ThunkAction => {
  return dispatch => {
    return {
      type: "COMMAND_CONNECT",
      server,
      nick,
      dispatch
    };
  };
};

export const commandDisconnect = (
  id: Id,
  message: string = ""
): ThunkAction => {
  return dispatch => {
    return {
      type: "COMMAND_DISCONNECT",
      id,
      message,
      dispatch
    };
  };
};

export const commandJoin = (id: Id, channel: string): CommandJoinAction => {
  return {
    type: "COMMAND_JOIN",
    id,
    channel
  };
};

export const commandPart = (
  id: Id,
  channel: string,
  reason: string = ""
): CommandPartAction => {
  return {
    type: "COMMAND_PART",
    id,
    channel,
    reason
  };
};

// events
export const eventConnect = (
  id: Id,
  server: string,
  nick: string
): EventConnectAction => {
  return {
    type: "EVENT_CONNECT",
    id,
    server,
    nick
  };
};

export const eventMotd = (id: Id, message: string): EventMotdAction => {
  return {
    type: "EVENT_MOTD",
    id,
    message
  };
};

export const eventJoin = (
  id: Id,
  channel: string,
  nick: string
): ThunkAction => {
  return dispatch => {
    return {
      type: "EVENT_JOIN",
      id,
      channel,
      nick,
      dispatch
    };
  };
};

export const eventPart = (
  id: Id,
  channel: string,
  nick: string,
  reason: string
): ThunkAction => {
  return dispatch => {
    return {
      type: "EVENT_PART",
      id,
      channel,
      nick,
      reason,
      dispatch
    };
  };
};

// ui
export const setActiveView = (
  connectionId: Id,
  activeType: ActiveType,
  id: Id
): SetActiveViewAction => {
  return {
    type: "SET_ACTIVE_VIEW",
    connectionId,
    activeType,
    id
  };
};

// misc
export const removeConnection = (id: Id): ThunkAction => {
  return dispatch => {
    return {
      type: "REMOVE_CONNECTION",
      id,
      dispatch
    };
  };
};
