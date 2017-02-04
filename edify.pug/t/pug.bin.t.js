require('proof/redux')(1, require('cadence')(prove))

function prove (async, assert) {
    var bin = require('../pug.bin')
    var io
    async(function () {
        io = bin([ '"x"' ], async())
        io.stdin.write('p Hello, World! #{argv[0]}')
        io.stdin.end()
    }, function () {
        assert(io.stdout.read().toString(), '\n<p>Hello, World! x</p>\n', 'pug')
    })
}
