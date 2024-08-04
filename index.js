const Web3 = require("web3");
const {DexContractABI} = require("./abi/DexContractABI");
const {AAWalletABI} = require("./abi/AAWalletABI");
const {Carbon1155ABI} = require("./abi/Carbon1155ABI");

const GESIA_RPC_URL = "http://43.200.218.66:8445";
const OWNER_2_PRIVATE_KEY = "";
const OWNER_2_ADDRESS = "";
const dexContractAddress = "0x0B77C44BEB285CD2a07e37bbe95235e6e3BbfAF1";


let web3 = new Web3(new Web3.providers.HttpProvider(GESIA_RPC_URL)); // gesia RPC url

const dexContract = new web3.eth.Contract(DexContractABI, dexContractAddress);

async function createBidOrder(aaWalletAddress, tokenContractAddress, tokenId, amount, price) {
    try {
        const destination = dexContractAddress;
        const value = 0;
        const data = dexContract.methods.bidOrder(tokenContractAddress, tokenId, amount, price).encodeABI();
        let account = web3.eth.accounts.privateKeyToAccount(OWNER_2_PRIVATE_KEY);
        let wallet = web3.eth.accounts.wallet.add(account);
        const gasPrice = await web3.eth.getGasPrice();
        let nonce = await web3.eth.getTransactionCount(account.address, 'pending');
        const aaWalletContract = new web3.eth.Contract(AAWalletABI, aaWalletAddress);
        const gasLimit = await aaWalletContract.methods.execute(destination, value, data).estimateGas({
            from: wallet.address, nonce: nonce
        });
        aaWalletContract.methods.execute(destination, value, data).send({
            from: wallet.address, gas: gasLimit, gasPrice: gasPrice, nonce: nonce++
        }).on('transactionHash', function (hash) {
            console.log("Transaction Hash: " + hash);
            web3.eth.accounts.wallet.clear();
        });
    } catch (e) {
        console.log(e);
    }

}

const tokenContractAddresss = "0x409caC72821207CFAe4068E23Be3d33190Ae9ad6";
const aaWalletAddress = "0xDcABF6b9d4C0b94c8191e38b3F9608C772Bd85ed";

createBidOrder(aaWalletAddress, tokenContractAddresss, 1, 10, 1000);


async function checkAllowance(aaWalletAddress, tokenContractAddress) {
    const carbon1155Contract = new web3.eth.Contract(Carbon1155ABI, tokenContractAddress);
    const isAllowanceExist = await carbon1155Contract.methods.isApprovedForAll(dexContractAddress, aaWalletAddress);
    console.log("isAllowanceExist", isAllowanceExist);
}

async function giveAllowance(aaWalletAddress, tokenContractAddress) {
    const carbon1155Contract = new web3.eth.Contract(Carbon1155ABI, tokenContractAddress);
    const data = carbon1155Contract.methods.setApprovalForAll(dexContractAddress, true).encodeABI();
    let account = web3.eth.accounts.privateKeyToAccount(OWNER_2_PRIVATE_KEY);
    let wallet = web3.eth.accounts.wallet.add(account);
    const gasPrice = await web3.eth.getGasPrice();
    let nonce = await web3.eth.getTransactionCount(account.address, 'pending');
    const aaWalletContract = new web3.eth.Contract(AAWalletABI, aaWalletAddress);
    const destination = tokenContractAddress;
    const value = 0;
    const gasLimit = await aaWalletContract.methods.execute(destination, value, data).estimateGas({
        from: wallet.address, nonce: nonce
    });
    const result = await aaWalletContract.methods.execute(destination, value, data).send({
        from: wallet.address, gas: gasLimit, gasPrice: gasPrice, nonce: nonce++
    });
    console.log("giveAllowance", result);
}

async function createAskOrder(aaWalletAddress, tokenContractAddress, tokenId, amount, price) {
    try {
        // ALWAYS CHECK ALLOWANCE BEFORE MAKING ASK_ORDER
        const isAllowanceExist = await checkAllowance(aaWalletAddress, tokenContractAddress);
        if (!isAllowanceExist) {
            // GIVE ALLOWANCE
            await giveAllowance(aaWalletAddress, tokenContractAddress);
            // PLEASE MAKE SURE IT SUCCESS GIVE_ALLOWANCE
        }
        const destination = dexContractAddress;
        const value = 0;
        const data = dexContract.methods.askOrder(tokenContractAddress, tokenId, amount, price).encodeABI();
        let account = web3.eth.accounts.privateKeyToAccount(OWNER_2_PRIVATE_KEY);
        let wallet = web3.eth.accounts.wallet.add(account);
        const gasPrice = await web3.eth.getGasPrice();
        let nonce = await web3.eth.getTransactionCount(account.address, 'pending');
        const aaWalletContract = new web3.eth.Contract(AAWalletABI, aaWalletAddress);
        const gasLimit = await aaWalletContract.methods.execute(destination, value, data).estimateGas({
            from: wallet.address, nonce: nonce
        });
        aaWalletContract.methods.execute(destination, value, data).send({
            from: wallet.address, gas: gasLimit, gasPrice: gasPrice, nonce: nonce++
        }).on('transactionHash', function (hash) {
            console.log("Transaction Hash: " + hash);
            web3.eth.accounts.wallet.clear();
        });
    } catch (e) {
        console.log(e);
    }
}

async function cancelOrder(orderId) {
    const destination = dexContractAddress;
    const value = 0;
    const data = dexContract.methods.cancelOrder(orderId).encodeABI();

    let account = web3.eth.accounts.privateKeyToAccount(OWNER_2_PRIVATE_KEY);
    let wallet = web3.eth.accounts.wallet.add(account);
    const gasPrice = await web3.eth.getGasPrice();
    let nonce = await web3.eth.getTransactionCount(account.address, 'pending');
    const aaWalletContract = new web3.eth.Contract(AAWalletABI, aaWalletAddress);
    const gasLimit = await aaWalletContract.methods.execute(destination, value, data).estimateGas({
        from: wallet.address, nonce: nonce
    });
    aaWalletContract.methods.execute(destination, value, data).send({
        from: wallet.address, gas: gasLimit, gasPrice: gasPrice, nonce: nonce++
    }).on('transactionHash', function (hash) {
        console.log("Transaction Hash: " + hash);
        web3.eth.accounts.wallet.clear();
    });
}

async function executeOrder(bidOrderId, askOrderId, orderAmount) {
    const destination = dexContractAddress;
    const value = 0;
    const data = dexContract.methods.executeOrder(bidOrderId, askOrderId, orderAmount).encodeABI();

    let account = web3.eth.accounts.privateKeyToAccount(OWNER_2_PRIVATE_KEY);
    let wallet = web3.eth.accounts.wallet.add(account);
    const gasPrice = await web3.eth.getGasPrice();
    let nonce = await web3.eth.getTransactionCount(account.address, 'pending');
    const aaWalletContract = new web3.eth.Contract(AAWalletABI, aaWalletAddress);
    const gasLimit = await aaWalletContract.methods.execute(destination, value, data).estimateGas({
        from: wallet.address, nonce: nonce
    });
    aaWalletContract.methods.execute(destination, value, data).send({
        from: wallet.address, gas: gasLimit, gasPrice: gasPrice, nonce: nonce++
    }).on('transactionHash', function (hash) {
        console.log("Transaction Hash: " + hash);
        web3.eth.accounts.wallet.clear();
    });
}

