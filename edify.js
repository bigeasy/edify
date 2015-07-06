var cadence = require('cadence/redux')

exports.generate = cadence(function (async, argv) {
    var fs = require('fs')
    var path = require('path')

    var mkdirp = require('mkdirp')
    var cheerio = require('cheerio')

    var source = path.resolve(process.cwd(), argv.shift())
    var destination = path.resolve(process.cwd(), argv.shift())

    // todo: really resolve, '..' and everything, right? Or convince yourself
    // that it doens't matter as far as finding the `edify.js` goes, or, yeah,
    // it does matter, very much todo.

    // horrible location for a temporary file, but...
    var storage = path.join(path.dirname(destination), '.' + path.basename(destination) + '.edify~')

    async(function () {
        mkdirp(path.dirname(destination), async())
    }, function () {
        var loop = async(function (directory) {
            async([function () {
                fs.stat(path.join(directory, 'edify.js'), async())
            }, /^ENOENT$/, function () {
                if (directory == '/') throw new Error('cannot find "edify.js"')
                return [ loop(), path.dirname(directory) ]
            }], function () {
                return [ loop, path.join(directory, 'edify.js') ]
            })
        })(path.dirname(source))
    }, function (module) {
        var edify = require(module)
        async(function () {
            fs.readFile(source, 'utf8', async())
            async([function () {
                fs.readFile(storage, 'utf8', async())
            }, /^ENOENT$/, function () {
                return '{}'
            }], function (body) {
                return JSON.parse(body)
            })
        }, function (body, cache) {
            var $ = cheerio.load(body)
            async(function () {
                edify($, cache, async())
            }, function () {
                fs.writeFile(destination, $.html(), 'utf8', async())
                fs.writeFile(storage, JSON.stringify(cache, null, 2),  'utf8', async())
            })
        })
    })
})

exports.runner = cadence(function (async, options, stdin, stdout, stderr) {
    if (options.params.help) options.help()
    exports.generate(options.argv, async())
})
