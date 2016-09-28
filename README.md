# Method Man

Bidirectional rpc and streams for WebSockets and WebRTC.

## Usage

basic

```javascript
const methodman = require('methodman')
const fs = require('fs')
const meth = methodman(duplexStream)
meth.commands({echo: (txt, cb) => cb(null, txt), ping: cb => cb(null)})
meth.on('commands', remote => {
  if (remote.ping) {
    let start = Date.now()
    remote.ping(() => {
      console.log(`pingtime ${Date.now() - start}`)
    })
  }
})
fs.createReadStream('test.file').pipe(meth.stream('test.file'))
meth.on('stream', (stream, id) {
  stream.pipe(fs.createWriteStream(`${__dirname}/${id}`))
})
```

### w/ WebSockets

client.js

```javascript
const websocket = require('websocket-stream')
const methodman = require('methodman')
const ws = websocket('ws://localhost:8080')
const meth = methodman(ws)
meth.commands({echo: (txt, cb) => cb(null, txt), ping: cb => cb(null)})
meth.on('commands', remote => {
  // call remote commands
})
let substream = meth.stream()
// now i can take someStream and .pipe(substream)
meth.on('stream', (stream, id) => {
  // I'm being sent a stream.
})
```

server.js

```javascript
const websocket = require('websocket-stream')
const methodman = require('methodman')
function onWebsocketStream (stream) {
  var meth = methodman(stream)
  meth.commands({echo: (txt, cb) => cb(null, txt), ping: cb => cb(null)})
  meth.on('commands', remote => {
    // call remote commands
  })
  let substream = meth.stream()
  // now i can take someStream and .pipe(substream)
  meth.on('stream', (stream, id) => {
    // I'm being sent a stream.
  })
}
const wss = websocket.createServer({server: app}, onWebsocketStream)
```

### w/ WebRTC

```javascript
const SimplePeer = require('simple-peer')
```

### `methodman(stream)`

Takes a duplex stream to sit on top of.

Returns a MethodMan instance.

### `meth.stream([id])`

Returns a new writable substream.

### `meth.commands(rpc)`

Expose a set of commands defined in the rpc object.

Uses `dnode` under the hood.

### Event: "commands" (remote, id)

A set of commands you can call that have been exposed by the other end.

### Event: "commands:id" (remote)

A set of commands you can call that have been exposed by the other end.

### Event: "stream" (stream, id)

A readable stream being sent from the remote end.

### Event: "stream:id" (stream)

A readable stream being sent from the remote end.
