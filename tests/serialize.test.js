const { expect, serialize, deserialize, describe, it, ioc } = require('../lib');
const LinkedList = require('./linked-list');
const LinkedListNode = require('./linked-list-node');

function getlist() {
  return new LinkedList(1, 2, 3);
}

ioc.register(LinkedList);
ioc.register(LinkedListNode);

describe('serialize', () => {
  it('Should serialize a non object', () => {
    const input = 7;
    const actual = serialize(input);
    expect(actual).toEqual({ refs: [], value: 7 });
  });
  it('Should serialize and deserialize an instance of a Class', () => {
    const obj = { list: new LinkedList(1, 2, 3) };
    const serialized = serialize(obj);
    const deserialized = deserialize(serialized);
    expect(deserialized).toBeInstanceOf(Object);
    expect(deserialized.list).toBeInstanceOf(LinkedList);
    expect(deserialized.list.head).toBeInstanceOf(LinkedListNode);
    expect(deserialized.list.head.data).toBe(1);
    expect(deserialized.list.head.next).toBeInstanceOf(LinkedListNode);
    expect(deserialized.list.head.next.data).toBe(2);
    expect(deserialized.list.head.next.next).toBeInstanceOf(LinkedListNode);
    expect(deserialized.list.head.next.next.data).toBe(3);
    expect(deserialized.list.head.next.next.next).toBeNull();
  });
  it('Should serialize a complex object', () => {
    const input = getlist();
    const actual = serialize(input);
    expect(actual).toEqual({
      refs: [
        {
          className: 'LinkedList',
          value: {
            head: '@@ref:1',
            size: 3,
            tail: '@@ref:3',
          },
        },
        {
          className: 'LinkedListNode',
          value: {
            data: 1,
            next: '@@ref:2',
            prev: null,
          },
        },
        {
          className: 'LinkedListNode',
          value: {
            data: 2,
            next: '@@ref:3',
            prev: '@@ref:1',
          },
        },
        {
          className: 'LinkedListNode',
          value: {
            data: 3,
            next: null,
            prev: '@@ref:2',
          },
        },
      ],
      value: '@@ref:0',
    });
  });
  it('Should serialize and deserialize a complex object', () => {
    const now = new Date();
    const complexObject = {
      id: 1,
      name: 'test',
      items: [1, 2, 3],
      nested: {
        id: 2,
        name: 'nested',
        subnested: {
          id: 100,
          items: [1, 2, { id: 101, name: 'subnested' }, now],
        },
      },
      circular: {
        id: 3,
        name: 'circular',
      },
      createdAt: now,
      map: new Map([
        [1, 2],
        [3, 4],
      ]),
    };
    complexObject.circular.parent = complexObject;

    const serialized = serialize(complexObject);
    const deserialized = deserialize(serialized);
    expect(deserialized).toBeInstanceOf(Object);
    expect(deserialized.id).toBe(1);
    expect(deserialized.name).toBe('test');
    expect(deserialized.items).toEqual([1, 2, 3]);
    expect(deserialized.nested).toBeInstanceOf(Object);
    expect(deserialized.nested.id).toBe(2);
    expect(deserialized.nested.name).toBe('nested');
    expect(deserialized.nested.subnested).toBeInstanceOf(Object);
    expect(deserialized.nested.subnested.id).toBe(100);
    expect(deserialized.nested.subnested.items).toEqual([1, 2, { id: 101, name: 'subnested' }, now]);
    expect(deserialized.nested.subnested.items[3]).toBeInstanceOf(Date);
    expect(deserialized.circular).toBeInstanceOf(Object);
    expect(deserialized.circular.id).toBe(3);
    expect(deserialized.circular.name).toBe('circular');
    expect(deserialized.createdAt).toBeInstanceOf(Date);
    expect(deserialized.circular.parent).toBe(deserialized);
    expect(deserialized.map).toBeInstanceOf(Map);
    expect(deserialized.map.get(1)).toBe(2);
  });
});
