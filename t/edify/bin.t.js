require('proof')(1, require('cadence/redux')(prove))

function prove (async, assert) {
    var edify = require('../../edify.bin')
    var stream = require('stream')
    var stdout = new stream.PassThrough
    async(function () {
        edify({}, [ '--help' ], { stdout: stdout }, async())
    }, function () {
        assert(/^usage:/.test(stdout.read().toString()), 'assert')
    })
}
