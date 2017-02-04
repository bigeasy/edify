/*

    ___ usage ___ en_US ___
    node highlight.bin.js <options> [sockets directory, sockets directory...]

    options:

        --help                          display help message
        -j, --json          <string>    optional json to feed to template

    ___ $ ___ en_US ___

        select is required:
            the `--select` argument is a required argument

        language is required:
            the `--language` argument is a required argument
    ___ . ___

 */
require('arguable')(module, require('cadence')(function (async, program) {
    var pug = require('pug')

    var delta = require('delta')

    program.helpIf(program.ultimate.help)

    var argv = program.argv.map(function (json) {
        return JSON.parse(json)
    })

    async(function () {
        program.stdin.resume()
        delta(async()).ee(program.stdin).on('data', []).on('end')
    }, function (lines) {
        var f = pug.compile(Buffer.concat(lines).toString('utf8'), { pretty: true })
        program.stdout.write(f({ argv: argv }) + '\n')
    })
}))
