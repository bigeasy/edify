describe('highlight', () => {
    const assert = require('assert')
    it('can pug', async () => {
        const stream = require('stream')
        const pug = require('../pug.bin')
        const child = pug([ '"x"' ], {
            $stdin: new stream.PassThrough,
            $stdout: new stream.PassThrough
        })
        child.options.$stdin.write('p Hello, World! #{argv[0]}')
        child.options.$stdin.end()
        assert.equal(await child.promise, 0, 'exit')
        assert.equal(child.options.$stdout.read().toString(), '\n<p>Hello, World! x</p>\n', 'pug')
    })
})
