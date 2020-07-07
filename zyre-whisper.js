module.exports = function(RED) {
  function ZyreWhisper(config) {
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

    let onWhisper = (identity, name, message) => {
      if (this.topic && this.topic !== name) {
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
        topic: identity,
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

      this.debug(`${peer} is attempting to send message to ${topic}`)

      let peers = this.zyre.getPeers()
      let identity = peers[topic] ? topic : Object.keys(peers).find(key => peers[key].name === topic)
      if (identity === undefined) {
        // Handle missing peer (probably user error or peer not connected)
        let error = `Unable to find peer with name or identity of ${topic}`
        if (done) {
          done(error)
        } else {
          this.error(error)
        }
      } else {
        this.debug(`${peer} is sending message to ${peers[identity].name}`)
        this.zyre.whisper(identity, payload)
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