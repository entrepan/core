class SimpleTimer {
  constructor(settings = {}) {
    this.resolution = settings.resolution || process.env.TIMER_RESOLUTION || 5000;
    this.tasks = [];
  }

  start() {
    this.timer = setInterval(this.executeTick.bind(this), this.resolution);
  }

  stop() {
    clearInterval(this.timer);
  }

  async executeTick() {
    let i = 0;
    const promises = [];
    const now = Date.now();
    while (i < this.tasks.length) {
      const task = this.tasks[i];
      let increment = 1;
      if (task.inmediate || !task.lastExecuted || now - task.lastExecuted >= task.interval) {
        promises.push(task.callback());
        task.lastExecuted = now;
        if (task.oneShot) {
          this.tasks.splice(i, 1);
          increment = 0;
        }
        if (task.inmediate) {
          task.inmediate = false;
        }
      }
      i += increment;
    }
    await Promise.all(promises);
  }

  addTask(cb, interval = 60, oneShot = false, inmediate = false) {
    const task = {
      callback: cb,
      lastExecuted: Date.now(),
      interval: interval * 1000,
      oneShot,
      inmediate,
    };
    this.tasks.push(task);
  }
}

module.exports = { SimpleTimer };
