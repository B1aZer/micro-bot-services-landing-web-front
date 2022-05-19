const coinPrice = 0.00033;

class App {
    constructor(ee) {
        this.ee = ee;
        this.discordID = null;
        this.bindCustomEvents();
        this.bindEvents();
        this.discordOauth();
    }
    bindEvents() {
        const self = this;
        $('#formControlRange').on('change', function () {
            const coinsVal = parseInt($(this).val(), 10);
            self.ee.emit('changed', coinsVal);
        });
        $('#inputCoins').on('change', function () {
            const coinsVal = parseInt($(this).val(), 10);
            self.ee.emit('changed', coinsVal);
        });
        $('#inputEthereum').on('change', function () {
            const ethVal = parseFloat($(this).val());
            const coinsVal = parseInt(ethVal / coinPrice, 10);
            self.ee.emit('changed', coinsVal);
        });
        $('#submitBtn').on('click', function (e) {
            e.preventDefault();
            // wait for events to complete
            setTimeout(function cb() {
                console.log('Callback 1: this is a msg from call back');
            });
        });
    }
    bindCustomEvents() {
        this.ee.on('changed', function (valInput) {
            let val = valInput;
            if (!val || isNaN(val)) val = 100;
            const strVal = val.toString();
            const ethVal = (coinPrice * val).toString();
            $('#formControlRange').val(strVal);
            $('#inputCoins').val(strVal);
            $('#inputEthereum').val(ethVal);
        });
        this.ee.on('step1', function () {
            $('.step1').show().addClass('fadeIn');
        });
        this.ee.on('step2', function () {
            $('.step2').show().addClass('fadeIn');
        });
    }
    discordOauth() {
        const fragment = new URLSearchParams(window.location.hash.slice(1));
        const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];
        accessToken ? this.ee.emit('step2') : this.ee.emit('step1');

        fetch('https://discord.com/api/users/@me', {
            headers: {
                authorization: `${tokenType} ${accessToken}`,
            },
        })
            .then(result => result.json())
            .then(response => {
                const { username, discriminator, id } = response;
                this.discordID = id;
            })
            .catch(console.error);
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
