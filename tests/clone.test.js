const { expect, factory, SHELVES, clone, describe, it } = require('../lib');

const Vector = require('./vector');

describe('clone', () => {
  it('can clone integers', () => {
    expect(clone(-4)).toEqual(-4);
    expect(clone(9007199254740991)).toEqual(9007199254740991);
  });
  it('can clone floats', () => {
    expect(clone(0.0)).toEqual(0.0);
    expect(clone(-4.5)).toEqual(-4.5);
  });
  it('can clone strings', () => {
    expect(clone('str')).toEqual('str');
  });
  it('can clone booleans', () => {
    expect(clone(true)).toEqual(true);
  });
  it('can clone typed arrays', () => {
    const arr = new Uint16Array([1, 2, 3]);
    const actual = clone(arr);
    expect(actual).toNotBe(arr);
    expect(actual).toEqual(arr);
    expect(actual instanceof Uint16Array).toEqual(true);
  });
  it('can clone regular expressions with no flags', () => {
    const actual = clone(/x/);
    expect(actual instanceof RegExp).toBeTruthy();
    expect(actual.source).toEqual('x');
    expect(actual.global).toBeFalsy();
    expect(actual.ignoreCase).toBeFalsy();
    expect(actual.multiline).toBeFalsy();
    expect(actual.sticky).toBeFalsy();
    expect(actual.unicode).toBeFalsy();
  });
  it('can clone regular expressions with some flags', () => {
    const actual = clone(/x/gim);
    expect(actual instanceof RegExp).toBeTruthy();
    expect(actual.source).toEqual('x');
    expect(actual.global).toBeTruthy();
    expect(actual.ignoreCase).toBeTruthy();
    expect(actual.multiline).toBeTruthy();
    expect(actual.sticky).toBeFalsy();
    expect(actual.unicode).toBeFalsy();
  });
  it('can clone regular expressions with all flags', () => {
    const actual = clone(/x/gimuy);
    expect(actual instanceof RegExp).toBeTruthy();
    expect(actual.source).toEqual('x');
    expect(actual.global).toBeTruthy();
    expect(actual.ignoreCase).toBeTruthy();
    expect(actual.multiline).toBeTruthy();
    expect(actual.sticky).toBeTruthy();
    expect(actual.unicode).toBeTruthy();
  });

  it('Does not copy proto properties', () => {
    const input = Object.create({ a: 1 });
    const actual = clone(input);
    expect(actual).toEqual({});
  });
  it('Should clone a simple object', () => {
    const input = { a: 1 };
    const actual = clone(input);
    expect(actual).toEqual(input);
  });
  it('Should clone circular objects', () => {
    const input = { nest: { a: 1, b: 2 } };
    input.circular = input;
    const actual = clone(input);
    expect(actual.nest).toEqual({ a: 1, b: 2 });
    expect(actual.circular.nest).toBe(actual.nest);
  });
  it('Should clone deep circular objects', () => {
    const input = { nest: { a: 1, b: 2 } };
    input.nest.circular = input;
    const actual = clone(input);
    expect(actual.nest.a).toEqual(1);
    expect(actual.nest.b).toEqual(2);
    expect(actual.nest.circular).toBe(actual);
  });
  it('Can clone circular objects but not copy proto', () => {
    const input = { nest: { a: 1, b: 2, c: Object.create({ a: 1 }) } };
    input.nest.circular = input;
    const actual = clone(input);
    expect(actual.nest.a).toEqual(1);
    expect(actual.nest.b).toEqual(2);
    expect(actual.nest.c).toEqual({});
    expect(actual.nest.circular).toBe(actual);
  });
  it('Can clone buffers from object', () => {
    const buffer = Buffer.from('123456789abcdefghi');
    const input = { a: buffer };
    const actual = clone(input);
    expect(actual.a).toNotBe(buffer);
    expect(actual.a.toString()).toEqual(buffer.toString());
  });
  it('Can clone TypedArrays from object', () => {
    const buffer = new ArrayBuffer(8);
    const int32View = new Int32Array(buffer);
    int32View[0] = 1;
    int32View[1] = 2;
    const input = { a: int32View };
    const actual = clone(input);
    expect(actual.a instanceof Int32Array).toBeTruthy();
    expect(actual).toNotBe(input);
    expect(actual.a).toNotBe(input.a);
    expect(actual.a[0]).toEqual(1);
    expect(actual.a[1]).toEqual(2);
  });

  it('Can clone numbers', () => {
    const input = 42;
    const actual = clone(input);
    expect(actual).toEqual(input);
  });
  it('Can clone strings', () => {
    const input = '42';
    const actual = clone(input);
    expect(actual).toEqual(input);
  });
  it('Can clone booleans', () => {
    const input = true;
    const actual = clone(input);
    expect(actual).toEqual(input);
  });
  it('Can clone functions', () => {
    const input = () => {};
    const actual = clone(input);
    expect(actual).toBe(input);
  });
  it('Can clone dates', () => {
    const input = new Date();
    const actual = clone(input);
    expect(actual).toEqual(input);
    expect(actual).toNotBe(input);
  });
  it('Can clone maps', () => {
    const input = new Map([['a', 1]]);
    const actual = clone(input);
    expect(actual).toEqual(input);
    expect(actual).toNotBe(input);
  });
  it('Can clone sets', () => {
    const input = new Set(['a']);
    const actual = clone(input);
    expect(actual).toEqual(input);
    expect(actual).toNotBe(input);
  });
  it('Can clone clonable instances', () => {
    const a = new Vector([1, 2, 3, 4]);
    const b = clone(a);
    expect(b).toBeInstanceOf(Vector);
    expect(b.arr).toNotBe(a.arr);
    expect(b.arr).toEqual(a.arr);
  });

  it('Can clone instances of a clase with cloning registered in factory', () => {
    factory.register(URL, (obj) => new URL(obj.href), SHELVES.cloners);
    const url = new URL('https://example.org');
    const actual = clone(url);
    expect(actual).toBeInstanceOf(URL);
    expect(actual).toNotBe(url);
    expect(actual).toEqual(url);
  });
});
