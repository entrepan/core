class Vector {
  constructor(arr = []) {
    this.arr = [...arr];
  }

  get length() {
    return this.arr.length;
  }

  push(value) {
    this.arr.push(value);
  }

  static clone(vector) {
    return new Vector(vector.arr);
  }
}

module.exports = Vector;
