#!/usr/bin/env node
/*

    ___ usage ___ en_US ___
    node highlight.bin.js <options> [sockets directory, sockets directory...]

    options:

        --help

            display help message

        --mode <string>

            generator mode, 'text' or 'code', default 'text'.

    ___ $ ___ en_US ___

        select is required:
            the `--select` argument is a required argument

        language is required:
            the `--language` argument is a required argument
    ___ . ___

 */
require('arguable')(module, async arguable => {
    const fs = require('fs').promises
    const split = require('./split')
    const sprintf = require('sprintf-js').sprintf

    arguable.helpIf(arguable.ultimate.help)

    const mode = arguable.ultimate.mode ?? 'text'

    function trim (lines) {
        while (lines[lines.length - 1] == '') {
            lines.pop()
        }
        while (lines[0] == '') {
            lines.shift()
        }
        return lines
    }

    function add(blocks, block, text, included = false) {
            let trimmed = trim(block.text)
            if (trimmed.length != 0) {
                if (mode == 'code') {
                    trimmed = trimmed.map(line => /\S/.test(line) ? `// ${line}` : '//')
                }
                text.push.apply(text, trimmed)
                text.push('')
            }
            if (block.mode == mode || block.mode == 'both') {
                const code = []
                for (const line of block.code) {
                    if (typeof line == 'object') {
                        if (mode == 'code') {
                            let included = include(blocks, line)
                            if (included.length != 0) {
                                included = included.map(_line => /\S/.test(_line) ? `${' '.repeat(line.indent)}${_line}` : _line)
                                code.push.apply(code, included)
                            }
                        }
                    } else {
                        code.push(sprintf(line, block.vargs[mode]))
                    }
                }
                if (mode == 'text' && block.unblock) {
                    code.splice(1, 1)
                    code.splice(code.length - 2, 1)
                    let indent = Infinity
                    for (let i = 1, I = code.length - 1; i < I; i++) {
                        if (/\S/.test(code[i])) {
                            indent = Math.min(/^(\s*)/.exec(code[i])[1].length, Infinity)
                        }
                    }
                    for (let i = 1, I = code.length - 1; i < I; i++) {
                        code[i] = code[i].substring(indent)
                    }
                }
                if (mode == 'code') {
                    code.splice(0, 1)
                    code.splice(code.length - 1, 1)
                }
                text.push.apply(text, code)
                text.push('')
            }
    }

    function include (blocks, directive) {
        const text = []
        for (let i = 0; i < blocks.length;) {
            if (blocks[i].name == directive.include) {
                const block = blocks.splice(i, 1).shift()
                add(blocks, block, text, true)
            } else {
                i++
            }
        }
        return text
    }

    const text = []
    for (const file of arguable.argv) {
        const body = await fs.readFile(file, 'utf8')
        const blocks = split(body)
        while (blocks.length != 0) {
            const block = blocks.shift()
            add(blocks, block, text)
        }
    }

    while (text[text.length - 1] == '' && text[text.length - 2] == '') {
        text.pop()
    }

    process.stdout.write(text.join('\n'))

    return 0
})
