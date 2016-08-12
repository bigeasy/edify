/*

    ___ usage ___ en_US ___
    node markdown.bin.js <options> [sockets directory, sockets directory...]

    options:

        --help                          display help message
        -s, --select        <string>    path to select
        -t, --type          <string>    either text or html

    ___ $ ___ en_US ___

        select is required:
            the `--select` argument is a required argument

    ___ . ___

 */
require('arguable')(module, require('cadence')(function (async, program) {
    var delta = require('delta')
    var path = require('path')
    var cheerio = require('cheerio')
    var fs = require('fs')

    program.helpIf(program.ultimate.help)
    program.required('select', 'type')
    program.assert(/^(?:text|html)$/.test(program.ultimate.type), 'bad type')

    async(function () {
        program.stdin.resume()
        delta(async()).ee(program.stdin).on('data', []).on('end')
    }, function (lines) {
        var $ = cheerio.load(Buffer.concat(lines).toString('utf8'))
        async(function () {
            async.forEach(function (selected) {
                async(function () {
                    var file = $(selected).attr('data-file')
                    var resolved = path.resolve(process.cwd(), file)
                    fs.readFile(resolved, 'utf8', async())
                }, function (body) {
                    $(selected)[program.ultimate.type](body)
                })
            })($(program.ultimate.select))
        }, function () {
            program.stdout.write($.html())
        })
    })
}))
