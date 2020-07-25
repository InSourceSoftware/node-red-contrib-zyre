module.exports = function(RED) {
  let Zyre = require('zyre.js')

  function ZyrePeerNode(config) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.port = Number.parseInt(config.port)
    this.evasive = Number.parseInt(config.evasive)
    this.expired = Number.parseInt(config.expired)
    this.interval = Number.parseInt(config.interval)
    this.groups = (config.groups || '').split(',').map(s => s.trim()).filter(s => s !== '')
    this.headers = JSON.parse(config.headers || '{}')
    this.encoding = config.encoding || 'utf8'
    this.names = (process.env.ZYRE_PEER_NAMES || '').split(',').map(s => s.trim()).filter(s => s !== '')

    this.zyre = new Zyre({
      name: this.names.length > 0 ? this.names[Math.floor(Math.random() * this.names.length)] : this.name,
      headers: this.headers,
      evasive: this.evasive,
      expired: this.expired,
      port: 49152,
      bport: this.port,
      binterval: this.interval,
    })
    if (this.encoding) {
      this.zyre.setEncoding(this.encoding)
    }

    let onClose = (removed, done) => {
      this.groups.forEach(group => this.zyre.leave(group))

      this.zyre.stop(() => this.log(`Stopped zyre peer: ${this.name}`))
        .then(() => done && done())
    }

    this.on('close', onClose)
    this.zyre.start(() => this.log(`Started zyre peer: ${this.name}`))
      .then(() => this.groups.forEach(group => this.zyre.join(group)))
  }

  RED.nodes.registerType('zyre-peer', ZyrePeerNode)
}