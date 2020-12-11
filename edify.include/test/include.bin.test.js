require('proof')(2, async okay => {
    const stream = require('stream')
    const include = require('../include.bin')
    const child = include([ '--select', '.include', '--type', 'text' ], {
        $stdin: new stream.PassThrough,
        $stdout: new stream.PassThrough
    })
    child.options.$stdin.write('<div data-file="test/include.txt" class="include"></div>')
    child.options.$stdin.end()
    okay(await child.promise, 0, 'exit')
    okay(child.options.$stdout.read().toString(), '<div data-file="test/include.txt" class="include">DT&amp;I\n</div>', 'running')
})
