import fs, { createWriteStream } from 'fs';
import got, { create } from 'got';

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
    let saveString = 'mkcert';

    const arch = (process.arch == 'x64') ? 'amd64' : process.arch

    let fileString = `mkcert-${version}-${platform}-${arch}`;

    if (platform === 'win32') {
      fileString = `mkcert-${version}-windows-${arch}.exe`;
      saveString = 'mkcert.exe';
    }

    console.log(fileString);

    const downloadString = `https://github.com/FiloSottile/mkcert/releases/download/${version}/${fileString}`;

    console.log(downloadString);

    fs.mkdir(downloadDir, { recursive: true }, (err) => {
      if (err) throw err;
    });

    const downloadStream = got.stream(downloadString)
    const fileStream = createWriteStream(`${downloadDir}/${saveString}`)

    downloadStream
      .on('error', (error) => {
        console.log(`Failed to download mkcert: ${error}`)
      })
    fileStream
    .on('error', (error) => {
      console.log(`Failed to download mkcert: ${error}`)
    })

    downloadStream.pipe(fileStream)

    break;

  case "preuninstall":
    await fs.unlinkSync(`${downloadDir}${process.platform === 'win32' ? '.exe' : ''}`);
    break;
}