const coinPrice = 0.00033;

class App {
    constructor(ee) {
        this.ee = ee;
        this.bindCustomEvents();
        this.bindEvents();
    }
    bindEvents() {
        const self = this;
        $('#formControlRange').on('change', function() {
            const coinsVal = parseInt($(this).val(), 10);
            self.ee.emit('changed', coinsVal);
        });
        $('#inputCoins').on('change', function() {
            const coinsVal = parseInt($(this).val(), 10);
            self.ee.emit('changed', coinsVal);
        });
        $('#inputEthereum').on('change', function() {
            const ethVal = parseFloat($(this).val());
            const coinsVal = parseInt(ethVal / coinPrice, 10);
            self.ee.emit('changed', coinsVal);
        });
    }
    bindCustomEvents() {
        this.ee.on('changed', function (val) {
            const strVal = val.toString();
            const ethVal = (coinPrice * val).toString();
            $('#formControlRange').val(strVal);
            $('#inputCoins').val(strVal);
            $('#inputEthereum').val(ethVal);
        });
    }
}

class EventEmitter {
    constructor() {
      this.events = {};
    }
    on(event, listener) {
        if (typeof this.events[event] !== 'object') {
            this.events[event] = [];
        }
        this.events[event].push(listener);
        return () => this.removeListener(event, listener);
    }
    removeListener(event, listener) {
      if (typeof this.events[event] === 'object') {
          const idx = this.events[event].indexOf(listener);
          if (idx > -1) {
            this.events[event].splice(idx, 1);
          }
      }
    }
    emit(event, ...args) {
      if (typeof this.events[event] === 'object') {
        this.events[event].forEach(listener => listener.apply(this, args));
      }
    }
    once(event, listener) {
      const remove = this.on(event, (...args) => {
          remove();
          listener.apply(this, args);
      });
    }
  }

// Importing JavaScript
const ee = new EventEmitter();
new App(ee);
