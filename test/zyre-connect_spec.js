let helper = require('node-red-node-test-helper')
let node = require('../zyre-connect')

describe('zyre-connect tests', () => {
  beforeEach(function (done) {
    // helper.startServer(done)
  })
  afterEach(function (done) {
    helper.unload()
      // .then(() => helper.stopServer(done))
  })

  let peer1 = {
    id: 'peer1',
    name: 'peer1',
    port: 5670,
    evasive: 5000,
    expired: 30000,
    interval: 1000,
    groups: 'events',
    headers: '{"X-Primary": "true", "X-Backup": "false"}',
    encoding: 'utf8'
  }
  let peer2 = {
    id: 'peer2',
    name: 'peer2',
    port: 5670,
    evasive: 5000,
    expired: 30000,
    interval: 1000,
    groups: 'events',
    headers: '{"X-Primary": "true", "X-Backup": "false"}',
    encoding: 'utf8'
  }
  it('should be loaded', function (done) {
    let flow = [
      // peer1,
      {
        id: 'n1',
        type: 'zyre-connect',
        name: 'connect',
        zyre: 'peer1'
      }
    ]
    helper.load(node, flow, function () {
      let n1 = helper.getNode('n1')
      n1.should.have.property('name', 'connect')
      done()
    })
  })

  // it('other stuff', done => {
  //   let flow = [
  //     peer1,
  //     peer2,
  //     {
  //       id: 'connect1',
  //       type: 'zyre-connect',
  //       name: 'connect'
  //     },
  //     {
  //       id: 'connect2',
  //       type: 'zyre-connect',
  //       name: 'connect'
  //     }
  //   ]
  // })
})