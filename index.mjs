import fs from 'fs';
import https from 'https';
import { URL } from 'url';

const options = { headers: { 'User-Agent': 'Node.js' } };
const platform = (process.platform === 'win32') ? 'windows' : process.platform;
const saveString = (process.platform === 'win32') ? 'mkcert.exe' : 'mkcert';
const arch = process.arch === 'x64' ? 'amd64' : process.arch;
const latestUrl = new URL(`https://dl.filippo.io/mkcert/latest?for=${platform}/${arch}`);

function cloneForWindows() {
  if (process.platform === "win32") {
    fs.copyFile('./mkcert.exe', './mkcert', function () {})
  }
}

async function downloadFile(downloadUrl) {
  const request = https.get(downloadUrl, options, (res) => {
    if ([301, 302].includes(res.statusCode) && res.headers.location) {
      downloadFile(new URL(res.headers.location));
    } else if (res.statusCode === 200) {
      const writeStream = fs.createWriteStream(saveString);

      res.pipe(writeStream);

      writeStream.on('finish', () => {
        writeStream.close();
        cloneForWindows();
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

await downloadFile(latestUrl);
