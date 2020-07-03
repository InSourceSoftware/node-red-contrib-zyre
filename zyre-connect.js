module.exports = function(RED) {
  function ZyreConnect(config) {
    RED.nodes.createNode(this, config)
    this.zyre = RED.nodes.getNode(config.zyre).zyre

    let peer = this.zyre._name
    let onConnect = (id, name, headers) => {
      this.log(`${peer} is now connected to ${name}`)
      this.status({
        fill: 'blue',
        shape: 'dot'
      })

      let msg = {
        topic: 'connect',
        payload: {
          id,
          name,
          headers,
          peer
        }
      }
      this.send(msg)
    }

    let onClose = (removed, done) => {
      this.debug(`Removing listener for ${peer}`)
      this.zyre.off('connect', onConnect)
      if (done) {
        done()
      }
    }

    this.debug(`Registering listener for ${peer}`)
    this.zyre.on('connect', onConnect)
    this.on('close', onClose)
  }

  RED.nodes.registerType('zyre-connect', ZyreConnect)
}