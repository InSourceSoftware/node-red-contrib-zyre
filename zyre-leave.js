module.exports = function(RED) {
  function ZyreLeave(config) {
    RED.nodes.createNode(this, config)
    this.topic = config.topic
    this.zyre = RED.nodes.getNode(config.zyre).zyre

    let peer = this.zyre._name
    let onLeave = (id, name, group) => {
      this.debug(`${name} has left ${group}`)

      let msg = {
        topic: 'leave',
        payload: {
          id,
          name,
          group,
          peer
        }
      }
      this.send(msg)
    }

    let onInput = (msg, send, done) => {
      let topic = msg.topic || this.topic || msg.payload
      this.debug(`${peer} is leaving ${topic}`)

      this.zyre.leave(topic)
      if (done) {
        done()
      }
    }

    let onClose = (removed, done) => {
      this.debug(`Removing listener for ${peer}`)
      this.zyre.off('leave', onLeave)
      if (done) {
        done()
      }
    }

    this.debug(`Registering listener for ${peer}`)
    this.zyre.on('leave', onLeave)
    this.on('input', onInput)
    this.on('close', onClose)
  }

  RED.nodes.registerType('zyre-leave', ZyreLeave)
}