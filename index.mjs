import fs, { createWriteStream } from 'fs';
import https from 'https';
import { URL } from 'url';
import path from 'path';

let downloadDir = process.cwd().split('node-mkcert-binary')[0];
downloadDir = `${downloadDir}.bin`;

switch (process.argv[2]) {
  case "postinstall":
    //get the latest release version
    const latestUrl = new URL('https://api.github.com/repos/FiloSottile/mkcert/releases/latest');
    latestUrl.headers = {'User-Agent': 'Node.js'};
    https.get(latestUrl, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', async () => {
        const latest = JSON.parse(data);
        const version = latest.tag_name;

        // build mkcert download string
        let platform = process.platform;
        let saveString = 'mkcert';

        const arch = (process.arch == 'x64') ? 'amd64' : process.arch

        let fileString = `mkcert-${version}-${platform}-${arch}`;

        if (platform === 'win32') {
          fileString = `mkcert-${version}-windows-${arch}.exe`;
          saveString = 'mkcert.exe';
        }

        const downloadUrl = new URL(`https://github.com/FiloSottile/mkcert/releases/download/${version}/${fileString}`);

        fs.mkdir(downloadDir, { recursive: true }, (err) => {
          if (err) throw err;
        });

        const fileStream = createWriteStream(path.join(downloadDir, saveString));

        https.get(downloadUrl, (res) => {
          res.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close();
          });
        }).on('error', (error) => {
          console.log(`Failed to download mkcert: ${error}`);
          fs.unlinkSync(path.join(downloadDir, saveString));
        });

      });
    }).on('error', (error) => {
      console.log(`Failed to get latest release: ${error}`);
    });

    break;

  case "preuninstall":
    await fs.unlinkSync(path.join(downloadDir, `${process.platform === 'win32' ? 'mkcert.exe' : 'mkcert'}`));
    break;
}
