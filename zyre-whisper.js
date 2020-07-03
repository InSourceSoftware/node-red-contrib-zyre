module.exports = function(RED) {
  function ZyreWhisper(config) {
    RED.nodes.createNode(this, config)
    this.topic = config.topic
    this.zyre = RED.nodes.getNode(config.zyre).zyre

    let peer = this.zyre._name
    let onWhisper = (id, name, message) => {
      this.debug(`${name} to ${peer}: ${message}`)

      let msg = {
        topic: 'whisper',
        payload: {
          id,
          name,
          message,
          peer
        }
      }
      this.send(msg)
    }

    let onInput = (msg, send, done) => {
      let topic = msg.topic || this.topic
      this.debug(`${peer} is attempting to send message to ${topic}`)

      let peers = this.zyre.getPeers()
      let identity = peers[topic] ? topic : Object.keys(peers).find(key => peers[key].name === topic)
      if (identity === undefined) {
        // Handle missing peer (probably user error or peer not connected)
        let error = `Unable to find peer with name or identity of ${topic}`
        if (done) {
          done(error)
        } else {
          this.error(err)
        }
      } else {
        this.debug(`${peer} is sending message to ${peers[identity].name}`)
        this.zyre.whisper(identity, msg.payload)
        if (done) {
          done()
        }
      }
    }

    let onClose = (removed, done) => {
      this.debug(`Removing listener for ${peer}`)
      this.zyre.off('whisper', onWhisper)
      if (done) {
        done()
      }
    }

    this.debug(`Registering listener for ${peer}`)
    this.zyre.on('whisper', onWhisper)
    this.on('input', onInput)
    this.on('close', onClose)
  }

  RED.nodes.registerType('zyre-whisper', ZyreWhisper)
}