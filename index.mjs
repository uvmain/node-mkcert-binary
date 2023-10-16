import fs from 'fs';
import https from 'https';
import { URL } from 'url';

let saveString = 'mkcert';

async function getLatestReleaseTag() {
  const latestUrl = new URL('https://api.github.com/repos/FiloSottile/mkcert/releases/latest');
  latestUrl.headers = { 'User-Agent': 'Node.js' };

  return new Promise((resolve, reject) => {
    https.get(latestUrl, (res) => {
      if (res.statusCode === 302 && res.headers.location) {
        // If a redirect is encountered, resolve with the new URL
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
  console.log(latestUrl);
  return new URL(latestUrl);
}

async function downloadFile(downloadUrl) {
  downloadUrl.headers = { 'User-Agent': 'Node.js' };
  https.get(downloadUrl, (res) => {
    if (res.statusCode === 302 && res.headers.location) {
      // If a redirect is encountered, follow the new location
      downloadFile(new URL(res.headers.location));
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
}

const downloadUrl = await getLatestReleaseUrl();

await downloadFile(downloadUrl);
