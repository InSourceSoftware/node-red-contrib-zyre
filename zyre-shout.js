module.exports = function(RED) {
  function ZyreShout(config) {
    RED.nodes.createNode(this, config)
    this.topic = config.topic
    this.zyre = RED.nodes.getNode(config.zyre).zyre

    let peer = this.zyre._name
    let onShout = (id, name, message, group) => {
      this.debug(`${name} to ${peer}: ${message}`)

      let msg = {
        topic: 'shout',
        payload: {
          id,
          name,
          message,
          group,
          peer
        }
      }
      this.send(msg)
    }

    let onInput = (msg, send, done) => {
      let topic = msg.topic || this.topic
      this.debug(`${peer} sent message to ${topic}`)
      this.zyre.shout(topic, msg.payload)
      if (done) {
        done()
      }
    }

    let onClose = (removed, done) => {
      this.debug(`Removing listener for ${peer}`)
      this.zyre.off('shout', onShout)
      if (done) {
        done()
      }
    }

    this.debug(`Registering listener for ${peer}`)
    this.zyre.on('shout', onShout)
    this.on('input', onInput)
    this.on('close', onClose)
  }

  RED.nodes.registerType('zyre-shout', ZyreShout)
}