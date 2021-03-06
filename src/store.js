// @flow
import { createStore, applyMiddleware } from "redux";
import reducer from "./reducers";

// from https://lazamar.github.io/dispatching-from-inside-of-reducers/
const asyncDispatchMiddleware = store => next => action => {
  let syncActivityFinished = false;
  let actionQueue = [];
  const flushQueue = () => {
    actionQueue.forEach(a => store.dispatch(a)); // flush queue
    actionQueue = [];
  };
  const asyncDispatch = asyncAction => {
    actionQueue = actionQueue.concat([asyncAction]);
    if (syncActivityFinished) {
      flushQueue();
    }
  };
  const actionWithAsyncDispatch = Object.assign({}, action, { asyncDispatch });
  next(actionWithAsyncDispatch);
  syncActivityFinished = true;
  flushQueue();
};

const store = createStore(reducer, applyMiddleware(asyncDispatchMiddleware));
export default store;
