require('proof/redux')(1, require('cadence')(prove))

function prove (async, assert) {
    var bin = require('../highlight.bin')
    var io
    async(function () {
        io = bin([ '--select', 'pre.javascript', '--language', 'javascript' ], {}, async())
        io.stdin.write('<pre class="javascript">var i = 0;</div>')
        io.stdin.end()
    }, function () {
        assert(io.stdout.read().toString(), '<pre class="javascript"><span class="hljs-keyword">var</span> i = <span class="hljs-number">0</span>;</pre>', 'highlight')
    })
}
