const Web3 = require("web3");
const {DexContractABI} = require("./abi/DexContractABI");
const {AAWalletABI} = require("./abi/AAWalletABI");
const {Carbon1155ABI} = require("./abi/Carbon1155ABI");
const {ERC20} = require("./abi/ERC20");

const GESIA_RPC_URL = "http://43.200.218.66:8445";
const OWNER_2_PRIVATE_KEY = "";
const OWNER_2_ADDRESS = "";
const dexContractAddress = "0x0B77C44BEB285CD2a07e37bbe95235e6e3BbfAF1";


let web3 = new Web3(new Web3.providers.HttpProvider(GESIA_RPC_URL)); // gesia RPC url
const dexContract = new web3.eth.Contract(DexContractABI, dexContractAddress);

async function createBidOrder(aaWalletAddress, nftContractAddress, tokenId, amount, price) {
    try {
        const destination = dexContractAddress;
        const value = 0;
        const data = dexContract.methods.bidOrder(nftContractAddress, tokenId, amount, price).encodeABI();
        let account = web3.eth.accounts.privateKeyToAccount(OWNER_2_PRIVATE_KEY);
        let wallet = web3.eth.accounts.wallet.add(account);
        const gasPrice = await web3.eth.getGasPrice();
        let nonce = await web3.eth.getTransactionCount(account.address, 'pending');
        const aaWalletContract = new web3.eth.Contract(AAWalletABI, aaWalletAddress);
        const gasLimit = await aaWalletContract.methods.execute(destination, value, data).estimateGas({
            from: wallet.address, nonce: nonce
        });
        return await aaWalletContract.methods.execute(destination, value, data).send({
            from: wallet.address, gas: gasLimit, gasPrice: gasPrice, nonce: nonce++
        });
    } catch (e) {
        console.log(e);
    }

}


async function checkAllowanceToken(aaWalletAddress, tokenContractAddress) {
    const nzcContract = new web3.eth.Contract(ERC20, tokenContractAddress);
    return await nzcContract.methods.allowance(aaWalletAddress, dexContractAddress);
}

async function checkAllowanceNFT(aaWalletAddress, tokenContractAddress) {
    const carbon1155Contract = new web3.eth.Contract(Carbon1155ABI, tokenContractAddress);
    const isAllowanceExist = await carbon1155Contract.methods.isApprovedForAll(dexContractAddress, aaWalletAddress);
    console.log("isAllowanceExist", isAllowanceExist);
}

