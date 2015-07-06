var cadence = require('cadence')

exports.generate = cadence(function (step, argv) {
    var fs = require('fs')
    var path = require('path')

    var mkdirp = require('mkdirp')
    var cheerio = require('cheerio')

    var source = argv.shift()
    var destination = path.resolve(process.cwd(), argv.shift())

    // horrible location for a temporary file, but...
    var storage = path.join(path.dirname(destination), '.' + path.basename(destination) + '.edify~')

    step(function () {
        mkdirp(path.dirname(destination), step())
    }, function () {
        var edify = step(function (destination) {
            step([function (ation) {
                fs.stat(path.join(destination, 'edify.js'), step())
            }, function () {
                var parent = path.dirname(destination)
                if (parent == destination) throw new Error('cannot find project\'s edify.js')
                return step(edify) && parent
            }], function () {
                return path.join(destination, 'edify.js')
            })
        })(1, destination)
    }, function (module) {
        step()(null, require(module))
        fs.readFile(source, 'utf8', step())
        step([function () {
            fs.readFile(storage, 'utf8', step())
        }, /^ENOENT$/, function () {
            return '{}'
        }], function (body) {
            return JSON.parse(body)
        })
    }, function (edify, body, cache) {
        var $ = cheerio.load(body)    
        step(function () {
            edify($, cache, step())
        }, function () {
            fs.writeFile(destination, $.html(), 'utf8', step())
            fs.writeFile(storage, JSON.stringify(cache, null, 2),  'utf8', step())
        })
    })
})

exports.runner = cadence(function (step, options, stdin, stdout, stderr) {
    if (options.params.help) options.help()
    exports.generate(options.argv, step())
})
