require('proof')(2, async okay => {
    const stream = require('stream')
    const markdown = require('../markdown.bin')
    const child = markdown([ '--select', '.markdown' ], {
        $stdin: new stream.PassThrough,
        $stdout: new stream.PassThrough
    })
    child.options.$stdin.write('<div class="markdown">*strong*</div>')
    child.options.$stdin.end()
    okay(await child.promise, 0, 'exit')
    okay(child.options.$stdout.read().toString(), '<div class="markdown"><p><em>strong</em></p>\n</div>', 'running')
})
