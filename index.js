const Web3 = require("web3");
const {DexContractABI} = require("./abi/DexContractABI");
const {AAWalletABI} = require("./abi/AAWalletABI");
const {Carbon1155ABI} = require("./abi/Carbon1155ABI");
const {ERC20} = require("./abi/ERC20");
const {GESIA_RPC_URL, OWNER_2_PRIVATE_KEY, DEX_CONTRACT_ADDRESS, NZC_CONTRACT_ADDRESS, CARBON_NFT_CONTRACT_ADDRESS,
    AA_WALLET_ADDRESS
} = require("./consts");


let web3 = new Web3(new Web3.providers.HttpProvider(GESIA_RPC_URL)); // gesia RPC url
const dexContract = new web3.eth.Contract(DexContractABI, DEX_CONTRACT_ADDRESS);
let account = web3.eth.accounts.privateKeyToAccount(OWNER_2_PRIVATE_KEY);
let wallet = web3.eth.accounts.wallet.add(account);

async function createBidOrder(aaWalletAddress, nftContractAddress, tokenId, amount, price, tokenContractAddress) {
    try {
        const destination = DEX_CONTRACT_ADDRESS;
        const value = 0;
        const data = dexContract.methods.bidOrder(nftContractAddress, tokenId, amount, price, tokenContractAddress).encodeABI();
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

async function checkBalanceToken(aaWalletAddress, tokenContractAddress) {
    const nzcContract = new web3.eth.Contract(ERC20, tokenContractAddress);
    return await nzcContract.methods.balanceOf(aaWalletAddress).call();
}

async function checkBalanceNft(aaWalletAddress, nftContractAddress, tokenId) {
    const carbonNftContract = new web3.eth.Contract(Carbon1155ABI, nftContractAddress);
    return await carbonNftContract.methods.balanceOf(aaWalletAddress, tokenId).call();
}

async function checkAllowanceToken(aaWalletAddress, tokenContractAddress) {
    const nzcContract = new web3.eth.Contract(ERC20, tokenContractAddress);
    return await nzcContract.methods.allowance(aaWalletAddress, DEX_CONTRACT_ADDRESS).call();
}

async function checkAllowanceNFT(aaWalletAddress, tokenContractAddress) {
    const carbon1155Contract = new web3.eth.Contract(Carbon1155ABI, tokenContractAddress);
    const isAllowanceExist = await carbon1155Contract.methods.isApprovedForAll(aaWalletAddress, DEX_CONTRACT_ADDRESS).call();
    console.log("isAllowanceExist", isAllowanceExist);
    return isAllowanceExist;
}

async function giveAllowanceToken(aaWalletAddress, tokenContractAddress) {
    const tokenContract = new web3.eth.Contract(ERC20, tokenContractAddress);
    const data = tokenContract.methods.approve(DEX_CONTRACT_ADDRESS, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff").encodeABI();
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
        const data = dexContract.methods.askOrder(nftContractAddress, tokenId, amount, price, tokenContractAddress).encodeABI();
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
    const destination = DEX_CONTRACT_ADDRESS;
    const value = 0;
    const data = dexContract.methods.cancelOrder(orderId).encodeABI();
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

async function executeOrder(bidOrderId, askOrderId, orderAmount) {
    const gasPrice = await web3.eth.getGasPrice();
    let nonce = await web3.eth.getTransactionCount(account.address, 'pending');
    const gasLimit = await dexContract.methods.executeOrder(bidOrderId, askOrderId, orderAmount).estimateGas({
        from: wallet.address, nonce: nonce
    });
    return await dexContract.methods.executeOrder(bidOrderId, askOrderId, orderAmount).send({
        from: wallet.address, gas: gasLimit, gasPrice: gasPrice, nonce: nonce++
    });
}






const tokenContractAddress = NZC_CONTRACT_ADDRESS; // NZC Token Contract
const nftContractAddress = CARBON_NFT_CONTRACT_ADDRESS; // Carbon NFT Contract
const aaWalletAddress = AA_WALLET_ADDRESS; // AA Wallet address


// ------------------- CREATE ORDER ----------------------

// 1. CHECK ALLOWANCE (TOKEN)
// 2. IF NOT ENOUGH ALLOWANCE, GIVE ALLOWANCE (TOKEN)
// 3. MAKE BID ORDER
async function testBidOrder() {
    const amount = 1; // NFT amount
    let price = 1000; // NZC amount it should be wei while sending to blockchain
    // 1. CHECK ALLOWANCE (TOKEN)
    const allowanceTokenAmount = await checkAllowanceToken(aaWalletAddress, tokenContractAddress);
    // CONVERT price to WEI
    price = Web3.utils.toWei(price.toString(), 'ether');
    if (Number.parseFloat(allowanceTokenAmount) < price) {
        // 2. GIVE ALLOWANCE (TOKEN)
        await giveAllowanceToken(aaWalletAddress, tokenContractAddress);
        // PLEASE MAKE SURE TRANSACTION SUCCESS AND COMPLETE
    }
    // CHECK BALANCE AAWallet
    const nzcBalance = await checkBalanceToken(aaWalletAddress, tokenContractAddress);

    const result = await createBidOrder(aaWalletAddress, nftContractAddress, 1, amount, price, tokenContractAddress)
    console.log("bidOrderResult", result);
}


// ------------------- ASK ORDER ----------------------

// 1. CHECK ALLOWANCE (NFT)
// 2. IF NOT ENOUGH ALLOWANCE, GIVE ALLOWANCE (NFT)
// 3. MAKE ASK ORDER
async function testAskOrder() {
    const tokenId = 1;
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
    price = Web3.utils.toWei(price.toString(), 'ether');

    // CHECK BALANCE
    const carbonNftBalance = await checkBalanceNft(aaWalletAddress, nftContractAddress, tokenId);

    const result = await createAskOrder(aaWalletAddress, nftContractAddress, tokenId, amount, price, tokenContractAddress)
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
    const orderAmount = 100; // NFT amount
    const result = await executeOrder(bidOrderId, askOrderId, orderAmount)
    console.log("executeOrderResult", result);
}
