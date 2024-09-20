const assert = require('node:assert');

function expect(actual) {
  return {
    toNotBe(expected) {
      assert.notStrictEqual(actual, expected);
    },
    toBe(expected) {
      assert.strictEqual(actual, expected);
    },
    toBeNull() {
      assert.strictEqual(actual, null);
    },
    toEqual(expected) {
      assert.deepStrictEqual(actual, expected);
    },
    toNotEqual(expected) {
      assert.notDeepStrictEqual(actual, expected);
    },
    toBeDefined() {
      assert.notStrictEqual(actual, undefined);
    },
    toBeUndefined() {
      assert.strictEqual(actual, undefined);
    },
    toBeTruthy() {
      assert.ok(actual);
    },
    toBeFalsy() {
      assert.ok(!actual);
    },
    toBeInstanceOf(expected) {
      assert.ok(actual instanceof expected);
    },
    toHaveLength(expected) {
      assert.strictEqual(actual.length, expected);
    },
    async toThrow(expected) {
      try {
        await actual();
        assert.fail('Function did not throw');
      } catch (error) {
        assert.strictEqual(error.message, expected);
      }
    },
    toBeNaN() {
      assert.ok(Number.isNaN(actual));
    },
  };
}

module.exports = { expect };
