# node-mkcert-binary
Downloads the mkcert binary for use in npm/npx scripts

- Downloads the latest version of mkcert
- No dependency on the unmaintained "download" or "request" packages

# Example npm script usage
```
"scripts": {
    "generate-cert": "mkcert *.local.dev",
    "install-cert": "mkcert --install",
  },
```