const RE = {
    code: new RegExp('^```'),
    directive: /(\s*)\/\/({.*)/
}

module.exports = function (source, mode) {
    const lines = []
    const blocks = []
    let block = {
        text: null,
        name: null,
        unblock: false,
        vargs: { text: {}, code: {} },
        mode: 'both',
        code: []
    }
    let parse = 'text'
    let lineNumber = 1
    function gather (line) {
        if (parse == 'text') {
            block.text = lines.splice(0)
            lines.push(line)
        } else {
            lines.push(line)
            block.code = lines.splice(0)
            blocks.push(block)
            block = {
                text: null,
                name: null,
                unblock: false,
                vargs: { text: {}, code: {} },
                mode: 'both',
                code: []
            }
        }
    }

    for (const line of source.split('\n')) {
        const code = []
        if (parse == 'text') {
            if (RE.code.test(line)) {
                gather(line)
                parse = 'code'
            } else {
                if (/\S/.test(line)) {
                    lines.push(line)
                } else {
                    lines.push('')
                }
            }
        } else {
            if (RE.code.test(line)) {
                gather(line)
                parse = 'text'
            } else {
                const $ = RE.directive.exec(line)
                if ($ != null) {
                    try {
                        const directive = JSON.parse($[2])
                        if ('include' in directive) {
                            directive.indent = $[1].length
                            if (directive.mode == null || directive.mode == mode) {
                                lines.push(directive)
                            }
                        } else {
                            block.unblock = directive.unblock || false
                            block.save = directive.save || null
                            block.name = block.name || directive.name
                            block.vargs.code = directive.code || block.vargs.code
                            block.vargs.text = directive.text || block.vargs.text
                            block.mode = directive.mode ?? block.mode
                        }
                    } catch (error) {
                        console.log('line number', lineNumber)
                        throw error
                    }
                } else {
                    lines.push(line)
                }
            }
        }
        lineNumber++
    }

    gather('')

    blocks.push(block)

    return blocks
}
