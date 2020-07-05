module.exports = function(RED) {
  function ZyreExpired(config) {
    RED.nodes.createNode(this, config)
    this.zyre = RED.nodes.getNode(config.zyre).zyre

    let peer = this.zyre._name
    let onExpired = (identity, name) => {
      this.log(`${peer} has been expired from ${name}`)
      let msg = {
        topic: 'expired',
        payload: {
          identity,
          name
        }
      }
      this.send(msg)
    }

    let onClose = (removed, done) => {
      this.debug(`Removing listener for ${peer}`)
      this.zyre.off('expired', onExpired)
      if (done) {
        done()
      }
    }

    this.debug(`Registering listener for ${peer}`)
    this.zyre.on('expired', onExpired)
    this.on('close', onClose)
  }

  RED.nodes.registerType('zyre-expired', ZyreExpired)
}