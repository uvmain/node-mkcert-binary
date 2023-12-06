# node-mkcert-binary
Downloads the mkcert binary for use in npm/npx scripts

- Downloads the latest version of mkcert
- No dependencies

# Example npm script usage
```
"scripts": {
    "generate-cert": "mkcert *.local.dev",
    "install-cert": "mkcert --install",
  },
```