describe('argv', () => {
    const assert = require('assert')
    it('can argv', async () => {
        const path = require('path')
        const json = require('../json')
        assert.equal(await json('"x"'), 'x', 'parse json string')
        assert.deepStrictEqual(await json(path.join(__dirname, 'json.json')), { a: 1 }, 'parse json from file')
        try {
            await json('{')
            throw new Error
        } catch (error) {
            assert(error instanceof SyntaxError, 'failed')
        }
    })
})
