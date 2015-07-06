var marked = '<div class="markdown"><p><em>Hello, World!</em></p>\n\
</div>'

require('proof')(1, require('cadence/redux')(proof))

function proof (async, assert) {
    var edify = require('../..')
    var cheerio = require('cheerio')
    var $ = cheerio.load('<div class="markdown">*Hello, World!*</div>')
    async(function () {
        edify.marked($, '.markdown', async())
    }, function () {
        assert($.html(), marked, 'marked')
    })
}
