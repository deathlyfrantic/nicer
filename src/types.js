// @flow
import irc from "irc";

export type Id = string | number;

export type ActiveType = "" | "channel" | "query" | "connection";

export type Active = {
  connectionId: Id,
  type: ActiveType,
  id: Id
};

export type MessageType = "normal" | "action" | "server";

export type Message = {
  id: Id,
  type: MessageType,
  text: string,
  time: Date,
  user: string | null
};

export type Channel = {
  id: Id,
  name: string,
  messages: Array<Message>,
  users: Array<string>
};

export type Query = {
  id: Id,
  name: string,
  messages: Array<Message>
};

export type Connection = {
  id: Id,
  client: irc.Client,
  connected: boolean,
  name: string,
  nick: string,
  channels: Array<Channel>,
  queries: Array<Query>,
  messages: Array<Message>
};

export type State = {
  connections: Array<Connection>,
  active: Active
};

export type CommandConnectAction = {
  type: "COMMAND_CONNECT",
  server: string,
  nick: string,
  dispatch: Dispatch
};

export type CommandDisconnectAction = {
  type: "COMMAND_DISCONNECT",
  id: Id,
  message: string,
  dispatch: Dispatch
};

export type CommandJoinAction = {
  type: "COMMAND_JOIN",
  id: Id,
  channel: string
};

export type CommandPartAction = {
  type: "COMMAND_PART",
  id: Id,
  channel: string,
  reason: string
};

export type EventConnectAction = {
  type: "EVENT_CONNECT",
  id: Id,
  server: string,
  nick: string
};

export type EventMotdAction = {
  type: "EVENT_MOTD",
  id: Id,
  message: string
};

export type EventJoinAction = {
  type: "EVENT_JOIN",
  id: Id,
  channel: string,
  nick: string,
  dispatch: Dispatch
};

export type EventPartAction = {
  type: "EVENT_PART",
  id: Id,
  channel: string,
  nick: string,
  reason: string,
  dispatch: Dispatch
};

export type SetActiveViewAction = {
  type: "SET_ACTIVE_VIEW",
  connectionId: Id,
  activeType: ActiveType,
  id: Id
};

export type RemoveConnectionAction = {
  type: "REMOVE_CONNECTION",
  id: Id,
  dispatch: Dispatch
};

export type Action =
  | CommandConnectAction
  | CommandDisconnectAction
  | CommandJoinAction
  | CommandPartAction
  | EventConnectAction
  | EventMotdAction
  | EventJoinAction
  | EventPartAction
  | SetActiveViewAction
  | RemoveConnectionAction;

export type Dispatch = (action: Action | ThunkAction | Array<Action>) => any;
export type GetState = () => State;
export type ThunkAction = (
  dispatch: Dispatch
) => Action | ThunkAction | Array<Action>;
