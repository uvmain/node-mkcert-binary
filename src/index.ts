import fs from 'node:fs'
import os from 'node:os'
import { pipeline } from 'node:stream/promises'
import { URL } from 'node:url'

type PlatformTarget = 'win32' | 'darwin' | 'linux'
type ArchTarget = 'x64' | 'arm64'

const platform = os.platform() as PlatformTarget
const arch = os.arch() as ArchTarget

async function getLatestReleaseUrl(): Promise<URL> {
  const urlPlatform = platform === 'win32' ? 'windows' : platform
  const urlArch = arch === 'x64' ? 'amd64' : 'arm64'
  return new URL(`https://dl.filippo.io/mkcert/latest?for=${urlPlatform}/${urlArch}`)
}

async function downloadFile(url: URL): Promise<void> {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': 'Node.js' },
    })

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`)
    }

    const writeStream = fs.createWriteStream('mkcert')
    await pipeline(response.body as any, writeStream)

    if (platform === 'win32') {
      fs.symlinkSync('./mkcert', './mkcert.exe')
    }
  }
  catch (err) {
    console.error('Error downloading or extracting file:', err)
  }
}

async function main(): Promise<void> {
  const downloadUrl = await getLatestReleaseUrl()
  await downloadFile(downloadUrl)
}

main().catch(console.error)
