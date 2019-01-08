require('proof')(4, require('cadence')(prove))

function prove (async, assert) {
    var bin = require('../ls.bin')
    var io
    async(function () {
        io = bin([ __dirname ], async())
    }, function (json) {
        var json = JSON.parse(io.stdout.read().toString())
        assert(json.length, 1, 'listing')
        assert(json[0].stats != null, 'stats')
        assert(/\/ls\.bin\.t\.js$/.test(json[0].path), 'path')
        assert(json[0].isFile, 'is file')
    })
}