async function giveAllowanceToken(aaWalletAddress, tokenContractAddress) {
    const tokenContract = new web3.eth.Contract(ERC20, tokenContractAddress);
    const data = tokenContract.methods.approve(dexContractAddress, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
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

async function giveAllowanceNFT(aaWalletAddress, nftContractAddress) {
    const carbon1155Contract = new web3.eth.Contract(Carbon1155ABI, nftContractAddress);
    const data = carbon1155Contract.methods.setApprovalForAll(dexContractAddress, true).encodeABI();
    let account = web3.eth.accounts.privateKeyToAccount(OWNER_2_PRIVATE_KEY);
    let wallet = web3.eth.accounts.wallet.add(account);
    const gasPrice = await web3.eth.getGasPrice();
    let nonce = await web3.eth.getTransactionCount(account.address, 'pending');
    const aaWalletContract = new web3.eth.Contract(AAWalletABI, aaWalletAddress);
    const destination = nftContractAddress;
    const value = 0;
    const gasLimit = await aaWalletContract.methods.execute(destination, value, data).estimateGas({
        from: wallet.address, nonce: nonce
    });
    const result = await aaWalletContract.methods.execute(destination, value, data).send({
        from: wallet.address, gas: gasLimit, gasPrice: gasPrice, nonce: nonce++
    });
    console.log("giveAllowance", result);
}

async function createAskOrder(aaWalletAddress, nftContractAddress, tokenId, amount, price) {
    try {
        const destination = dexContractAddress;
        const value = 0;
        const data = dexContract.methods.askOrder(nftContractAddress, tokenId, amount, price).encodeABI();
        let account = web3.eth.accounts.privateKeyToAccount(OWNER_2_PRIVATE_KEY);
        let wallet = web3.eth.accounts.wallet.add(account);
        const gasPrice = await web3.eth.getGasPrice();
        let nonce = await web3.eth.getTransactionCount(account.address, 'pending');
        const aaWalletContract = new web3.eth.Contract(AAWalletABI, aaWalletAddress);
        const gasLimit = await aaWalletContract.methods.execute(destination, value, data).estimateGas({
            from: wallet.address, nonce: nonce
        });
        return await aaWalletContract.methods.execute(destination, value, data).send({
            from: wallet.address, gas: gasLimit, gasPrice: gasPrice, nonce: nonce++
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
    let account = web3.eth.accounts.privateKeyToAccount(OWNER_2_PRIVATE_KEY);
    let wallet = web3.eth.accounts.wallet.add(account);
    const gasPrice = await web3.eth.getGasPrice();
    let nonce = await web3.eth.getTransactionCount(account.address, 'pending');
    const gasLimit = await dexContract.methods.executeOrder(bidOrderId, askOrderId, orderAmount).estimateGas({
        from: wallet.address, nonce: nonce
    });
    return await dexContract.methods.executeOrder(bidOrderId, askOrderId, orderAmount).send({
        from: wallet.address, gas: gasLimit, gasPrice: gasPrice, nonce: nonce++
    });
}


const tokenContractAddress = ""; // NZC Token Contract
const nftContractAddress = "0x409caC72821207CFAe4068E23Be3d33190Ae9ad6"; // Carbon NFT Contract
const aaWalletAddress = "0xDcABF6b9d4C0b94c8191e38b3F9608C772Bd85ed"; // AA Wallet address


// ------------------- CREATE ORDER ----------------------

// 1. CHECK ALLOWANCE (TOKEN)
// 2. IF NOT ENOUGH ALLOWANCE, GIVE ALLOWANCE (TOKEN)
// 3. MAKE BID ORDER
async function testBidOrder() {
    const amount = 1; // NFT amount
    let price = 1000; // NZC amount it should be wei while sending to blockchain
    // 1. CHECK ALLOWANCE (TOKEN)
    const allowanceTokenAmount = await checkAllowanceToken(aaWalletAddress, tokenContractAddress);
    if (allowanceTokenAmount < Web3.utils.toWei(price, "ether")) {
        // 2. GIVE ALLOWANCE (TOKEN)
        await giveAllowanceToken(aaWalletAddress, tokenContractAddress);
        // PLEASE MAKE SURE TRANSACTION SUCCESS AND COMPLETE
    }
    // CONVERT price to WEI
    price = Web3.utils.toWei(price, 'ether');
    const result = await createBidOrder(aaWalletAddress, nftContractAddress, 1, amount, price)
    console.log("bidOrderResult", result);
}

// ------------------- ASK ORDER ----------------------

// 1. CHECK ALLOWANCE (NFT)
// 2. IF NOT ENOUGH ALLOWANCE, GIVE ALLOWANCE (NFT)
// 3. MAKE ASK ORDER
async function testAskOrder() {
    const amount = 1; // NFT amount
    let price = 1000; // NZC amount it should be wei while sending to blockchain
    // 1. CHECK ALLOWANCE (NFT)
    const isAllowanceExist = await checkAllowanceNFT(aaWalletAddress, nftContractAddress); // return boolean
    if (!isAllowanceExist) {
        // 2. GIVE ALLOWANCE (NFT)
        await giveAllowanceNFT(aaWalletAddress, nftContractAddress);
        // PLEASE MAKE SURE TRANSACTION SUCCESS AND COMPLETE
    }
    // CONVERT price to WEI
    price = Web3.utils.toWei(price, 'ether');
    const result = await createAskOrder(aaWalletAddress, nftContractAddress, 1, amount, price)
    console.log("askOrderResult", result);
}

// ------------------- CANCEL ORDER ----------------------

// 1. MAKE CANCEL ORDER
async function testCancelOrder() {
    const orderId = 1;
    const result = await cancelOrder(orderId)
    console.log("cancelOrderResult", result);
}

// ------------------- EXECUTE ORDER ----------------------

// 1. MAKE EXECUTE ORDER
async function testExecuteOrder() {
    const bidOrderId = 1;
    const askOrderId = 2;
    const orderAmount = 100;
    const result = await executeOrder(bidOrderId, askOrderId, orderAmount)
    console.log("executeOrderResult", result);
}
