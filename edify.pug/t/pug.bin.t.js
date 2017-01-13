require('proof/redux')(1, require('cadence')(prove))

function prove (async, assert) {
    var bin = require('../pug.bin')
    var io
    async(function () {
        io = bin([], {}, async())
        io.stdin.write('p Hello, World!')
        io.stdin.end()
    }, function () {
        assert(io.stdout.read().toString(), '<p>Hello, World!</p>', 'pug')
    })
}
