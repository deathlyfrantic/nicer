// @flow
import irc from "irc";
import * as actions from "./actions";

import type { State, Id, Connection, Action } from "./types";

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

export default (state: State = initial, action: Action): State => {
  console.log("action:"); // eslint-disable-line
  console.dir(action); // eslint-disable-line
  console.log("state:"); // eslint-disable-line
  console.dir(state); // eslint-disable-line
  switch (action.type) {
    case "COMMAND_CONNECT": {
      const id = nextId();
      const client = newClient(
        id,
        action.server,
        action.nick,
        action.asyncDispatch
      );
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

    case "COMMAND_DISCONNECT": {
      const id = action.id;
      state.connections.forEach(conn => {
        if (conn.id === id) {
          const remove = () => {
            action.asyncDispatch(actions.removeConnection(conn.id));
          };
          if (action.message) {
            conn.client.disconnect(action.message, remove);
          } else {
            conn.client.disconnect(remove);
          }
        }
      });
      return state;
    }

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
        const conn: Connection = findConnectionById(state, action.id);
        if (action.reason) {
          conn.client.part(action.channel, action.reason);
        } else {
          conn.client.part(action.channel);
        }
      } catch (e) {
        console.log(e); // eslint-disable-line
      }
      return state;

    case "EVENT_CONNECT": {
      const id = action.id;
      return Object.assign({}, state, {
        connections: state.connections.map(conn => {
          if (conn.id === id) {
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
    }

    case "EVENT_MOTD": {
      const [id, motd] = [action.id, action.motd];
      return Object.assign({}, state, {
        connections: state.connections.map(conn => {
          const time = new Date();
          if (conn.id === id) {
            motd.split("\n").forEach(text => {
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
    }

    case "EVENT_JOIN": {
      const [id, channel, nick] = [action.id, action.channel, action.nick];
      return Object.assign({}, state, {
        connections: state.connections.map(conn => {
          if (conn.id === id) {
            const chan = conn.channels.find(c => c.name === channel);
            if (chan === undefined) {
              // we joined a channel we weren't in before
              const id = nextId();
              conn.channels.push({
                id,
                name: channel,
                messages: [],
                users: [nick]
              });
              action.asyncDispatch(
                actions.setActiveView(conn.id, "channel", id)
              );
            } else {
              // we were already in this channel so probably someone else joined
              if (chan.users.find(u => u === nick) === undefined) {
                chan.users.push(nick);
              }
            }
          }
          return conn;
        })
      });
    }

    case "EVENT_PART": {
      const [id, channel, nick] = [action.id, action.channel, action.nick];
      return Object.assign({}, state, {
        connections: state.connections.map(conn => {
          if (conn.id === id) {
            const chan = conn.channels.find(c => c.name === channel);
            if (chan !== undefined) {
              if (conn.nick === nick) {
                // we left a channel, so remove it from our list
                conn.channels = conn.channels.filter(c => c.id !== chan.id);
                if (state.active.id === chan.id) {
                  action.asyncDispatch(
                    actions.setActiveView(conn.id, "connection", conn.id)
                  );
                }
              } else {
                // someone else left a channel, so remove them from it
                chan.users = chan.users.filter(u => u !== nick);
                // TODO: add "so and so left (reason)" message to channel
              }
            }
          }
          return conn;
        })
      });
    }

    case "SET_ACTIVE_VIEW":
      return Object.assign({}, state, {
        active: {
          connectionId: action.connectionId,
          type: action.activeType,
          id: action.id
        }
      });

    case "REMOVE_CONNECTION": {
      const id = action.id;
      return Object.assign({}, state, {
        connections: state.connections.filter(conn => {
          if (conn.id === id) {
            if (state.active.connectionId === id) {
              const newConn = state.connections.find(c => c.id !== id);
              if (newConn !== undefined) {
                action.asyncDispatch(
                  actions.setActiveView(newConn.id, "connection", newConn.id)
                );
              } else {
                action.asyncDispatch(actions.setActiveView(-1, "", -1));
              }
            }
            return false;
          }
          return true;
        })
      });
    }

    default:
      (action: empty);
      return state;
  }
};
