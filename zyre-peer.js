module.exports = function(RED) {
  let Zyre = require('zyre.js')

  let events = [
    'connect',
    'disconnect',
    'expired',
    'whisper',
    'shout',
    'join',
    'leave'
  ]

  function ZyrePeerNode(config) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.port = config.port
    this.evasive = config.evasive
    this.expired = config.expired
    this.interval = config.interval
    this.groups = (config.groups || '').split(',').map(g => g.trim())

    this.zyre = new Zyre({
      name: this.name,
      evasive: this.evasive,
      expired: this.expired,
      port: 49152,
      bport: this.port,
      binterval: this.interval,
    })

    let onClose = (removed, done) => {
      events.forEach(event => this.zyre.removeAllListeners(event))

      this.zyre.stop(() => {
        if (this.groups) {
          this.groups.forEach(group => this.zyre.leave(group))
        }
        this.log(`Stopped zyre peer: ${this.name}`)
      })
        .then(() => done && done())
    }

    this.zyre.start(() => {
      if (this.groups) {
        this.groups.forEach(group => this.zyre.join(group))
      }
      this.log(`Started zyre peer: ${this.name}`)
    })
      .then(() => this.on('close', onClose))
  }

  RED.nodes.registerType('zyre-peer', ZyrePeerNode)
}