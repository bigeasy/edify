require('proof')(1, require('cadence')(prove))

function prove (async, assert) {
    var bin = require('../../markdown.bin'), 'require')
    var io
    async(function () {
        io = bin({}, [], {}, async())
        io.stdin.write('*strong*')
        io.stdin.end()
    }, function () {
        assert(io.stdout.read().toString(), 'Wink API Poster API', 'running')
    })
}
