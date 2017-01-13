require('proof/redux')(1, require('cadence')(prove))

function prove (async, assert) {
    var bin = require('../include.bin')
    var io
    async(function () {
        io = bin([ '--select', '.include', '--type', 'text' ], {}, async())
        io.stdin.write('<div data-file="edify.include/t/include.txt" class="include"></div>')
        io.stdin.end()
    }, function () {
        assert(io.stdout.read().toString(), '<div data-file="edify.include/t/include.txt" class="include">DT&amp;I\n</div>', 'running')
    })
}
