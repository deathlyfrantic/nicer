import { assert } from "chai";
import { Client } from "irc";
import sinon from "sinon";
import * as actions from "../src/actions";
import * as ircState from "../src/irc-state";

/* eslint-env mocha */

describe("irc-state", () => {
  describe("command processor (from createCommandProcessor)", () => {
    const fakeClient = sinon.createStubInstance(Client);
    ircState.addClient(1, fakeClient);
    const dispatch = sinon.spy();
    const processCommand = ircState.createCommandProcessor(dispatch);

    afterEach(() => {
      dispatch.resetHistory();
    });

    it("should return early if text parameter is an empty string", () => {
      const result = processCommand("", {}, "bar");
      assert.isUndefined(result);
      assert.isTrue(dispatch.notCalled);
    });

    describe("/connect", () => {
      it("should return early if server and nick are not both included", () => {
        const result = processCommand("/connect irc.server.foo", {}, "bar");
        assert.isUndefined(result);
        assert.isTrue(dispatch.notCalled);
      });

      it("should dispatch a commandConnect action upon success", () => {
        const stub = sinon.stub(actions, "commandConnect").returns("connect");
        processCommand("/connect irc.server.foo baz", {}, "bar");
        assert.isTrue(stub.calledWith("irc.server.foo", "baz"));
        assert.isTrue(stub.calledOnce);
        assert.isTrue(dispatch.calledWith("connect"));
        assert.isTrue(dispatch.calledOnce);
        stub.restore();
      });
    });

    describe("/disconnect", () => {
      it("should call the client's disconnect method", () => {
        processCommand("/disconnect my message", { connectionId: 1 }, "foobar");
        assert.isTrue(fakeClient.disconnect.calledWith("my message"));
      });

      it(
        "should provide a callback to disconnect which dispatches a " +
          "removeConnection action",
        () => {
          const callback = fakeClient.disconnect.getCall(0).args[1];
          assert.isFunction(callback);
          const stub = sinon
            .stub(actions, "removeConnection")
            .returns("remove");
          callback();
          assert.isTrue(dispatch.calledWith("remove"));
          assert.isTrue(stub.calledWith(1));
          assert.isTrue(stub.calledOnce);
        }
      );

      fakeClient.disconnect.reset();
    });
  });
});
