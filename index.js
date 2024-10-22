const Web3 = require("web3");
const {DexContractABI} = require("./abi/DexContractABI");
const {AAWalletABI} = require("./abi/AAWalletABI");
const {Carbon1155ABI} = require("./abi/Carbon1155ABI");
const {
    GESIA_RPC_URL, DEX_CONTRACT_ADDRESS, OWNER_2_PRIVATE_KEY, CARBON_NFT_CONTRACT_ADDRESS,
    AA_WALLET_ADDRESS
} = require("./consts");


let web3 = new Web3(new Web3.providers.HttpProvider(GESIA_RPC_URL)); // gesia RPC url
const dexContract = new web3.eth.Contract(DexContractABI, DEX_CONTRACT_ADDRESS);
let account = web3.eth.accounts.privateKeyToAccount(OWNER_2_PRIVATE_KEY);
let wallet = web3.eth.accounts.wallet.add(account);

async function createBidOrder(aaWalletAddress, nftContractAddress, tokenId, amount, price) {
    try {
        const destination = DEX_CONTRACT_ADDRESS;
        const value = Web3.utils.toWei((amount * price).toString(), 'ether'); // Calculate the correct Ether value
        const data = dexContract.methods.bidOrder(nftContractAddress, tokenId, amount, Web3.utils.toWei(price.toString(), 'ether')).encodeABI();
        const gasPrice = await web3.eth.getGasPrice();
        let nonce = await web3.eth.getTransactionCount(account.address, 'pending');
        const aaWalletContract = new web3.eth.Contract(AAWalletABI, aaWalletAddress);
        const gasLimit = await aaWalletContract.methods.execute(destination, value, data).estimateGas({
            from: wallet.address, nonce: nonce
        });
        return await aaWalletContract.methods.execute(destination, value, data).send({
            from: wallet.address, gas: gasLimit, gasPrice: gasPrice, nonce: nonce
        });
    } catch (e) {
        console.log(e);
    }
}

async function checkBalanceNft(aaWalletAddress, nftContractAddress, tokenId) {
    const carbonNftContract = new web3.eth.Contract(Carbon1155ABI, nftContractAddress);
    return await carbonNftContract.methods.balanceOf(aaWalletAddress, tokenId).call();
}

async function checkAllowanceNFT(aaWalletAddress, nftContractAddress) {
    const carbon1155Contract = new web3.eth.Contract(Carbon1155ABI, nftContractAddress);
    const isAllowanceExist = await carbon1155Contract.methods.isApprovedForAll(aaWalletAddress, DEX_CONTRACT_ADDRESS).call();
    console.log("isAllowanceExist", isAllowanceExist);
    return isAllowanceExist;
}

async function giveAllowanceNFT(aaWalletAddress, nftContractAddress) {
    const carbon1155Contract = new web3.eth.Contract(Carbon1155ABI, nftContractAddress);
    const data = carbon1155Contract.methods.setApprovalForAll(DEX_CONTRACT_ADDRESS, true).encodeABI();
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
        const destination = DEX_CONTRACT_ADDRESS;
        const value = 0;
        const data = dexContract.methods.askOrder(nftContractAddress, tokenId, amount, price).encodeABI();
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

async function cancelOrder(orderIds) {
    const destination = DEX_CONTRACT_ADDRESS;
    const value = 0;
    const data = dexContract.methods.cancelOrder(orderIds).encodeABI();
    const gasPrice = await web3.eth.getGasPrice();
    let nonce = await web3.eth.getTransactionCount(account.address, 'pending');
    const aaWalletContract = new web3.eth.Contract(AAWalletABI, aaWalletAddress);
    const gasLimit = await aaWalletContract.methods.execute(destination, value, data).estimateGas({
        from: wallet.address, nonce: nonce
    });
    return await aaWalletContract.methods.execute(destination, value, data).send({
        from: wallet.address, gas: gasLimit, gasPrice: gasPrice, nonce: nonce++
    });
}

async function executeOrder(bidOrderIds, askOrderIds, orderAmounts) {
    const gasPrice = await web3.eth.getGasPrice();
    let nonce = await web3.eth.getTransactionCount(account.address, 'pending');
    const gasLimit = await dexContract.methods.executeOrder(bidOrderIds, askOrderIds, orderAmounts).estimateGas({
        from: wallet.address, nonce: nonce
    });
    return await dexContract.methods.executeOrder(bidOrderIds, askOrderIds, orderAmounts).send({
        from: wallet.address, gas: gasLimit, gasPrice: gasPrice, nonce: nonce++
    });
}


const nftContractAddress = CARBON_NFT_CONTRACT_ADDRESS; // Carbon NFT Contract
const aaWalletAddress = AA_WALLET_ADDRESS; // AA Wallet address


// ------------------- CREATE ORDER ----------------------

// 1. CHECK ALLOWANCE (TOKEN)
// 2. MAKE BID ORDER
async function testBidOrder() {
    const amount = 1; // NFT amount
    let price = 1;
    const result = await createBidOrder(aaWalletAddress, nftContractAddress, 1, amount, price)
    console.log("bidOrderResult", result);
}

// ------------------- ASK ORDER ----------------------

// 1. CHECK ALLOWANCE (NFT)
// 2. IF NOT ENOUGH ALLOWANCE, GIVE ALLOWANCE (NFT)
// 3. MAKE ASK ORDER
async function testAskOrder() {
    const tokenId = 1;
    const amount = 1; // NFT amount
    let price = 1; // NZC amount it should be wei while sending to blockchain
    // 1. CHECK ALLOWANCE (NFT)
    const isAllowanceExist = await checkAllowanceNFT(aaWalletAddress, nftContractAddress); // return boolean
    if (!isAllowanceExist) {
        // 2. GIVE ALLOWANCE (NFT)
        await giveAllowanceNFT(aaWalletAddress, nftContractAddress);
        // PLEASE MAKE SURE TRANSACTION SUCCESS AND COMPLETE
    }
    // CONVERT price to WEI
    price = Web3.utils.toWei(price.toString(), 'ether');

    // CHECK BALANCE
    const carbonNftBalance = await checkBalanceNft(aaWalletAddress, nftContractAddress, tokenId);

    const result = await createAskOrder(aaWalletAddress, nftContractAddress, tokenId, amount, price)
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
    const bidOrderId = 2;
    const askOrderId = 3;
    const orderAmount = 1; // NFT amount
    const result = await executeOrder(bidOrderId, askOrderId, orderAmount)
    console.log("executeOrderResult", result);
}
