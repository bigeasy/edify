describe('ls', () => {
    const assert = require('assert')
    it('can ls', async () => {
        const stream = require('stream')
        const ls = require('../ls.bin')
        const child = ls([ __dirname  ], {
            $stdout: new stream.PassThrough
        })
        assert.equal(await child.promise, 0, 'exit')
        const json = JSON.parse(child.options.$stdout.read().toString())
        assert.equal(json.length, 1, 'length')
        assert(json[0].stats != null, 'stats')
        assert(/\/ls\.bin\.test\.js$/.test(json[0].path), 'path')
        assert(json[0].isFile, 'is file')
    })
})
