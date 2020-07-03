node-red-contrib-zyre
==

[Node-RED](http://nodered.org/) nodes for Zyre - an open-source framework for proximity-based peer-to-peer applications.

Relies on the [zyre.js](https://www.npmjs.com/package/zyre.js) and [zeromq](https://www.npmjs.com/package/zeromq) packages. Note: The [zeromq](https://www.npmjs.com/package/zyre.js) package can take time to compile if pre-built binaries are not available.

Install
--

Run the following command in your Node-RED user directory - typically `~/.node-red`

    npm install node-red-contrib-zyre

**Note:** This package has not yet been released. To preview the package, build the package from source:

    # Replace the following with your path to node-red
    cd ~/.node-red
    git clone git@github.com/InSourceSoftware/node-red-contrib-zyre.git
    npm install node-red-contrib-zyre
