const { promises: fs } = require('fs');
const {
    IExecDataProtectorDeserializer,
} = require('@iexec/dataprotector-deserializer');
const { ethers } = require('ethers');
const validateInputs = require('./validateInputs');


async function writeTaskOutput(path, message) {
    try {
        await fs.writeFile(path, message);
        console.log(`File successfully written at path: ${path}`);
    } catch {
        console.error(`Failed to write Task Output`);
        process.exit(1);
    }
}

function parseRewardsString(rewardsString) {
    // Replace single quotes with double quotes
    const jsonString = rewardsString.replace(/'/g, '"');
    // Parse the JSON string
    const rewardsArray = JSON.parse(jsonString);
  
    return rewardsArray;
  }

async function start() {
    // Parse the developer secret environment variable
    let developerSecret;
    // MOCKED 
    try {
        developerSecret = JSON.parse(process.env.IEXEC_APP_DEVELOPER_SECRET);
    } catch {
        throw Error('Failed to parse the developer secret');
    }
    let requesterSecret;
    // MOCKED 
    try {
        requesterSecret = process.env.IEXEC_REQUESTER_SECRET_1
            ? JSON.parse(process.env.IEXEC_REQUESTER_SECRET_1)
            : {};
    } catch {
        throw Error('Failed to parse requester secret');
    }
    // //  MOCKING PART
    // // FOR TESTING PURPOSE
    // developerSecret = JSON.parse('{"MC_PVK":"0xbf92d248bb64f851a0afacb6b7c2fdf271e3e5e32788d12294110ff1ff6c2277"}' )
    // requesterSecret = JSON.parse('{"MC_PVK":"0x9751ba995669f09f31278bcb3e9eff9e4235935e16d217e3924d0c4910a76e83"}' )

    const unsafeEnvVars = {
        iexecOut: process.env.IEXEC_OUT,
        firstHalfPrivateKey: developerSecret.MC_PVK,
        secondHalfPrivateKey: requesterSecret.PLAYER_PVK
    };
    const envVars = validateInputs(unsafeEnvVars)

    const inputArgs = process.argv.slice(2);


    // USED IN CASE OF SCONIFICATION
    const dataprotectorDeserializer = new IExecDataProtectorDeserializer();

    // Deserialize each value using the getValue function
    const rewardCount = await dataprotectorDeserializer.getValue('rewardCount', 'f64');

    // Deserialize rewards array
    // const rewards = [];
    const  dataprotectorRewards = await dataprotectorDeserializer.getValue('rewards', 'string');
    const rewards = parseRewardsString(dataprotectorRewards);
    // // FOR TESTING PURPOSE
    // let jsonData;
    // try {
    //     const data = await fs.readFile('./protectedDataTest.json', 'utf8');
    //     jsonData = JSON.parse(data);
    // } catch (err) {
    //     console.error('Error reading or parsing the JSON file', err);
    //     process.exit(1);
    // }
    // // Use the JSON data
    // const { rewardCount, rewards } = jsonData;

    // Convert private keys to BigIntegers
    const privateKey1BigInt = BigInt(envVars.firstHalfPrivateKey);
    const privateKey2BigInt = BigInt(envVars.secondHalfPrivateKey);

    // Combine private keys (for example, using addition)
    let combinedPrivateKey = (privateKey1BigInt + privateKey2BigInt).toString(16);

    // Ensure the combined private key has an even length
    if (combinedPrivateKey.length % 2 !== 0) {
        combinedPrivateKey = '0' + combinedPrivateKey;
    }

    // / Calculate the Keccak-256 hash of the combined private key
    const hash = ethers.utils.keccak256('0x' + combinedPrivateKey);
    const rewardKeyWallet = new ethers.Wallet(hash);

    console.log(rewardKeyWallet);   
    var response;

    switch (inputArgs[0]) {
        case "countReward":
            response = rewardCount;
            break;
        case "generateRewardKey":
            response = rewardKeyWallet.address
            break;
        case "claimReward":
            const provider = new ethers.providers.JsonRpcProvider('https://bellecour.iex.ec'); // Replace with your Infura project ID
            const wallet = new ethers.Wallet(rewardKeyWallet.privateKey, provider); // Replace with your private key
            const contractAddress = "0x3092c6B927d19B98967913756153Ea86B65774dC"; // Replace with your contract address
            const abi = [
'{ "inputs": [ { "internalType": "bytes32", "name": "datasetId", "type": "bytes32" }, { "internalType": "address", "name": "player", "type": "address" }, { "components": [ { "internalType": "uint32", "name": "x", "type": "uint32" }, { "internalType": "uint32", "name": "y", "type": "uint32" } ], "internalType": "struct R3v3alfunds.Point", "name": "winningCoordinates", "type": "tuple" }, { "internalType": "uint256", "name": "rewardedAmount", "type": "uint256" } ], "name": "distributeReward", "outputs": [], "stateMutability": "nonpayable", "type": "function" }'
              ];
            const contract = new ethers.Contract(contractAddress, abi, wallet);
            const player = inputArgs[1];
            const x = inputArgs[2]
            const y = inputArgs[3]
            const datasetId = inputArgs[4]

            let found = false;
            for (const treasure of rewards) {
                if (treasure.x === x && treasure.y === y) {
                    const tx = await contract.distributeReward(datasetId, player, winningCoordinates, rewardedAmount);
                    // Wait for the transaction to be mined
                    const receipt = await tx.wait();
                    // Output transaction hash
                    response = `Treasure found at (${x},${y})! Payment already made with tx: ${receipt.transactionHash}`;
                    found = true;
                    break;
                }
            }
            break;
        default:
            response = "NO ACTION UPDATE"
            break
    }

    await writeTaskOutput(
        `${envVars.iexecOut}/result.txt`,
        JSON.stringify(response, null, 2)
    );
    await writeTaskOutput(
        `${envVars.iexecOut}/computed.json`,
        JSON.stringify({
            'deterministic-output-path': `${envVars.iexecOut}/result.txt`,
        })
    );
}

module.exports = start;
