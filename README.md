# Pinsel

Pinsel is a fully decentralized art licensing and backing platform which aims to provide lower comission costs and reduce infrastructure expenses by utilizing p2p protocols such as [IPFS](https://ipfs.io/) and [Ethereum](https://www.ethereum.org/) Blockchain.

## How it Works

Image owner uploads image with details containing artwork's name, description and artwork's author name along with the image file. The artwork owner can also specify if the licensing fee is optional to the buyer which results in a lower commission rate. The uploader also able to specifiy the license if he wants. The uploaded artwork file is stored in an `IPFS` node and the details of the artwork along with the hash of IPFS file in the smart contract `ArtworkController`.  

The buyer browses the gallery through the frontend website and makes a transaction to license digital art. The bought assets are then can be found in the `My Items` page which is handled by `AccountController` contract.

TODO: Architecture Diagram

## Dependecies

* [NodeJS](https://nodejs.org/en/) - tested : 10.15
* [Windows Build Tools (node-gyp)](https://github.com/nodejs/node-gyp)
* [Docker](https://www.docker.com/) or [Ganache](https://truffleframework.com/ganache) for local private blockchain. Not necessary for deploying to main network.
* Metamask enabled browser such as Chrome with [Metamask](https://metamask.io/) Extension or [Brave](https://brave.com/) browser.

# Installation

* ## IPFS Node

Pull the latest docker image:

```
docker pull ipfs/go-ipfs
```

Start an `IPFS` Container:
```
docker run -d -p 4001:4001/tcp -p 5001:5001/tcp -p 8080:8080/tcp -p 8081:8081/tcp ipfs/go-ipfs:latest
```

Attach to the container and allow `Cross-Origin-Requests`:
```
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["GET", "POST"]'
```


* ## Ethereum Node

If using a private local blockchain, ethereum clients such as [Geth](https://geth.ethereum.org/) or [Parity](https://www.parity.io/) can be used in a Docker container. [Ganache](https://truffleframework.com/ganache) is also can be used to deploy contracts for testing without using docker.

If you want to deploy to one of the main Ethereum networks, you would currently need to edit the [truffle.js](/truffle.js) file.

Pull the latest docker image:

```
docker pull parity/parity:beta
```

Start an Ethereum Node using `Parity` Container:
```
docker run -d -p 4001:4001/tcp -p 5001:5001/tcp -p 8080:8080/tcp -p 8081:8081/tcp ipfs/go-ipfs:latest
```

TODO: Configuration

* ## Smart Contracts

  Install truffle framework:
  ```
  npm -g install truffle
  ```
  or with `yarn`:
  ```
  yarn global add truffle
  ```

  Compile and Migrate Smart Contracts to the network:
  ```
  truffle compile
  truffle migrate --reset
  ```

* ## Web Server

  Install gulp package :
  ```
  npm -g install gulp-cli
  ```
  or with `yarn`:
  ```
  yarn global add gulp-cli
  ```

  Installing project dependecies  
  with `npm`:
  ```
  npm install
  ```
  or with `yarn`:
  ```
  yarn install
  ```

  Build project with `gulp`:
  ```
  gulp build
  ```

  Start server:
  ```
  gulp serve
  ```
    Access to application from `localhost:3000` or `localhost:3001` if started with browsersync with `gulp sync` command

  ### Other gulp commands
  * ```gulp clean``` Cleans dist folder.
  * ```gulp watch``` Watches file changes without running server.
  * ```gulp sync``` Rebuild and start browsersync proxy with server.
  * ```gulp serveWatch``` Start server and watch file changes.