#!/usr/bin/env node

const { spawn } = require('child_process');

const args = process.argv.slice(2);
const binaryName = (process.platform === 'win32') ? 'mkcert.exe' : 'mkcert';

const child = spawn(binaryName, args, { cwd: __dirname });