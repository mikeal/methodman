const multiplex = require('multiplex')
const dnode = require('dnode')
const EventEmitter = require('events').EventEmitter
const rand = () => Buffer(Math.random().toString()).toString('hex')

class MethodMan extends EventEmitter {
  constructor (stream) {
    super()
    this.plex = multiplex((substream, id) => {
      if (id.startsWith('dnode:')) {
        id = id.slice('dnode:'.length)
        let d = dnode()
        d.on('remote', remote => {
          this.emit('commands', remote, id)
          this.emit(`commands:${id}`, remote)
        })
        substream.pipe(d).pipe(substream)
        return
      }
      if (id.startsWith('stream:')) {
        id = id.slice('stream:'.length)
        this.emit('stream', substream, id)
        this.emit(`stream:${id}`, substream)
        return
      }
      // TODO: some kind of error.
    })
    stream.pipe(this.plex).pipe(stream)
  }
  commands (rpc, id) {
    let substream = this.plex.createStream(`dnode:${id || rand()}`)
    let d = dnode(rpc)
    substream.pipe(d).pipe(substream)
  }
  stream (id) {
    return this.plex.createStream(`stream:${id}`)
  }
}

module.exports = stream => new MethodMan(stream)
module.exports.MethodMan = MethodMan
