import { assert } from "chai";
import { Client } from "irc";
import sinon from "sinon";
import { mapDispatchToProps } from "../src/components/InputContainer";
import * as actions from "../src/actions";
import { getClient } from "../src/irc-state";

/* eslint-env mocha */

describe("mapDispatchToProps", () => {
  describe("processCommand", () => {
    const dispatch = sinon.spy();
    const processCommand = mapDispatchToProps(dispatch).processCommand;

    it("should return early if text parameter is an empty string", () => {
      const result = processCommand("", {}, "bar");
      assert.isUndefined(result);
      assert.isTrue(dispatch.notCalled);
      dispatch.resetHistory();
    });

    describe("/connect", () => {
      it("should return early if server and nick are not both included", () => {
        const result = processCommand("/connect irc.server.foo", {}, "bar");
        assert.isUndefined(result);
        assert.isTrue(dispatch.notCalled);
        dispatch.resetHistory();
      });

      it("should dispatch a commandConnect action upon success", () => {
        const stub = sinon.stub(actions, "commandConnect").returns("foo");
        processCommand("/connect irc.server.foo baz", {}, "bar");
        assert.isTrue(stub.calledWith("irc.server.foo", "baz"));
        assert.equal(stub.callCount, 1);
        assert.isTrue(dispatch.calledWith("foo"));
        assert.equal(dispatch.callCount, 1);
        actions.commandConnect.restore();
      });
    });
  });
});
