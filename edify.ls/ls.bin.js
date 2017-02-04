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
    var fs = require('fs')
    var path = require('path')
    var coalesce = require('nascent.coalesce')

    var delta = require('delta')
    var dir = coalesce(program.argv[0], '.')

    program.helpIf(program.ultimate.help)

    async(function () {
        fs.readdir(dir, async())
    }, function (files) {
        async.map(function (file) {
            async(function () {
                fs.stat(path.join(dir, file), async())
            }, function (stats) {
                return {
                    name: file,
                    path: path.join(dir, file),
                    stats: stats,
                    isFile: stats.isFile(),
                    isDirectory: stats.isDirectory(),
                    isBlockDevice: stats.isBlockDevice(),
                    isCharacterDevice: stats.isCharacterDevice(),
                    isSymbolicLink: stats.isSymbolicLink(),
                    isFIFO: stats.isFIFO(),
                    isSocket: stats.isSocket()
                }
            })
        })(files)
    }, function (ls) {
        program.stdout.write(JSON.stringify(ls) + '\n')
    })
}))
