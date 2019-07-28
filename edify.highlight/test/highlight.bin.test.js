describe('highlight', () => {
    const assert = require('assert')
    it('can markdown', async () => {
        const stream = require('stream')
        const highlight = require('../highlight.bin')
        const child = highlight([ '--select', 'pre.javascript', '--language', 'javascript' ], {
            $stdin: new stream.PassThrough,
            $stdout: new stream.PassThrough
        })
        child.options.$stdin.write('<pre class="javascript">var i = 0;</div>')
        child.options.$stdin.end()
        assert.equal(await child.promise, 0, 'exit')
        assert.equal(child.options.$stdout.read().toString(), '<pre class="javascript"><span class="hljs-keyword">var</span> i = <span class="hljs-number">0</span>;</pre>', 'highlight')
    })
})
