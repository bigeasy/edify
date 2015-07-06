var highlighted = '<div class="lang-javascript"><div class="highlight"><pre><span class="kd">var</span> <span class="nx">i</span> <span class="o">=</span> <span class="mi">0</span><span class="p">;</span>\n  <span class="kd">var</span> <span class="nx">j</span> <span class="o">=</span> <span class="mi">0</span><span class="p">;</span>\n</pre></div>\n</div>'

require('proof')(2, require('cadence/redux')(proof))

function proof (async, assert) {
    var $, cache = {}
    var edify = require('../..')
    var cheerio = require('cheerio')
    async(function () {
        $ = cheerio.load('<div class="lang-javascript">var i = 0;\n  var j = 0;</div>')
        edify.pygments($, '.lang-javascript', 'javascript', cache, async())
    }, function () {
        assert($.html(), highlighted, 'highlighted')
    }, function () {
        $ = cheerio.load('<div class="lang-javascript">var i = 0;\n  var j = 0;</div>')
        edify.pygments($, '.lang-javascript', 'javascript', cache, async())
    }, function () {
        assert($.html(), highlighted, 'cached')
    })
}
