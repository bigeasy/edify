require('proof/redux')(1, require('cadence')(prove))

function prove (async, assert) {
    var bin = require('../markdown.bin')
    var io
    async(function () {
        io = bin([ '--select', '.markdown' ], {}, async())
        io.stdin.write('<div class="markdown">*strong*</div>')
        io.stdin.end()
    }, function () {
        assert(io.stdout.read().toString(), '<div class="markdown"><p><em>strong</em></p>\n</div>', 'running')
    })
}
