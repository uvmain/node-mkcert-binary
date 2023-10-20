#!/usr/bin/env node

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)
const binaryName = (process.platform === 'win32') ? 'mkcert.exe' : './mkcert'

const child = spawn(binaryName, args, { cwd: __dirname })

child.on('exit', (code, signal) => {
  if (code === 0) {
    copyCerts()
  } else {
    console.error(`Child process exited with code ${code}`)
  }
})

function copyCerts() {
  fs.readdir(__dirname, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err)
        return
    }
    const packageFiles = [ 'mkcert', 'mkcert.js', 'mkcert.exe' ]
    const certFiles = files.filter(file => !packageFiles.includes(file))
    const parentDir = path.join(__dirname, '..', '..').split('/').pop()
    if (parentDir === 'node_modules') {
      for (const certFile of certFiles) {
        const sourcePath = path.join(__dirname, certFile)
        const destinationPath = path.join(path.join(__dirname, '..', '..', '..'), certFile)
        fs.copyFile(sourcePath, destinationPath, (err) => {
          if (err)
            console.log('File was not copied to destination');
        });
      }
    }
  })
}