module.exports = function(RED) {
  function ZyreDisconnect(config) {
    RED.nodes.createNode(this, config)
    this.zyre = RED.nodes.getNode(config.zyre).zyre

    let peer = this.zyre._name
    this.status({
      fill: 'blue',
      shape: 'dot',
      text: peer
    })

    let onDisconnect = (identity, name) => {
      this.log(`${peer} has been disconnected from ${name}`)
      let msg = {
        topic: identity,
        payload: {
          identity,
          name
        }
      }
      this.send(msg)
    }

    let onClose = (removed, done) => {
      this.debug(`Removing listener for ${peer}`)
      this.zyre.off('disconnect', onDisconnect)
      if (done) {
        done()
      }
    }

    this.debug(`Registering listener for ${peer}`)
    this.zyre.on('disconnect', onDisconnect)
    this.on('close', onClose)
  }

  RED.nodes.registerType('zyre-disconnect', ZyreDisconnect)
}