var cadence = require('cadence')

// make a note, I like to use cadence even when the actual
// implementation is not evented.
exports.marked = cadence(function (step, $, selector) {
    var marked = require('marked')
    $(selector).each(function () {
        this.html(marked(this.text()))
    })
})
