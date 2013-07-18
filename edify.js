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

exports.generate = cadence(function (step, files) {
    var fs =require('fs')
    var cheerio = require('cheerio')

    step(function (file) {
        fs.readFile(file, 'utf8', step())
    }, function (body) {
        var $ = cheerio.load(body)    
        console.log($.html())
    })(files)
})

exports.runner = cadence(function (step, options, stdin, stdout, stderr) {
    if (options.params.help) options.help()
    exports.generate(options.argv, step())
})
