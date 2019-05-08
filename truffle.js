module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '5777'
    },
    dev_docker: {
        host: '127.0.0.1',
        port: 8545,
        network_id: '45',
        from: '0xc7d45a6c84d0c40fe8c851a92f3dc88295fd9169'
    }
  }
}
