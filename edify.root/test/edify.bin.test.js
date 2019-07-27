describe('edify', () => {
    const assert = require('assert')
    const edify = require('../edify.bin')
    it('can launch', async () => {
        const child = edify([ 'test' ])
        assert.equal(await child.promise, 0, 'exit')
    })
})
