module.exports = function(RED) {
  function ZyreConnect(config) {
    RED.nodes.createNode(this, config)
    this.zyre = RED.nodes.getNode(config.zyre).zyre

    let peer = this.zyre._name
    this.status({
      fill: 'blue',
      shape: 'dot',
      text: peer
    })

    let onConnect = (identity, name, headers) => {
      this.log(`${peer} is now connected to ${name}`)

      let msg = {
        topic: 'connect',
        payload: {
          identity,
          name,
          headers
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