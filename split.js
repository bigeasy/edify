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
    for (const line of source.split('\n')) {
        const code = []
        if (parse == 'text') {
            if (RE.code.test(line)) {
                parse = 'code'
                block.text = lines.splice(0)
                lines.push(line)
            } else {
                if (/\S/.test(line)) {
                    lines.push(line)
                } else {
                    lines.push('')
                }
            }
        } else {
            if (RE.code.test(line)) {
                parse = 'text'
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
            } else {
                const $ = RE.directive.exec(line)
                if ($ != null) {
                    try {
                        const directive = JSON.parse($[2])
                        block.unblock = directive.unblock || false
                        block.name = block.name || directive.name
                        block.vargs.code = directive.code || block.vargs.code
                        block.vargs.text = directive.text || block.vargs.text
                        if ('include' in directive) {
                            directive.indent = $[1].length
                            if (directive.mode == null || directive.mode == mode) {
                                lines.push(directive)
                            }
                        } else {
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

    return blocks
}
