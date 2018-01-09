import { connect } from "react-redux";
import Sidebar from "./Sidebar";
import * as actions from "../actions";

const mapStateToProps = state => {
  return {
    active: state.active,
    connections: state.connections
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setActiveView: (connectionId, type, id) => {
      dispatch(actions.setActiveView(connectionId, type, id));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
