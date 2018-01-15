// @flow
import irc from "irc";
import * as actions from "./actions";
import { getClient, newClient, removeClient } from "./irc-state";
import type { State, Id, Connection, Action } from "./types";

let uniqueId: number = 0;
export const nextId = (): number => uniqueId++;

const initial: State = {
  connections: [],
  active: {
    connectionId: -1,
    type: "",
    id: -1
  }
};

const findConnectionById = (state: State, id: Id): Connection => {
  const conn = state.connections.find(c => c.id === id);
  if (conn) {
    return conn;
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
          connected: false,
          name: action.server,
          nick: action.nick,
          channels: [],
          queries: [],
          messages: []
        })
      });
    }

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
                user: null,
                read: state.active.id === conn.id
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
                topic: "",
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
              chan.messages.push({
                id: nextId(),
                type: "join",
                text: `${nick} joined channel ${chan.name}`,
                time: new Date(),
                user: nick,
                read: state.active.id === chan.id
              });
            }
          }
          return conn;
        })
      });
    }

    case "EVENT_PART": {
      const [id, channel, nick, reason] = [
        action.id,
        action.channel,
        action.nick,
        action.reason
      ];
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
                let text = `${nick} left channel ${chan.name}`;
                if (reason) {
                  text += ` (${reason})`;
                }
                chan.messages.push({
                  id: nextId(),
                  type: "part",
                  text,
                  time: new Date(),
                  user: nick,
                  read: state.active.id === chan.id
                });
              }
            }
          }
          return conn;
        })
      });
    }

    case "EVENT_NAMES": {
      const [id, channel, nicks] = [action.id, action.channel, action.nicks];
      return Object.assign({}, state, {
        connections: state.connections.map(conn => {
          if (conn.id === id) {
            conn.channels.forEach(chan => {
              if (chan.name === channel) {
                chan.users.push(...nicks);
                // TODO(Zandr Martin/2018-01-14): account for modes
                // XXX(Zandr Martin/2018-01-14): make nicks a set?
              }
            });
          }
          return conn;
        })
      });
    }

    case "EVENT_TOPIC": {
      const [id, channel, topic, nick] = [
        action.id,
        action.channel,
        action.topic,
        action.nick
      ];
      return Object.assign({}, state, {
        connections: state.connections.map(conn => {
          if (conn.id === id) {
            conn.channels.forEach(chan => {
              if (chan.name === channel) {
                chan.topic = topic;
                chan.messages.push({
                  id: nextId(),
                  type: "topic",
                  text: `${nick} set topic of ${channel} to "${topic}"`,
                  time: new Date(),
                  user: nick,
                  read: state.active.id === chan.id
                });
              }
            });
          }
          return conn;
        })
      });
    }

    case "EVENT_QUIT": {
      const [id, nick, reason, channels] = [
        action.id,
        action.nick,
        action.reason,
        action.channels
      ];
      let text = `${nick} quit`;
      if (reason) {
        text += ` (${reason})`;
      }
      return Object.assign({}, state, {
        connections: state.connections.map(conn => {
          if (conn.id === id) {
            conn.channels.forEach(chan => {
              if (channels.includes(chan.name)) {
                chan.users = chan.users.filter(u => u !== nick);
                chan.messages.push({
                  id: nextId(),
                  type: "quit",
                  text,
                  time: new Date(),
                  user: nick,
                  read: state.active.id === chan.id
                });
              }
            });
          }
          return conn;
        })
      });
    }

    case "EVENT_KICK": {
      const [id, channel, nick, by, reason] = [
        action.id,
        action.channel,
        action.nick,
        action.by,
        action.reason
      ];
      let text = `${nick} was kicked by ${by}`;
      if (reason) {
        text += ` (${reason})`;
      }
      return Object.assign({}, state, {
        connections: state.connections.map(conn => {
          if (conn.id === id) {
            conn.channels.forEach(chan => {
              if (chan.name === channel) {
                chan.users = chan.users.filter(u => u !== nick);
                chan.messages.push({
                  id: nextId(),
                  type: "kick",
                  text,
                  time: new Date(),
                  user: by,
                  read: state.active.id === chan.id
                });
              }
            });
          }
          return conn;
        })
      });
    }

    case "EVENT_NICK": {
      const [id, oldnick, newnick, channels] = [
        action.id,
        action.oldnick,
        action.newnick,
        action.channels
      ];
      const text = `${oldnick} is now ${newnick}`;
      return Object.assign({}, state, {
        connections: state.connections.map(conn => {
          if (conn.id === id) {
            if (conn.nick === oldnick) {
              // we changed our nick
              conn.nick = newnick;
            }
            conn.channels.forEach(chan => {
              if (channels.includes(chan.name)) {
                chan.users = chan.users.map(u => (u === oldnick ? newnick : u));
                chan.messages.push({
                  id: nextId(),
                  type: "nick",
                  text,
                  time: new Date(),
                  user: newnick,
                  read: state.active.id === chan.id
                });
              }
            });
            conn.queries.forEach(query => {
              if (query.name === oldnick) {
                query.name = newnick;
                query.messages.push({
                  id: nextId(),
                  type: "nick",
                  text,
                  time: new Date(),
                  user: newnick,
                  read: state.active.id === query.id
                });
              }
            });
          }
          return conn;
        })
      });
    }

    case "EVENT_WHOIS": {
      const [
        id,
        nick,
        user,
        host,
        realname,
        server,
        serverinfo,
        idle,
        channels
      ] = [
        action.id,
        action.nick,
        action.user,
        action.host,
        action.realname,
        action.server,
        action.serverinfo,
        action.idle,
        action.channels
      ];
      return Object.assign({}, state, {
        connections: state.connections.map(conn => {
          if (conn.id === id) {
            const texts = [];
            if (nick) texts.push(`nick: ${nick}`);
            if (user) texts.push(`user: ${user}`);
            if (host) texts.push(`host: ${host}`);
            if (realname) texts.push(`real name: ${realname}`);
            if (server) texts.push(`server: ${server}`);
            if (serverinfo) texts.push(`server info: ${serverinfo}`);
            if (idle) texts.push(`idle: ${idle}`);
            if (channels.length > 0) {
              texts.push(`channels: ${channels.join(" ,")}`);
            }
            texts.forEach(text => {
              conn.messages.push({
                id: nextId(),
                type: "whois",
                text,
                time: new Date(),
                user: nick || null,
                read: state.active.id === id
              });
            });
          }
          return conn;
        })
      });
    }

    case "EVENT_MESSAGE": {
      const [id, nick, to, text] = [
        action.id,
        action.nick,
        action.to,
        action.text
      ];
      return Object.assign({}, state, {
        connections: state.connections.map(conn => {
          if (conn.id === id) {
            const message = {
              id: nextId(),
              type: "normal",
              text,
              time: new Date(),
              user: nick,
              read: false
            };
            if (to === conn.nick) {
              const query = conn.queries.find(query => query.name === nick);
              if (query) {
                query.messages.push({
                  ...message,
                  read: state.active.id === query.id
                });
              } else {
                // this is a query but from a new person so we need to add it
                const id = nextId();
                conn.queries.push({
                  id,
                  name: nick,
                  messages: [{ ...message, read: false }]
                });
                action.asyncDispatch(
                  actions.setActiveView(conn.id, "query", id)
                );
              }
            } else {
              conn.channels.forEach(chan => {
                if (chan.name === to) {
                  chan.messages.push({
                    ...message,
                    read: state.active.id === chan.id
                  });
                }
              });
            }
          }
          return conn;
        })
      });
    }

    case "EVENT_SELFMESSAGE": {
      const [id, to, text] = [action.id, action.to, action.text];
      return Object.assign({}, state, {
        connections: state.connections.map(conn => {
          if (conn.id === id) {
            const message = {
              id: nextId(),
              type: "self",
              text,
              time: new Date(),
              user: conn.nick,
              read: true
            };
            const chan = conn.channels.find(c => c.name === to);
            if (chan !== undefined) {
              chan.messages.push({
                ...message,
                read: chan.id === state.active.id
              });
            } else {
              conn.queries.forEach(query => {
                if (query.id === id) {
                  query.messages.push({
                    ...message,
                    read: query.id === state.active.id
                  });
                }
              });
            }
          }
          return conn;
        })
      });
    }

    case "SET_ACTIVE_VIEW": {
      const [id, type, connectionId] = [
        action.id,
        action.activeType,
        action.connectionId
      ];
      return Object.assign({}, state, {
        connections: state.connections.map(conn => {
          // mark messages in current view as read
          if (conn.id === connectionId) {
            switch (type) {
              case "connection":
                conn.messages.forEach(m => (m.read = true));
                break;
              case "channel":
                conn.channels.forEach(chan => {
                  if (chan.id === id) {
                    chan.messages.forEach(m => (m.read = true));
                  }
                });
                break;
              case "query":
                conn.queries.forEach(query => {
                  if (query.id === id) {
                    query.messages.forEach(m => (m.read = true));
                  }
                });
                break;
              default:
                break;
            }
          }
          return conn;
        }),
        active: {
          connectionId: action.connectionId,
          type: action.activeType,
          id: action.id
        }
      });
    }

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
            try {
              removeClient(id);
            } catch (e) {
              console.dir(state); // eslint-disable-line
            }
            return false;
          }
          return true;
        })
      });
    }

    case "REMOVE_QUERY": {
      const id = action.id;
      return Object.assign({}, state, {
        connections: state.connections.map(conn => {
          conn.queries = conn.queries.filter(query => query.id !== id);
          return conn;
        })
      });
    }

    case "NEW_QUERY": {
      const [id, target] = [action.id, action.target];
      return Object.assign({}, state, {
        connections: state.connections.map(conn => {
          if (conn.id === id) {
            const query = conn.queries.find(query => query.name === target);
            if (query) {
              // just switch view to existing query
              action.asyncDispatch(
                actions.setActiveView(id, "query", query.id)
              );
            } else {
              const newId = nextId();
              conn.queries.push({
                id: newId,
                name: target,
                messages: []
              });
              action.asyncDispatch(actions.setActiveView(id, "query", newId));
            }
          }
          return conn;
        })
      });
    }

    default:
      (action: empty);
      return state;
  }
};
