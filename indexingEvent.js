const Web3 = require("web3");
const {DexContractABI} = require("./abi/DexContractABI");
const {AAWalletABI} = require("./abi/AAWalletABI");

const GESIA_RPC_URL = "http://43.200.218.66:8445";
const dexContractAddress = "0x0B77C44BEB285CD2a07e37bbe95235e6e3BbfAF1";

async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}


async function startEthereumBridgeIndexingNew() {
    const web3 = new Web3(new Web3.providers.HttpProvider(GESIA_RPC_URL));
    const contract = new web3.eth.Contract(DexContractABI, dexContractAddress);

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
                console.log("bidResults", result.returnValues)
                break;
            case 'AskEvent':
                console.log("askResults", result.returnValues)
                break;
            case 'CancelEvent':
                console.log("cancelResults", result.returnValues)
                break;
            case 'TradeExecuteEvent':
                console.log("tradeResults", result.returnValues)
                break;
        }

    }
}


startEthereumBridgeIndexingNew();
