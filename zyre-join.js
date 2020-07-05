module.exports = function(RED) {
  function ZyreJoin(config) {
    RED.nodes.createNode(this, config)
    this.topic = config.topic
    this.zyre = RED.nodes.getNode(config.zyre).zyre

    let peer = this.zyre._name
    let onJoin = (identity, name, group) => {
      this.debug(`${name} has joined ${group}`)

      let msg = {
        topic: 'join',
        payload: {
          identity,
          name,
          group
        }
      }
      this.send(msg)
    }

    let onInput = (msg, send, done) => {
      let topic = msg.topic || this.topic || msg.payload
      this.debug(`${peer} is joining ${topic}`)

      this.zyre.join(topic)
      if (done) {
        done()
      }
    }

    let onClose = (removed, done) => {
      this.debug(`Removing listener for ${peer}`)
      this.zyre.off('join', onJoin)
      if (done) {
        done()
      }
    }

    this.debug(`Registering listener for ${peer}`)
    this.zyre.on('join', onJoin)
    this.on('input', onInput)
    this.on('close', onClose)
  }

  RED.nodes.registerType('zyre-join', ZyreJoin)
}