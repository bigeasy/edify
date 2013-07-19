var cadence = require('cadence')

function htmlify (rawHtml) {
    var htmlparser = require("htmlparser2");
    var handler = new htmlparser.DefaultHandler(function (error, dom) {
        if (error) throw error
    });
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(rawHtml);
    console.log(require('util').inspect(handler.dom, false, null))
}

exports._generate = cadence(function (step, files) {
    var fs = require('fs')
    var marked = require('marked')
    var markdown = require('markdown').markdown;
    step(function (file) {
        fs.readFile(file, 'utf8', step())
    }, function (body) {
        console.log( markdown.toHTML( body ) );
        console.log( marked( body ) );
        //htmlify( marked( body ) );
    })(files)
})

exports.generate = cadence(function (step, argv) {
    var fs = require('fs')
    var path = require('path')

    var mkdirp = require('mkdirp')
    var cheerio = require('cheerio')

    var source = argv.shift()
    var destination = path.resolve(process.cwd(), argv.shift())

    // horrible location for a temporary file, but...
    var cache = path.join(path.dirname(destination), '.' + path.basename(destination) + '.~edify')

    step(function () {
        mkdirp(path.dirname(destination), step())
    }, function () {
        var edify = step(function (destination) {
            step([function (ation) {
                fs.stat(path.join(destination, 'edify.js'), step())
            }, function () {
                var parent = path.dirname(destination)
                if (parent == destination) throw new Error('cannot find edify.js')
                return step(edify) && parent
            }], function () {
                return path.join(destination, 'edify.js')
            })
        })(1, destination)
    }, function (module) {
        step()(null, require(module))
        fs.readFile(source, 'utf8', step())
        step([function () {
            fs.readFile(cache, 'utf8', step())
        }, /^ENOENT$/, function () {
            return '{}'
        }], function (body) {
            return JSON.parse(body)
        })
    }, function (edify, body, cache) {
        var $ = cheerio.load(body)    
        edify($)
        console.log($.html())
    })
})

exports.runner = cadence(function (step, options, stdin, stdout, stderr) {
    if (options.params.help) options.help()
    exports.generate(options.argv, step())
})
