const coinPrice = 0.00033;
const contractAddress = '0xD604a01d4a1e41c24299d47CA767e07429000FfA';
const chainId = 4;
const abi = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "discordId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amountPayed",
                "type": "uint256"
            }
        ],
        "name": "buyCoinsEvent",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "discordId",
                "type": "uint256"
            }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

export default class App {
    constructor(ee) {
        this.ee = ee;
        this.discordID = null;
        //eth
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = null;
        this.bindCustomEvents();
        this.bindEvents();
        this.discordOauth();
        this.ethAuth();
    }
    bindEvents() {
        const self = this;
        $('#formControlRange').on('change', function () {
            const coinsVal = parseInt($(this).val(), 10);
            self.ee.emit('changed', coinsVal);
        })
        $('#inputCoins').on('change', function () {
            const coinsVal = parseInt($(this).val(), 10);
            self.ee.emit('changed', coinsVal);
        })
        $('#inputEthereum').on('change', function () {
            const ethVal = parseFloat($(this).val());
            const coinsVal = parseInt(ethVal / coinPrice, 10);
            self.ee.emit('changed', coinsVal);
        })
        $('#submitBtn').on('click', function (e) {
            e.preventDefault();
            // wait for events to complete
            setTimeout(function cb() {
                const ethVal = $('#inputEthereum').val();
                const ethFormattedValue = ethers.utils.parseEther(ethVal);
                self.sendTx(ethFormattedValue);
            });
        })
    }
    bindCustomEvents() {
        this.ee.on('changed', function (valInput) {
            let val = valInput;
            if (!val || isNaN(val) || val < 100) val = 100;
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
        this.ee.on('chainId', function (chainIdReceived) {
            if (chainIdReceived !== chainId) {
                $('.toast').toast({ autohide: false }).toast('show')
            }
        });
    }
    discordOauth() {
        const fragment = new URLSearchParams(window.location.hash.slice(1));
        const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];
        if (accessToken) {
            this.ee.emit('step2')
        } else {
            this.ee.emit('step1');
            return;
        }

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
    async ethAuth() {
        await this.provider.send("eth_requestAccounts", []);
        this.signer = this.provider.getSigner();
        const network = await this.provider.getNetwork();
        this.ee.emit('chainId', network.chainId);
    }
    async sendTx(ethFormattedValue) {
        // Get the balance of an account (by address or ENS name, if supported by network)
        //let balance = await this.provider.getBalance(await signer.getAddress());
        // { BigNumber: "82826475815887608" }

        // Often you need to format the output to something more user-friendly,
        // such as in ether (instead of wei)
        //let eth = ethers.utils.formatEther(balance)
        // '0.082826475815887608'
        //console.log(eth);

        const myContract = new ethers.Contract(contractAddress, abi, this.provider);
        const myContractWithSigner = myContract.connect(this.signer);

        //const eth1 = ethers.utils.parseEther("1.0");

        // Receive an event when ANY transfer occurs
        /*
        myContract.on("buyXpEvent", (from, to, amount, event) => {
            console.log(`${from} sent ${amount} to ${to}`);
            // The event object contains the verbatim log data, the
            // EventFragment and functions to fetch the block,
            // transaction and receipt and event functions
        });
        */

        //let tx = myContractWithSigner.mint(this.discordID, { value: eth1 });
        let tx = await myContractWithSigner.mint(this.discordID, { value: ethFormattedValue });
        console.log(tx);
    }
}
