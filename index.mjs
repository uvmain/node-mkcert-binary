import fs from 'fs';
import https from 'https';
import { URL } from 'url';

const platform = (process.platform === 'win32') ? 'windows' : 'linux';
const saveString = (process.platform === 'win32') ? 'mkcert.exe' : 'mkcert';
const arch = process.arch === 'x64' ? 'amd64' : process.arch;
const options = { headers: { 'User-Agent': 'Node.js' } };

async function getLatestReleaseUrl() {
  const latestUrl = `https://dl.filippo.io/mkcert/latest?for=${platform}/${arch}`
  return new URL(latestUrl);
}

async function downloadFile(downloadUrl, saveString) {
  const request = https.get(downloadUrl, options, (res) => {
    if ([301, 302].includes(res.statusCode) && res.headers.location) {
      downloadFile(new URL(res.headers.location), saveString);
    } else if (res.statusCode === 200) {
      const writeStream = fs.createWriteStream(saveString);

      res.pipe(writeStream);

      writeStream.on('finish', () => {
        writeStream.close();
        console.log('Download Completed');
      });
    } else {
      console.error(`Failed to download. HTTP status code: ${res.statusCode}`);
    }
  });

  request.on('error', (error) => {
    console.error('Error:', error);
  });
}

const downloadUrl = await getLatestReleaseUrl();

await downloadFile(downloadUrl, `bin/${saveString}`);
