module.exports = function(RED) {
  let Zyre = require('zyre.js')

  let names = (process.env.ZYRE_PEER_NAMES || '').split(',').map(s => s.trim()).filter(s => s !== '')
  let peers = {}

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

    let startZyrePeer = () => {
      this.zyre = new Zyre({
        name: names.length > 0 ? names[Math.floor(Math.random() * names.length)] : this.name,
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

      this.on('close', (removed, done) => {
        if (removed) {
         stopZyrePeer().then(() => done && done())
        } else if (done) {
          done()
        }
      })

      return this.zyre.start()
        .then(() => this.groups.forEach(group => this.zyre.join(group)))
        .then(() => this.log(`Started zyre peer: ${this.name}`))
        // Cache Zyre instance in global context
        .then(() => peers[this.name] = this.zyre)
    }

    let stopZyrePeer = () => {
      this.groups.forEach(group => this.zyre.leave(group))
      return this.zyre.stop(() => this.log(`Stopped zyre peer: ${this.name}`))
        .then(() => delete peers[this.name])
    }

    // Check for cached instance
    this.zyre = peers[this.name]
    if (!this.zyre) {
      // Initialize new zyre peer
      startZyrePeer()
    } else if (this.name !== this.zyre._name
        || this.port !== this.zyre._bport
        || this.evasive !== this.zyre._evasive
        || this.interval !== this.zyre._binterval
        || this.groups.length !== this.zyre._zyreNode._groups.length
        || this.groups.some(group => this.zyre._zyreNode._groups.indexOf(group) < 0)
        || Object.keys(this.headers).length !== Object.keys(this.zyre._headers || {}).length
        || Object.keys(this.headers).some(key => this.headers[key] !== this.zyre._headers[key])
        || this.encoding !== this.zyre._encoding) {
      // Destroy old zyre peer before initializing new
      stopZyrePeer().then(() => startZyrePeer())
    }
  }

  RED.nodes.registerType('zyre-peer', ZyrePeerNode)
}