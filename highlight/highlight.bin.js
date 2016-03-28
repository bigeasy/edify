/*

    ___ usage ___ en_US ___
    node highlight.bin.js <options> [sockets directory, sockets directory...]

    options:

        --help                          display help message
        -s, --select        <string>    path to select
        -l, --language      <string>    the language

    ___ $ ___ en_US ___

        select is required:
            the `--select` argument is a required argument

    ___ . ___

 */
require('arguable')(module, require('cadence')(function (async, program) {
    program.helpIf(program.param.help)
    program.required('select', 'language')

    var Delta = require('delta')
    var highlight = require('highlight.js')
    var cheerio = require('cheerio')

    program.stdin.resume()
    async(function () {
        program.stdin.resume()
        var delta = new Delta(async())
        delta.ee(program.stdin).on('data', []).on('end')
    }, function (lines) {
        var $ = cheerio.load(Buffer.concat(lines).toString('utf8'))
        $(program.param.select).each(function () {
            this.html(highlight.highlight(program.param.language, this.text()).value)
        })
        program.stdout.write($.html())
    })
}))
