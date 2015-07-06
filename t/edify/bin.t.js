var cadence = require('cadence/redux')

require('proof')(3, cadence(prove))

function prove (async, assert) {
    var fs = require('fs')
    var path = require('path')
    var edify = require('../../edify.bin')
    var stream = require('stream')
    var stdout = new stream.PassThrough
    var cleanup = cadence(function (async) {
        async([function () {
            fs.unlink(path.join(__dirname, '../fixtures/project/html/.foo.html.edify~' ), async())
        }, /^ENOENT$/, function () {
        }])
    })
    async([function () {
        cleanup(async())
    }], function () {
        cleanup(async())
    }, function () {
        edify({}, [ '--help' ], { stdout: stdout }, async())
    }, function () {
        assert(/^usage:/.test(stdout.read().toString()), 'help')
    }, function () {
        edify({}, [ 't/fixtures/project/docs/foo.html',
                    't/fixtures/project/html/foo.html' ], { stdout: stdout }, async())
    }, function () {
        fs.readFile('t/fixtures/project/html/foo.html', 'utf8', async())
    }, function (html) {
        assert(html, '<html>Hello, World!</html>\n', 'run')
    }, function () {
        edify({}, [ 't/fixtures/project/docs/foo.html',
                    't/fixtures/project/html/foo.html' ], { stdout: stdout }, async())
    }, function () {
        fs.readFile('t/fixtures/project/html/foo.html', 'utf8', async())
    }, function (html) {
        assert(html, '<html>Hello, World!</html>\n', 'run with cache')
    })
}
