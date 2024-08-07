const Web3 = require("web3");
const {DexContractABI} = require("./abi/DexContractABI");
const {DEX_CONTRACT_ADDRESS, GESIA_RPC_URL} = require("./consts");


async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}


async function startEthereumBridgeIndexingNew() {
    const web3 = new Web3(new Web3.providers.HttpProvider(GESIA_RPC_URL));
    const contract = new web3.eth.Contract(DexContractABI, DEX_CONTRACT_ADDRESS);

    while (true) {
        try {
            let lastBlockNumber = 985230;
            const blockExtender = 100000;
            const getLatestBlockNumber = await web3.eth.getBlockNumber();
            let toBlockNumber = lastBlockNumber + blockExtender;
            if (toBlockNumber > getLatestBlockNumber) {
                toBlockNumber = getLatestBlockNumber;
            }
            const options = {
                fromBlock: lastBlockNumber, toBlock: toBlockNumber,
            };
            const allEvents = await contract.getPastEvents("allEvents", options);
            if (allEvents.length > 0) {
                await saveTransactions(allEvents, web3);
            }

            lastBlockNumber = toBlockNumber;
            await sleep(10000);
        } catch (e) {
            console.error(e);
            await sleep(10000);
        }
    }
}

async function saveTransactions(results, web3) {
    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const blockNumber = result.blockNumber;
        const txHash = result.transactionHash;
        let timestamp = null;
        try {
            const blockData = await web3.eth.getBlock(blockNumber);
            timestamp = blockData.timestamp;
        } catch (e) {
            console.log(e);
        }
        switch (result.event) {
            case 'BidEvent' :
                const bidUser = result.returnValues['user'];
                const bidNftContractAddress = result.returnValues['token_contract_address'];
                const bidTokenContractAddress = result.returnValues['market_contract_address'];
                const bidNftTokenId = result.returnValues['token_id'];
                const bidAmount = result.returnValues['amount'];
                const bidPrice = result.returnValues['price']; // in wei
                const bidOrderId = result.returnValues['orderId'];
                console.log("bidResults", result.returnValues)
                break;
            case 'AskEvent':
                const askUser = result.returnValues['user'];
                const askNftContractAddress = result.returnValues['token_contract_address'];
                const askTokenContractAddress = result.returnValues['market_contract_address'];
                const askNftTokenId = result.returnValues['token_id'];
                const askAmount = result.returnValues['amount'];
                const askPrice = result.returnValues['price']; // in wei
                const askOrderId = result.returnValues['orderId'];
                console.log("askResults", result.returnValues)
                break;
            case 'CancelEvent':
                const cancelUser = result.returnValues['user'];
                const cancelNftContractAddress = result.returnValues['token_contract_address'];
                const cancelTokenContractAddress = result.returnValues['market_contract_address'];
                const cancelNftTokenId = result.returnValues['token_id'];
                const cancelAmount = result.returnValues['amount'];
                const cancelPrice = result.returnValues['price']; // in wei
                const cancelOrderId = result.returnValues['orderId'];
                console.log("cancelResults", result.returnValues)
                break;
            case 'TradeExecuteEvent':
                const tradeAskUser = result.returnValues['seller'];
                const tradeBidUser = result.returnValues['buyer'];
                const tradeNftContractAddress = result.returnValues['token_contract_address'];
                const tradeTokenContractAddress = result.returnValues['market_contract_address'];
                const tradeTokenId = result.returnValues['token_id'];
                const tradeAmount = result.returnValues['executedAmount'];
                const tradePrice = result.returnValues['executedPrice'];
                const tradeAskOrderId = result.returnValues['askOrderId'];
                const tradeBidOrderId = result.returnValues['bidOrderId'];
                console.log("tradeResults", result.returnValues)
                break;
        }

    }
}


startEthereumBridgeIndexingNew();
