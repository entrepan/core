const SHELVES = {
  classes: 'classes',
  initializers: 'initializers',
  singletons: 'singletons',
  cloners: 'cloners',
  serializers: 'serializers',
  deserializers: 'deserializers',
};

class Factory {
  constructor() {
    this.shelves = new Map();
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
    const shelve = this.getShelve(shelveName, false);
    return shelve?.get(Factory.getName(obj));
  }

  setIntoShelve(shelveName, obj, value) {
    const shelve = this.getShelve(shelveName, true);
    shelve.set(Factory.getName(obj), value);
  }

  register(name, value, shelveName = SHELVES.classes) {
    this.setIntoShelve(shelveName, name, value || name);
  }

  get(name, shelveName = SHELVES.classes) {
    return this.getFromShelve(shelveName, name);
  }

  getInstance(name, settings) {
    const clazz = this.get(name);
    if (!clazz) {
      return undefined;
    }
    const initializer = this.get(name, SHELVES.initializers) || ((Clazz, opts) => new Clazz(opts));
    return initializer(clazz, settings);
  }

  registerSingleton(name, singleton) {
    this.register(name, singleton, SHELVES.singletons);
  }

  getSingleton(name) {
    return this.get(name, SHELVES.singletons);
  }
}

const factory = new Factory();

module.exports = {
  Factory,
  factory,
  SHELVES,
};
