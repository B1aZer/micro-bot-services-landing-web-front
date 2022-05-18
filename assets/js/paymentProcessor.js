const coinPrice = 0.00033;

export default class App {
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
        })
        $('#inputCoins').on('change', function() {
            const coinsVal = parseInt($(this).val(), 10);
            self.ee.emit('changed', coinsVal);
        })
        $('#inputEthereum').on('change', function() {
            const ethVal = parseFloat($(this).val());
            const coinsVal = parseInt(ethVal / coinPrice, 10);
            self.ee.emit('changed', coinsVal);
        })
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
