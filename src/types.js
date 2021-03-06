// @flow
export type Id = string | number;

export type ActiveType = "" | "channel" | "query" | "connection";

export type Active = {
  connectionId: Id,
  type: ActiveType,
  id: Id
};

export type MessageType =
  | "action"
  | "join"
  | "kick"
  | "nick"
  | "normal"
  | "part"
  | "quit"
  | "self"
  | "server"
  | "topic"
  | "whois";

export type Message = {
  id: Id,
  type: MessageType,
  text: string,
  time: Date,
  user: string | null,
  read: boolean
};

export type Channel = {
  id: Id,
  topic: string,
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
  asyncDispatch: Function
};

export type EventConnectAction = {
  type: "EVENT_CONNECT",
  id: Id,
  server: string,
  nick: string,
  asyncDispatch: Function
};

export type EventMotdAction = {
  type: "EVENT_MOTD",
  id: Id,
  motd: string,
  asyncDispatch: Function
};

export type EventJoinAction = {
  type: "EVENT_JOIN",
  id: Id,
  channel: string,
  nick: string,
  asyncDispatch: Function
};

export type EventPartAction = {
  type: "EVENT_PART",
  id: Id,
  channel: string,
  nick: string,
  reason: string,
  asyncDispatch: Function
};

export type EventNamesAction = {
  type: "EVENT_NAMES",
  id: Id,
  channel: string,
  nicks: Array<string>,
  asyncDispatch: Function
};

export type EventTopicAction = {
  type: "EVENT_TOPIC",
  id: Id,
  channel: string,
  topic: string,
  nick: string,
  asyncDispatch: Function
};

export type EventQuitAction = {
  type: "EVENT_QUIT",
  id: Id,
  nick: string,
  reason: string,
  channels: Array<string>,
  asyncDispatch: Function
};

export type EventKickAction = {
  type: "EVENT_KICK",
  id: Id,
  channel: string,
  nick: string,
  by: string,
  reason: string,
  asyncDispatch: Function
};

export type EventNickAction = {
  type: "EVENT_NICK",
  id: Id,
  oldnick: string,
  newnick: string,
  channels: Array<string>,
  asyncDispatch: Function
};

export type WhoisData = {
  nick: string,
  user: string,
  host: string,
  realname: string,
  server: string,
  serverinfo: string,
  idle: string,
  channels: Array<string>
};

export type EventWhoisAction = {
  type: "EVENT_WHOIS",
  id: Id,
  asyncDispatch: Function
} & WhoisData;

export type EventMessageAction = {
  type: "EVENT_MESSAGE",
  id: Id,
  nick: string,
  to: string,
  text: string,
  asyncDispatch: Function
};

export type EventSelfMessageAction = {
  type: "EVENT_SELFMESSAGE",
  id: Id,
  to: string,
  text: string,
  asyncDispatch: Function
};

export type SetActiveViewAction = {
  type: "SET_ACTIVE_VIEW",
  connectionId: Id,
  activeType: ActiveType,
  id: Id,
  asyncDispatch: Function
};

export type RemoveConnectionAction = {
  type: "REMOVE_CONNECTION",
  id: Id,
  asyncDispatch: Function
};

export type RemoveQueryAction = {
  type: "REMOVE_QUERY",
  id: Id,
  asyncDispatch: Function
};

export type NewQueryAction = {
  type: "NEW_QUERY",
  id: Id,
  target: string,
  asyncDispatch: Function
};

export type Action =
  | CommandConnectAction
  | EventConnectAction
  | EventMotdAction
  | EventJoinAction
  | EventPartAction
  | EventNamesAction
  | EventTopicAction
  | EventQuitAction
  | EventKickAction
  | EventNickAction
  | EventWhoisAction
  | EventMessageAction
  | EventSelfMessageAction
  | SetActiveViewAction
  | RemoveConnectionAction
  | RemoveQueryAction
  | NewQueryAction;
