const { expect, cloneRegExp, describe, it } = require('../lib');

describe('Clone Regexp', () => {
  it('Should clone a regexp', () => {
    const actual = cloneRegExp(/x/);
    expect(actual instanceof RegExp).toBeTruthy();
    expect(actual.source).toEqual('x');
    expect(actual.global).toBeFalsy();
    expect(actual.ignoreCase).toBeFalsy();
    expect(actual.multiline).toBeFalsy();
    expect(actual.sticky).toBeFalsy();
    expect(actual.unicode).toBeFalsy();
  });
  it('Should clone a regexp with some flags', () => {
    const actual = cloneRegExp(/x/gim);
    expect(actual instanceof RegExp).toBeTruthy();
    expect(actual.source).toEqual('x');
    expect(actual.global).toBeTruthy();
    expect(actual.ignoreCase).toBeTruthy();
    expect(actual.multiline).toBeTruthy();
    expect(actual.sticky).toBeFalsy();
    expect(actual.unicode).toBeFalsy();
  });
  it('Should clone a regexp with all flags', () => {
    const actual = cloneRegExp(/x/gimuy);
    expect(actual instanceof RegExp).toBeTruthy();
    expect(actual.source).toEqual('x');
    expect(actual.global).toBeTruthy();
    expect(actual.ignoreCase).toBeTruthy();
    expect(actual.multiline).toBeTruthy();
    expect(actual.sticky).toBeTruthy();
    expect(actual.unicode).toBeTruthy();
  });
});
