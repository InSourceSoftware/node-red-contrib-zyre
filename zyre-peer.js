module.exports = function(RED) {
  let Zyre = require('zyre.js')
  
  let names = (process.env.ZYRE_PEER_NAMES || '3-D,Sam Baines,Emmett "Doc" Brown,Jules Brown,Verne Brown,Clara Clayton,Copernicus,Einstein,Griff,Dave McFly,George McFly,Marty McFly,Linda McFly,Lorraine Baines-McFly,Maggie McFly,Marlene McFly,Marty McFly Jr.,Seamus McFly,William "Willie" McFly,Lou,Match,Douglas J. Needles,Jennifer Parker,Skinhead,Edna Strickland,Gerald Strickland,James Strickland,Biff Tannen,Biff Tannen Jr.,Buford "Mad Dog" Tannen,Irving "Kid" Tannen,Goldie Wilson,Goldie Wilson III').split(',').map(s => s.trim()).filter(s => s !== '')
  let events = [
    'connect',
    'disconnect',
    'expired',
    'whisper',
    'shout',
    'join',
    'leave'
  ]

  function ZyrePeerNode(config) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.port = config.port
    this.evasive = config.evasive
    this.expired = config.expired
    this.interval = config.interval
    this.groups = (config.groups || '').split(',').map(s => s.trim()).filter(s => s !== '')
    this.headers = JSON.parse(config.headers || {})
    this.encoding = config.encoding

    this.zyre = new Zyre({
      name: names.length > 0 ? names[Math.floor(Math.random() * names.length)] : this.name,
      headers: this.headers,
      evasive: this.evasive,
      expired: this.expired,
      port: 49152,
      bport: this.port,
      binterval: this.interval,
    })
    if (this.encoding) {
      this.zyre.setEncoding(this.encoding)
    }

    let onClose = (removed, done) => {
      events.forEach(event => this.zyre.removeAllListeners(event))

      this.zyre.stop(() => {
        if (this.groups) {
          this.groups.forEach(group => this.zyre.leave(group))
        }
        this.log(`Stopped zyre peer: ${this.name}`)
      })
        .then(() => done && done())
    }

    this.zyre.start(() => {
      if (this.groups) {
        this.groups.forEach(group => this.zyre.join(group))
      }
      this.log(`Started zyre peer: ${this.name}`)
    })
      .then(() => this.on('close', onClose))
  }

  RED.nodes.registerType('zyre-peer', ZyrePeerNode)
}