var cadence = require('cadence')
var redux = require('cadence/redux')
var spawn = require('child_process').spawn

// make a note, I like to use cadence even when the actual
// implementation is not evented.
exports.marked = redux(function (step, $, selector) {
    var marked = require('marked')
    $(selector).each(function () {
        this.html(marked(this.text()))
    })
})

exports.pygments = cadence(function (step, $, selector, language, cache) {
    var d = require('domain').create()
    d.run(function () {
        var elements = []
        $(selector).each(function () { elements.push(this) })
        step(function (element) {
            var text = element.text()
            if (cache[text]) element.html(cache[text])
            else step(function () {
                var code = text.split('\n')

                var indent = code.reduce(function (indent, line) {
                    var $ = /^(\s+)\S/.exec(line)
                    if ($) {
                        indent = Math.min(indent, $[1].length)
                    }
                    return indent
                }, 0)

                code = code.map(function (line) { return line.substring(indent) })

                var pygments = spawn('pygmentize', [
                    '-l', language, '-f', 'html', '-O', 'encoding=utf-8'
                ], {
                    customFds: [ -1, -1, 2 ]
                })
                pygments.stdout.on('data', step(null, []))
                pygments.on('close', step(null))

                pygments.stdin.setEncoding('utf8')
                pygments.stdin.write(code.join('\n'))
                pygments.stdin.end()
            }, function (stdout, code, signal) {
                if (code != 0) throw new Error('pygments exited with an error')
                return stdout.join('')
            }, function (code) {
                element.html(cache[text] = code)
            })
        })(elements)
    })
    d.on('error', step(Error))
})
