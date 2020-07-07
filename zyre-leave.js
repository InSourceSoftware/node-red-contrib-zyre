module.exports = function(RED) {
  function ZyreLeave(config) {
    RED.nodes.createNode(this, config)
    this.topic = config.topic
    this.zyre = RED.nodes.getNode(config.zyre).zyre

    let peer = this.zyre._name
    this.status({
      fill: 'blue',
      shape: 'dot',
      text: peer
    })

    let onLeave = (identity, name, group) => {
      this.debug(`${name} has left ${group}`)

      let msg = {
        topic: group,
        payload: {
          identity,
          name,
          group
        }
      }
      this.send(msg)
    }

    let onInput = (msg, send, done) => {
      let topic = this.topic || msg.topic || msg.payload
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