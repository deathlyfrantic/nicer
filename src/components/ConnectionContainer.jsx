// @flow
import { connect } from "react-redux";
import Sidebar from "./Sidebar";
import * as actions from "../actions";
import type { State, Dispatch } from "../types";

const mapStateToProps = (state: State) => {
  return {
    active: state.active,
    connections: state.connections
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setActiveView: (connectionId, type, id) => {
      dispatch(actions.setActiveView(connectionId, type, id));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
