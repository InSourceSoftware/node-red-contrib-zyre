module.exports = function(RED) {
  let Zyre = require('zyre.js')

  let names = (process.env.ZYRE_PEER_NAMES || '').split(',').map(s => s.trim()).filter(s => s !== '')

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

      return this.zyre.start(() => this.groups.forEach(group => this.zyre.join(group)))
        .then(() => this.log(`Started zyre peer: ${this.name}`))
        // Cache Zyre instance in global context
        .then(() => globalContext.set(this.name, this.zyre))
    }

    let stopZyrePeer = () => {
      return this.zyre.stop(() => this.groups.forEach(group => this.zyre.leave(group)))
        .then(() => this.log(`Stopped zyre peer: ${this.name}`))
    }

    // Check global context for cached instance
    let globalContext = this.context().global
    this.zyre = globalContext.get(this.name)
    if (this.zyre) {
      if (this.name === this.zyre._name
          && this.port === this.zyre._bport
          && this.evasive === this.zyre._evasive
          && this.interval === this.zyre._binterval
          && Object.keys(this.headers).length === Object.keys(this.zyre._headers || {}).length
          && Object.keys(this.headers).every(key => this.headers[key] === this.zyre._headers[key])
          && this.encoding === this.zyre._encoding) {
        // Reuse existing peer
        return
      }

      // Destroy old zyre peer before initializing new
      stopZyrePeer().then(() => startZyrePeer())
    } else {
      // Initialize new zyre peer
      startZyrePeer()
    }
  }

  RED.nodes.registerType('zyre-peer', ZyrePeerNode)
}