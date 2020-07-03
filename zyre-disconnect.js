module.exports = function(RED) {
  function ZyreDisconnect(config) {
    RED.nodes.createNode(this, config)
    this.zyre = RED.nodes.getNode(config.zyre).zyre

    let peer = this.zyre._name
    let onDisconnect = (id, name) => {
      this.log(`${peer} has been disconnected from ${name}`)
      let msg = {
        topic: 'disconnect',
        payload: {
          id,
          name,
          peer
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