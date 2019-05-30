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
        from: '0x373e1aaE21Ed2A0F249380A151E01429De549b57'
    }
  }
}
