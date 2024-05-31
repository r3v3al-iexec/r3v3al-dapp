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

async function start() {
    // Parse the developer secret environment variable
    let developerSecret;
    try {
        developerSecret = JSON.parse(process.env.IEXEC_APP_DEVELOPER_SECRET);
    } catch {
        throw Error('Failed to parse the developer secret');
    }
    let requesterSecret;
    try {
        requesterSecret = process.env.IEXEC_REQUESTER_SECRET_1
            ? JSON.parse(process.env.IEXEC_REQUESTER_SECRET_1)
            : {};
    } catch {
        throw Error('Failed to parse requester secret');
    }

    const unsafeEnvVars = {
        iexecOut: process.env.IEXEC_OUT,
        firstHalfPrivateKey: developerSecret.MC_PVK,
        secondHalfPrivateKey: developerSecret.PLAYER_PVK
    };
    const envVars = validateInputs(unsafeEnvVars)

    const inputArgs = process.argv.split(' ');
    console.log(inputArgs);

    const dataprotectorDeserializer = new IExecDataProtectorDeserializer();

    // Deserialize each value using the getValue function
    const minX = await dataprotectorDeserializer.getValue('minX', 'f64');
    const minY = await dataprotectorDeserializer.getValue('minY', 'f64');
    const maxX = await dataprotectorDeserializer.getValue('maxX', 'f64');
    const maxY = await dataprotectorDeserializer.getValue('maxY', 'f64');
    const rewardCount = await dataprotectorDeserializer.getValue('rewardCount', 'f64');
    const rewardAmount = await dataprotectorDeserializer.getValue('rewardAmount', 'f64');

    // Deserialize rewards array
    const rewards = [];
    const  dataprotectorRewards = dataprotectorDeserializer.getValue('rewards', 'Uint8Array');
    for (let i = 0; i < dataprotectorRewards.length; i++) {
        const pathPrefix = `rewards.${i}.`;
      
        const x = await dataprotectorDeserializer.getValue(`${pathPrefix}x`, 'f64');
        const y = await dataprotectorDeserializer.getValue(`${pathPrefix}y`, 'f64');
        const rewardValue = await dataprotectorDeserializer.getValue(`${pathPrefix}reward`, 'f64');
        const boosted = await dataprotectorDeserializer.getValue(`${pathPrefix}boosted`, 'bool');
      
        rewards.push({ x, y, reward: rewardValue, boosted });
      }

    // Convert private keys to BigIntegers
    const privateKey1BigInt = BigInt('0x' + developerSecret);
    const privateKey2BigInt = BigInt('0x' + requesterSecret);

    // Combine private keys (for example, using addition)
    const combinedPrivateKey = (privateKey1BigInt + privateKey2BigInt).toString(16);

    // Create an Ethereum wallet from the combined private key
    const rewardKeyWallet = new ethers.Wallet('0x' + combinedPrivateKey);

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
