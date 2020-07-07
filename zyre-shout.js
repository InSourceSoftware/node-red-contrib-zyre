module.exports = function(RED) {
  function ZyreShout(config) {
    RED.nodes.createNode(this, config)
    this.topic = config.topic
    this.output = config.output
    this.zyre = RED.nodes.getNode(config.zyre).zyre

    let peer = this.zyre._name
    this.status({
      fill: 'blue',
      shape: 'dot',
      text: peer
    })

    let onShout = (identity, name, message, group) => {
      if (this.topic && this.topic !== group) {
        return
      }

      if (this.output === 'string') {
        try {
          message = message.toString()
        } catch (e) {}
      } else if (this.output === 'json') {
        try {
          message = JSON.parse(message)
        } catch (e) {}
      }

      let msg = {
        topic: group,
        identity,
        name,
        payload: message
      }
      this.debug(`${name} to ${peer}: ${message}`)
      this.send(msg)
    }

    let onInput = (msg, send, done) => {
      let topic = this.topic || msg.topic
      let payload = msg.payload
      if (typeof payload === 'object') {
        payload = JSON.stringify(payload)
      }

      this.zyre.shout(topic, payload)
      this.debug(`${peer} sent message to ${topic}`)
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