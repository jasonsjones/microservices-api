import { expect } from "chai";

describe("Test Environment", function () {
    it("sets the node environment to test", function () {
        expect(process.env.NODE_ENV).to.equal("test");
    });
});
