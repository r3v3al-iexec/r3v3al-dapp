import { Wallet } from 'ethers';
import { IExecDataProtector, getWeb3Provider } from '@iexec/dataprotector';
import fs from 'fs/promises';
import path from 'path';

async function createProtectedData() {
  const ethProvider = getWeb3Provider(Wallet.createRandom().privateKey);

  const dataProtector = new IExecDataProtector(ethProvider);

  console.log('-> Starting protectData()');
  console.log('');

  // Read JSON data from file
  let jsonData;
  try {
    const data = await fs.readFile('./protectedDataTest.json', 'utf8');
    jsonData = JSON.parse(data);
  } catch (err) {
    console.error('Error reading or parsing the JSON file', err);
    process.exit(1);
  }
  console.log(jsonData);

  // Protect the JSON data
  const createdProtectedData = await dataProtector.core.protectData({
    name: 'Protected JSON Data',
    data: jsonData,
    onStatusUpdate: ({ title, isDone }) => {
      console.log(title, { isDone });
    },
  });
  // console.log(createdProtectedData.zipFile);
  // Save the zip file to the filesystem
  const zipFilePath = path.resolve('./protectedData.zip');
  try {
    await fs.writeFile(zipFilePath, createdProtectedData.zipFile);
    console.log(`Zip file successfully saved to: ${zipFilePath}`);
  } catch (err) {
    console.error('Error writing the zip file', err);
    process.exit(1);
  }
}

createProtectedData();
