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
require('arguable')(module, async arguable => {
    const highlight = require('highlight.js')
    const cheerio = require('cheerio')
    const once = require('prospective/once')

    arguable.helpIf(arguable.ultimate.help)
    arguable.required('select', 'language')

    const stdin = []
    arguable.stdin.resume()
    arguable.options.$stdin.on('data', chunk => stdin.push(chunk))
    await once(arguable.stdin, 'end')
    const $ = cheerio.load(Buffer.concat(stdin).toString('utf8'), {}, false)
    $(arguable.ultimate.select).each(function () {
        $(this).html(highlight.highlight(arguable.ultimate.language, $(this).text()).value)
    })
    arguable.stdout.write($.html())
    return 0
})
