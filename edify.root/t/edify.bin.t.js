require('proof/redux')(1, require('cadence')(prove))

function prove (async, assert) {
    var edify = require('../edify.bin')

    var io
    async(function () {
        io = edify([ 'test', 'a' ], {}, async())
    }, function (code) {
        assert(code, 0, 'code')
    })
}
