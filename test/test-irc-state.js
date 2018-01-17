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
    const active = { connectionId: 1 };
    const target = "target";

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
      after(() => {
        fakeClient.disconnect.reset();
      });

      it("should call the client's disconnect method", () => {
        processCommand("/disconnect my message", active, target);
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
    });

    describe("/join", () => {
      afterEach(() => {
        fakeClient.join.reset();
      });

      it("should return early if no channels are specified", () => {
        processCommand("/join", active, target);
        assert.isTrue(fakeClient.join.notCalled);
      });

      it("should call the client's join method", () => {
        processCommand("/join #channel1 #channel2", active, target);
        assert.isTrue(fakeClient.join.calledWith("#channel1 #channel2"));
      });
    });

    describe("/part (or /close or /leave)", () => {
      afterEach(() => {
        fakeClient.part.reset();
      });

      it("should call the client's part method with the active channel", () => {
        processCommand("/part", { ...active, type: "channel" }, target);
        assert.isTrue(fakeClient.part.calledWith(target));
        assert.isTrue(fakeClient.part.calledOnce);
      });

      it("should call the client's part method with a message", () => {
        processCommand("/part this is my reason", active, target);
        assert.isTrue(fakeClient.part.calledWith(target, "this is my reason"));
        assert.isTrue(fakeClient.part.calledOnce);
      });

      it("should part a specified channel with a reason", () => {
        processCommand("/leave #foobar some reason", active, target);
        assert.isTrue(fakeClient.part.calledWith("#foobar", "some reason"));
        assert.isTrue(fakeClient.part.calledOnce);
      });

      it("should dispatch a removeQuery action", () => {
        const stub = sinon.stub(actions, "removeQuery").returns("remove");
        processCommand("/close", { ...active, type: "query", id: 123 }, target);
        assert.isTrue(stub.calledWith(123));
        assert.isTrue(stub.calledOnce);
        assert.isTrue(dispatch.calledWith("remove"));
        assert.isTrue(dispatch.calledOnce);
      });
    });

    describe("/msg (or /query)", () => {
      afterEach(() => {
        fakeClient.say.reset();
      });

      it("should return early if no user is included", () => {
        processCommand("/msg", active, target);
        assert.isTrue(fakeClient.say.notCalled);
        assert.isTrue(dispatch.notCalled);
      });

      it("should call the client's say method if provided a message", () => {
        processCommand("/msg user  hello there!", active, target);
        assert.isTrue(fakeClient.say.calledWith("user", "hello there!"));
        assert.isTrue(fakeClient.say.calledOnce);
      });

      it("should dispatch a newQuery action if no message provided", () => {
        const stub = sinon.stub(actions, "newQuery").returns("newquery");
        processCommand("/query user", active, target);
        assert.isTrue(stub.calledWith(active.connectionId, "user"));
        assert.isTrue(stub.calledOnce);
        assert.isTrue(dispatch.calledOnce);
        assert.isTrue(dispatch.calledWith("newquery"));
        assert.isTrue(fakeClient.say.notCalled);
      });
    });

    describe("/quit", () => {});

    describe("/whois", () => {
      afterEach(() => {
        fakeClient.whois.reset();
      });

      it("should not do anything if not provided with a user", () => {
        processCommand("/whois", active, target);
        assert.isTrue(fakeClient.whois.notCalled);
      });

      it("should call the client's whois method with a user", () => {
        processCommand("/whois user123", active, target);
        assert.isTrue(fakeClient.whois.calledWith("user123"));
        assert.isTrue(fakeClient.whois.calledOnce);
      });
    });
  });
});
