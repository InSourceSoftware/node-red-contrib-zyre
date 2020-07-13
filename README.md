node-red-contrib-zyre
==

[Node-RED](http://nodered.org/) nodes for Zyre - an open-source framework for proximity-based peer-to-peer applications.

Relies on the [zyre.js](https://www.npmjs.com/package/zyre.js) and [zeromq](https://www.npmjs.com/package/zeromq) packages. Note: The [zeromq](https://www.npmjs.com/package/zeromq) package can take time to compile if pre-built binaries are not available.

Install
--

Run the following command in your Node-RED user directory - typically `~/.node-red`

    npm install node-red-contrib-zyre

Setup
--

Drag any Zyre node onto the palette to create a zyre peer. Click edit on the **Zyre Peer** field to set up a new node. The defaults are usually sufficient, but see the following for information about each field.

**Name:** The name of the zyre peer config node. **Note:** This also controls the name of the peer itself unless the environment variable `ZYRE_PEER_NAMES` is set, in which case the actual name is randomly chosen from the comma-delimited list.

**Port:** The ZRE UDP-beacon broadcast port can be changed if desired to create a new Zyre network.

**Evasive:** The number of milliseconds before a peer is considered evasive.

**Expired:** The number of milliseconds before an evasive peer is considered expired. After this long, the `expired` event is fired.

**Interval:** The number of milliseconds between UDP-beacon broadcasts. The `connect` event is fired when new nodes are discovered.

**Groups:** A comma-delimited list of groups to join on start-up.

**Headers:** A JSON-string containing key/value headers sent with the ZRE `HELLO` message for the `connected` event.

**Encoding:** The payload encoding of received messages. Defaults to `utf8`. Available values are: `ascii`, `utf8`, `utf16le`/`ucs2`, `base64`, `binary`, or `hex`. Use `raw` to receive raw buffers.

Input
--

All Zyre nodes can be used for input. For presence nodes (`connect`, `disconnect`, `expired`, `join`, and `leave`), the payload is a JSON object containing information about the event. The identifier or name of the peer from the event can be used to send a `zyre-whisper` (see below).

* **zyre connect**: `identity`, `name`, `headers`
* **zyre disconnect**: `identity`, `name`
* **zyre expired**: `identity`, `name`
* **zyre join**: `identity`, `name`, `group`
* **zyre leave**: `identity`, `name`, `group`

For messaging nodes (`whisper`, `shout`), the payload is either a JSON object, a string, or a raw buffer (if encoding is set to `raw` on the zyre peer config node). In addition, the information about the event is sent as additional fields on the `msg`.

* **zyre whisper**: `topic`, `identity`, `name` (topic is the identity of the sender)
* **zyre shout**: `topic`, `identity`, `name` (topic is the name of the group)

For input, set the `topic` to the name of another zyre peer or the name of a group to filter input.

Output
--

The `join`, `leave`, `whisper`, and `shout` nodes can be used for output.

* **zyre join**: Uses either the `topic` on the `msg`, `topic` on the node, or `payload` on the `msg` to join a group.
* **zyre leave**: Uses either the `topic` on the `msg`, `topic` on the node, or `payload` on the `msg` to leave a group.
* **zyre whisper**: Uses either the `topic` on the `msg` or `topic` on the node to whisper another peer on the network. The topic can be set to either the identity or name of the peer.
* **zyre shout**: Uses either the `topic` on the `msg` or `topic` on the node to shout to a group.