import fs from 'fs';
import https from 'https';
import { URL } from 'url';

let saveString = 'mkcert';
const options = { headers: { 'User-Agent': 'Node.js' } };

async function getLatestReleaseTag() {
  const latestUrl = new URL('https://api.github.com/repos/FiloSottile/mkcert/releases/latest');

  return new Promise((resolve, reject) => {
    const request = https.get(latestUrl, options, (res) => {
      if (res.statusCode === 302 && res.headers.location) {
        resolve(new URL(res.headers.location));
      } else {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          const parsedData = JSON.parse(rawData);
          resolve(parsedData.tag_name);
        });
      }
    });

    request.on('error', (error) => {
      reject(error);
    });
  });
}

async function getLatestReleaseUrl() {
  const version = await getLatestReleaseTag();
  const platform = process.platform;
  const arch = process.arch === 'x64' ? 'amd64' : process.arch;
  let fileString = `mkcert-${version}-${platform}-${arch}`;

  if (platform === 'win32') {
    fileString = `mkcert-${version}-windows-${arch}.exe`;
    saveString = 'mkcert.exe';
  }

  const latestUrl = `https://github.com/FiloSottile/mkcert/releases/download/${version}/${fileString}`;
  return new URL(latestUrl);
}

async function downloadFile(downloadUrl, saveString) {
  const request = https.get(downloadUrl, options, (res) => {
    if (res.statusCode === 302 && res.headers.location) {
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

await downloadFile(downloadUrl, saveString);
