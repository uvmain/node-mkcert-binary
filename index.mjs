import fs from 'fs';
import got from 'got';
import ndh from 'node-downloader-helper';

let downloadDir = process.cwd().split('node-mkcert-binary')[0];
downloadDir = `${downloadDir}.bin`;

console.info(process.argv)

switch (process.argv[2]) {
  case "postinstall":
    //get the latest release version
    const latest = await got('https://api.github.com/repos/FiloSottile/mkcert/releases/latest').json();
    const version = latest.tag_name;

    // build mkcert download string
    let platform = process.platform;
    if (platform === 'win32')
      platform = 'windows'

    let arch = 'amd64';

    switch(process.arch) {
      case 'arm64': arch = 'arm64';
      case 'arm': arch = 'arm';
    }

    let fileString = `mkcert-${version}-${platform}-${arch}`;
    if (platform === 'windows')
      fileString = `${fileString}.exe`

    console.log(fileString)

    const downloadString = `https://github.com/FiloSottile/mkcert/releases/download/${version}/${fileString}`;

    console.log(downloadString)

    fs.mkdir(downloadDir, { recursive: true }, (err) => {
      if (err) throw err;
    });

    const saveString = (platform === 'win32') ? 'mkcert.exe' : 'mkcert'

    const dl = new ndh.DownloaderHelper(downloadString, downloadDir);
    dl.on('error', (err) => console.log('Mkcert Download Failed', err));
    dl.start().catch(err => console.error(err));
    break;

  case "preuninstall":
    await fs.unlinkSync(`${downloadDir}${process.platform === 'win32' ? '.exe' : ''}`);
    break;
}