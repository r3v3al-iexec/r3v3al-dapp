const { promises: fs } = require('fs');
const {
    IExecDataProtectorDeserializer,
} = require('@iexec/dataprotector-deserializer');

//TODO: Rename file to r3v3al.js

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

    const inputArgs = process.argv.split(' ');
    console.log(inputArgs);

    const deserializer = new IExecDataProtectorDeserializer();
    // Only support 2 treasures for now
    const xTreasure1 = await deserializer.getValue('x1', 'int');
    const yTreasure1 = await deserializer.getValue('y1', 'int');
    const xTreasure2 = await deserializer.getValue('x2', 'int');
    const yTreasure2 = await deserializer.getValue('y2', 'int');

    const creatorHalfRewardKeySeed = developerSecret;
    const playerHalfRewardKeySeed = requesterSecret;

    let privateKey = "0x" + creatorHalfRewardKeySeed + playerHalfRewardKeySeed;
    let rewardKeyWallet = new ethers.Wallet(privateKey);

    switch (inputArgs[0]) {
        case "countReward":
            let count = 0
            if (xTreasure1 > 0 & yTreasure1 > 0) {
                count++
            }
            if (xTreasure2 > 0 & yTreasure2 > 0) {
                count++
            }
            response = count;
            break;
        case "generateRewardKey":
            response = rewardKeyWallet.address
            break;
        case "claimReward":
            const x = inputArgs[1]
            const y = inputArgs[2]
            if (xTreasure1 == x & yTreasure1 == y || xTreasure2 == x & yTreasure2 == y) {
                // TODO: Load r3v3alContract and trigger reward method
                const tx = await rewardKeyWallet.sendTransaction({
                    to: "0xr3v3alContract"
                });
                response = "Treasure found! Payment already made with tx:%{tx}"
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
