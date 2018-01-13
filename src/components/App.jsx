// @flow
import React, { Component } from "react";
import Titlebar from "./Titlebar";
import ConnectionContainer from "./ConnectionContainer";
import MessageContainer from "./MessageContainer";
import InputContainer from "./InputContainer";

class App extends Component<{}> {
  render() {
    return (
      <div id="app">
        <Titlebar />
        <ConnectionContainer />
        <MessageContainer />
        <InputContainer />
      </div>
    );
  }
}

export default App;
