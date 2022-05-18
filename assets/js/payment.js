//const ee = require("./emitter.js");
//const Web3 = require("@alch/alchemy-web3");
//require("../../node_modules/dotenv/lib/main.js");
//import "../../artifacts/contracts/XpContract1.json";
let abi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
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
        "name": "amountPayed",
        "type": "uint256"
      }
    ],
    "name": "buyXpEvent",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "mint",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

export default class App {
  constructor() {
    this.ws = new WebSocket("ws://localhost:8080");
    // Listen for messages

    this.ws.addEventListener('message', function (event) {
      console.log('Message from server ', event.data);
    });

    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.ee = $('body');
    this.bindCustomEvents();
    this.bindUIEvents();
    this.discordOauth();
  }
  async bindUIEvents() {
    $('#exampleInputEmail1').on('input', () => {
      let val = $('#exampleInputEmail1').val();
      this.ee.trigger('customEventName', [val]);
    });
    $('#sub').on('click', (e) => {
      e.preventDefault();
      console.log('1');
      this.ws.send(JSON.stringify({ url: 'url', strategy: 'hello!' }));
    });
  }
  async eth() {
    await this.provider.send("eth_requestAccounts", []);
    const signer = this.provider.getSigner();

    // Get the balance of an account (by address or ENS name, if supported by network)
    let balance = await this.provider.getBalance(await signer.getAddress());
    // { BigNumber: "82826475815887608" }

    // Often you need to format the output to something more user-friendly,
    // such as in ether (instead of wei)
    let eth = ethers.utils.formatEther(balance)
    // '0.082826475815887608'
    console.log(eth);

    let contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const myContract = new ethers.Contract(contractAddress, abi, this.provider);
    const myContractWithSigner = myContract.connect(signer);

    const eth1 = ethers.utils.parseEther("1.0");

    // Receive an event when ANY transfer occurs
    myContract.on("buyXpEvent", (from, to, amount, event) => {
      console.log(`${from} sent ${amount} to ${to}`);
      // The event object contains the verbatim log data, the
      // EventFragment and functions to fetch the block,
      // transaction and receipt and event functions
    });

    let tx = myContractWithSigner.mint({ value: eth1 });
    console.log(tx);



  }
  bindCustomEvents() {
    this.ee.on('customEventName', (objectEvent, args) => {
      console.log(1);
      $('#total_amount').html(args);
    });
  }
  discordOauth() {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];

    fetch('https://discord.com/api/users/@me', {
      headers: {
        authorization: `${tokenType} ${accessToken}`,
      },
    })
      .then(result => result.json())
      .then(response => {
        const { username, discriminator, id } = response;
        this.ws.send(JSON.stringify({ event: 'login', data: `${id}`}));
      })
      .catch(console.error);
  }
}