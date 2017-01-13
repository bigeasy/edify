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

        language is required:
            the `--language` argument is a required argument
    ___ . ___

 */
require('arguable')(module, require('cadence')(function (async, program) {
    var delta = require('delta')
    var highlight = require('highlight.js')
    var cheerio = require('cheerio')

    program.helpIf(program.ultimate.help)
    program.required('select', 'language')

    async(function () {
        program.stdin.resume()
        delta(async()).ee(program.stdin).on('data', []).on('end')
    }, function (lines) {
        var $ = cheerio.load(Buffer.concat(lines).toString('utf8'))
        $(program.ultimate.select).each(function () {
            $(this).html(highlight.highlight(program.ultimate.language, $(this).text()).value)
        })
        program.stdout.write($.html())
    })
}))
