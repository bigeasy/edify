/*

    ___ usage ___ en_US ___
    node markdown.bin.js <options> [sockets directory, sockets directory...]

    options:

        --help                          display help message
        -s, --select        <string>    path to select

    ___ $ ___ en_US ___

        select is required:
            the `--select` argument is a required argument

    ___ . ___

 */
require('arguable')(module, require('cadence')(function (async, program) {
    var delta = require('delta')
    var marked = require('marked')
    var cheerio = require('cheerio')

    program.helpIf(program.ultimate.help)
    program.required('select')

    program.stdin.resume()
    async(function () {
        program.stdin.resume()
        delta(async()).ee(program.stdin).on('data', []).on('end')
    }, function (lines) {
        var $ = cheerio.load(Buffer.concat(lines).toString('utf8'), {}, false)
        $(program.ultimate.select).each(function () { $(this).html(marked($(this).text())) })
        program.stdout.write($.html())
    })
}))
