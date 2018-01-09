import * as actionTypes from "./action-types";

// commands
export const commandConnect = (server, nick) => {
  return {
    type: actionTypes.COMMAND_CONNECT,
    payload: { server, nick }
  };
};

export const commandDisconnect = (id, message = "") => {
  return {
    type: actionTypes.COMMAND_DISCONNECT,
    payload: { id, message }
  };
};

export const commandJoin = (id, channel) => {
  return {
    type: actionTypes.COMMAND_JOIN,
    payload: { id, channel }
  };
};

export const commandPart = (id, channel, reason = "") => {
  return {
    type: actionTypes.COMMAND_PART,
    payload: { id, channel, reason }
  };
};

// events
export const eventConnect = (id, server, nick) => {
  return {
    type: actionTypes.EVENT_CONNECT,
    payload: { id, server, nick }
  };
};

export const eventMotd = (id, motd) => {
  return {
    type: actionTypes.EVENT_MOTD,
    payload: { id, motd }
  };
};

export const eventJoin = (id, channel, nick) => {
  return {
    type: actionTypes.EVENT_JOIN,
    payload: { id, channel, nick }
  };
};

export const eventPart = (id, channel, nick, reason) => {
  return {
    type: actionTypes.EVENT_PART,
    payload: { id, channel, nick, reason }
  };
};

// ui
export const setActiveView = (connectionId, type, id) => {
  return {
    type: actionTypes.SET_ACTIVE_VIEW,
    payload: { connectionId, type, id }
  };
};

// misc
export const removeClient = id => {
  return {
    type: actionTypes.REMOVE_CLIENT,
    payload: { id }
  };
};
