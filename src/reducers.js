// @flow
import irc from "irc";
import * as actions from "./actions";

import type { State, ThunkAction, Id, Connection, Dispatch } from "./types";

let uniqueId: number = 0;
const nextId = (): number => uniqueId++;

const initial: State = {
  connections: [],
  active: {
    connectionId: -1,
    type: "",
    id: -1
  }
};

const newClient = (
  id: Id,
  server: string,
  nick: string,
  dispatch: Dispatch
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
  // do all the on('foo') stuff here
  client.connect();
  return client;
};

const findConnectionById = (state: State, id: Id): Connection => {
  const conns = state.connections.filter(c => c.id === id);
  if (conns.length > 0) {
    return conns[0];
  }
  throw new Error(`Unable to find connection with id ${id}.`);
};

export default (state: State = initial, action: ThunkAction): State => {
  console.log("action:"); // eslint-disable-line
  console.dir(action); // eslint-disable-line
  console.log("state:"); // eslint-disable-line
  console.dir(state); // eslint-disable-line
  switch (action.type) {
    case "COMMAND_CONNECT": {
      const id = nextId();
      const client = newClient(id, action.server, action.nick, action.dispatch);
      return Object.assign({}, state, {
        connections: state.connections.concat({
          id,
          client,
          connected: false,
          name: action.server,
          nick: action.nick,
          channels: [],
          queries: [],
          messages: []
        })
      });
    }

    case "COMMAND_DISCONNECT":
      state.connections.forEach(conn => {
        if (conn.id === action.id) {
          const remove = () => {
            action.dispatch(actions.removeConnection(conn.id));
          };
          if (action.message) {
            conn.client.disconnect(action.message, remove);
          } else {
            conn.client.disconnect(remove);
          }
        }
      });
      return state;

    case "COMMAND_JOIN":
      try {
        const conn = findConnectionById(state, action.id);
        conn.client.join(action.channel);
      } catch (e) {
        console.log(e); // eslint-disable-line
      }
      return state;

    case "COMMAND_PART":
      try {
        const client: irc.Client = findConnectionById(state, action.id);
        if (action.reason) {
          client.part(action.channel, action.reason);
        } else {
          client.part(action.channel);
        }
      } catch (e) {
        console.log(e); // eslint-disable-line
      }
      return state;

    case "EVENT_CONNECT":
      return Object.assign({}, state, {
        connections: state.connections.map(conn => {
          if (conn.id === action.id) {
            conn.connected = true;
          }
          return conn;
        }),
        active: {
          connectionId: action.id,
          type: "connection",
          id: action.id
        }
      });

    case "EVENT_MOTD":
      return Object.assign({}, state, {
        connections: state.connections.map(conn => {
          const time = new Date();
          if (conn.id === action.id) {
            action.motd.split("\n").forEach(text => {
              conn.messages.push({
                id: nextId(),
                text,
                type: "server",
                time,
                user: null
              });
            });
          }
          return conn;
        })
      });

    case "EVENT_JOIN": {
      let newActive = state.active;
      return Object.assign({}, state, {
        connections: state.connections.map(conn => {
          if (conn.id === action.id) {
            const chan = conn.channels.find(c => c.name === action.channel);
            if (chan === undefined) {
              // we joined a channel we weren't in before
              const id = nextId();
              conn.channels.push({
                id,
                name: action.channel,
                messages: [],
                users: [action.nick]
              });
              newActive = { connectionId: conn.id, type: "channel", id: id };
            } else {
              // we were already in this channel so probably someone else joined
              if (chan.users.find(action.nick) === undefined) {
                chan.users.push(action.nick);
              }
            }
          }
          return conn;
        }),
        active: newActive
      });
    }

    case "EVENT_PART":
      return Object.assign({}, state, {
        connections: state.connections.map(conn => {
          if (conn.id === action.id) {
            const chan = conn.channels.find(c => c.name === action.channel);
            if (chan !== undefined) {
              if (conn.nick === action.nick) {
                // we left a channel, so remove it from our list
                conn.channels = conn.channels.filter(c => c.id !== chan.id);
                if (state.active.id === chan.id) {
                  action.dispatch(
                    actions.setActiveView(conn.id, "connection", conn.id)
                  );
                }
              } else {
                // someone else left a channel, so remove them from it
                chan.users = chan.users.filter(u => u !== action.nick);
                // TODO: add "so and so left (reason)" message to channel
              }
            }
          }
          return conn;
        })
      });

    case "SET_ACTIVE_VIEW":
      return Object.assign({}, state, {
        active: {
          connectionId: action.connectionId,
          type: action.activeType,
          id: action.id
        }
      });

    case "REMOVE_CONNECTION":
      return Object.assign({}, state, {
        connections: state.connections.filter(conn => {
          if (conn.id === action.id) {
            if (state.active.connectionId === action.id) {
              const newConn = state.connections.find(c => c.id !== action.id);
              if (newConn !== undefined) {
                action.dispatch(
                  actions.setActiveView(newConn.id, "connection", newConn.id)
                );
              } else {
                action.dispatch(actions.setActiveView(-1, "", -1));
              }
            }
            return false;
          }
          return true;
        })
      });

    default:
      return state;
  }
};
