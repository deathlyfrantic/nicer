import irc from "irc";
import * as actionTypes from "./action-types";
import * as actions from "./actions";

let uniqueId = 0;
const nextId = () => uniqueId++;

const initial = {
  clients: [], // irc.Clients go here
  connections: [
    // {
    //   id: 0,
    //   name: "irc.foo.bar",
    //   nick: "KewlDewd69", // nice
    //   channels: [
    //     {
    //       id: 0,
    //       name: "string",
    //       messages: [{ author: "string", text: "string", time: Date }],
    //       users: [nick, nick2, nick3]
    //     }
    //   ],
    //   queries: [
    //     {
    //       id: 0,
    //       name: "string",
    //       messages: [{ text: "string", time: Date }]
    //     }
    //   ],
    //   messages: [
    //      {
    //        id: 0,
    //        text: "string",
    //        time: Date
    //      }
    //  ]
    // }
  ],
  active: {
    connectionId: -1,
    type: "", // | "channel" | "query" | "connection",
    id: -1
  }
};

const newClient = (server: string, nick: string, dispatch: object) => {
  const client = new irc.Client(server, nick, {
    stripColors: true,
    autoConnect: false
  });
  client.id = nextId();
  client.server = server;
  client.on("registered", () => {
    dispatch(actions.eventConnect(client.id, client.server, client.nick));
  });
  client.on("motd", motd => {
    dispatch(actions.eventMotd(client.id, motd));
  });
  client.on("join", (channel, nick) => {
    dispatch(actions.eventJoin(client.id, channel, nick));
  });
  client.on("part", (channel, nick, reason) => {
    dispatch(actions.eventPart(client.id, channel, nick, reason));
  });
  // do all the on('foo') stuff here
  client.connect();
  return client;
};

const findById = (items, id) => {
  const item = items.find(i => i.id === id);
  if (item !== undefined) {
    return item;
  }
  throw new Error(`Unable to find item with id ${id}.`);
};

export default (state = initial, action) => {
  console.log("action:"); // eslint-disable-line
  console.dir(action); // eslint-disable-line
  console.log("state:"); // eslint-disable-line
  console.dir(state); // eslint-disable-line
  switch (action.type) {
    case actionTypes.COMMAND_CONNECT: {
      const client = newClient(
        action.payload.server,
        action.payload.nick,
        action.asyncDispatch
      );
      return Object.assign({}, state, {
        clients: state.clients.concat(client)
      });
    }

    case actionTypes.COMMAND_DISCONNECT:
      try {
        const client = findById(state.clients, action.payload.id);
        const remove = () => {
          action.asyncDispatch(actions.removeClient(client.id));
        };
        if (action.payload.message) {
          client.disconnect(action.payload.message, remove);
        } else {
          client.disconnect(remove);
        }
      } catch (e) {
        console.log(e); // eslint-disable-line
      }
      return state;

    case actionTypes.COMMAND_JOIN:
      try {
        const client = findById(state.clients, action.payload.id);
        client.join(action.payload.channel);
      } catch (e) {
        console.log(e); // eslint-disable-line
      }
      return state;

    case actionTypes.COMMAND_PART:
      try {
        const client = findById(state.clients, action.payload.id);
        if (action.payload.reason) {
          client.part(action.payload.channel, action.payload.reason);
        } else {
          client.part(action.payload.channel);
        }
      } catch (e) {
        console.log(e); // eslint-disable-line
      }
      return state;

    case actionTypes.EVENT_CONNECT:
      return Object.assign({}, state, {
        connections: state.connections.concat({
          id: action.payload.id,
          server: action.payload.server,
          nick: action.payload.nick,
          channels: [],
          messages: []
        }),
        active: {
          connectionId: action.payload.id,
          type: "connection",
          id: action.payload.id
        }
      });

    case actionTypes.EVENT_MOTD:
      return Object.assign({}, state, {
        connections: state.connections.map(conn => {
          const time = new Date();
          if (conn.id === action.payload.id) {
            action.payload.motd.split("\n").forEach(text => {
              conn.messages.push({ id: nextId(), text, time });
            });
          }
          return conn;
        })
      });

    case actionTypes.EVENT_JOIN:
      return Object.assign({}, state, {
        connections: state.connections.map(conn => {
          if (conn.id === action.payload.id) {
            const chan = conn.channels.find(
              c => c.name === action.payload.channel
            );
            if (chan === undefined) {
              // we joined a channel we weren't in before
              const id = nextId();
              conn.channels.push({
                id,
                name: action.payload.channel,
                messages: [],
                users: [action.payload.nick]
              });
              action.asyncDispatch(
                actions.setActiveView(conn.id, "channel", id)
              );
            } else {
              // we were already in this channel so probably someone else joined
              if (chan.users.find(action.payload.nick) === undefined) {
                chan.users.push(action.payload.nick);
              }
            }
          }
          return conn;
        })
      });

    case actionTypes.EVENT_PART:
      return Object.assign({}, state, {
        connections: state.connections.map(conn => {
          if (conn.id === action.payload.id) {
            const chan = conn.channels.find(
              c => c.name === action.payload.channel
            );
            if (chan !== undefined) {
              if (conn.nick === action.payload.nick) {
                // we left a channel, so remove it from our list
                conn.channels = conn.channels.filter(c => c.id !== chan.id);
                if (state.active.id === chan.id) {
                  action.asyncDispatch(
                    actions.setActiveView(conn.id, "connection", conn.id)
                  );
                }
              } else {
                // someone else left a channel, so remove them from it
                chan.users = chan.users.filter(u => u !== action.payload.nick);
                // TODO: add "so and so left (reason)" message to channel
              }
            }
          }
          return conn;
        })
      });

    case actionTypes.SET_ACTIVE_VIEW:
      return Object.assign({}, state, {
        active: Object.assign({}, action.payload)
      });

    case actionTypes.REMOVE_CLIENT: {
      const newState = Object.assign({}, state, {
        clients: state.clients.filter(c => c.id !== action.payload.id),
        connections: state.connections.filter(c => c.id !== action.payload.id)
      });
      if (state.active.connectionId === action.payload.id) {
        const newConn = state.connections.find(c => c.id !== action.payload.id);
        if (newConn !== undefined) {
          action.asyncDispatch(
            actions.setActiveView(newConn.id, "connection", newConn.id)
          );
        } else {
          action.asyncDispatch(actions.setActiveView(-1, "", -1));
        }
      }
      return newState;
    }

    default:
      return state;
  }
};
