const { isClass } = require('./is-class');
const { logger } = require('./logger');

const SHELVES = {
  Classes: 'classes',
  Initializers: 'initializers',
  Singletons: 'singletons',
  Cloners: 'cloners',
  Serializers: 'serializers',
  Deserializers: 'deserializers',
};

class Container {
  constructor() {
    this.shelves = new Map();
    this.itemShelves = {};
  }

  static getName(obj) {
    if (typeof obj === 'string') {
      return obj;
    }
    return obj.constructor?.name !== 'Function' ? obj.constructor.name : obj.name;
  }

  getShelve(name, autocreate = false) {
    if (!this.shelves.has(name) && autocreate) {
      this.shelves.set(name, new Map());
    }
    return this.shelves.get(name);
  }

  getFromShelve(shelveName, obj) {
    if (shelveName === true || shelveName === undefined || shelveName === null) {
      // eslint-disable-next-line no-param-reassign
      shelveName = SHELVES.Singletons;
    }
    const shelve = this.getShelve(shelveName, false);
    return shelve?.get(Container.getName(obj));
  }

  setIntoShelve(shelveName, obj, value) {
    const shelve = this.getShelve(shelveName, true);
    const name = Container.getName(obj);
    shelve.set(name, value);
    if (!this.itemShelves[name]) {
      this.itemShelves[name] = shelveName;
    }
  }

  removeFromShelve(shelveName, obj) {
    const shelve = this.getShelve(shelveName, false);
    if (!shelve) {
      return undefined;
    }
    const name = Container.getName(obj);
    const value = shelve.get(name);
    shelve.delete(name);
    return value;
  }

  register(srcName, srcValue, srcShelveName) {
    let name = srcName;
    let value = srcValue;
    let shelveName = srcShelveName;
    if (!value) {
      if (isClass(name)) {
        value = name;
        name = name.name;
        shelveName ??= SHELVES.Classes;
      }
    }
    if (shelveName === undefined || shelveName === null) {
      shelveName = this.itemShelves[name];
    }
    if (shelveName === true || shelveName === undefined || shelveName === null) {
      shelveName = SHELVES.Singletons;
    }
    this.setIntoShelve(shelveName, name, value);
  }

  get(name, shelveName) {
    if (!shelveName) {
      // eslint-disable-next-line no-param-reassign
      shelveName = this.itemShelves[name] || SHELVES.Classes;
    }
    return this.getFromShelve(shelveName, name);
  }

  remove(name, shelveName) {
    if (!shelveName) {
      // eslint-disable-next-line no-param-reassign
      shelveName = this.itemShelves[name] || SHELVES.Classes;
    }
    return this.removeFromShelve(shelveName, name);
  }

  getInstance(name, settings) {
    const clazz = this.get(name);
    if (!clazz) {
      return undefined;
    }
    const initializer = this.get(name, SHELVES.Initializers) || ((Clazz, opts) => new Clazz(opts));
    return initializer(clazz, settings);
  }
}

const ioc = new Container();
ioc.register('logger', logger, true);

module.exports = {
  Container,
  ioc,
  SHELVES,
};
