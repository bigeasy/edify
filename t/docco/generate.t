#!/usr/bin/env _coffee
fs = require "fs"
require("proof") 1, (_) ->
  edify = require("../../lib/edify").create()

  edify.language
    lexer: "coffeescript"
    docco: "#"
    ignore: [ /^#!/, /^#\s+vim/ ]

  source = fs.readFile "#{__dirname}/fixtures/hello.coffee", "utf8", _
  page = edify.docco "coffeescript", source, _
  expected = JSON.parse fs.readFile "#{__dirname}/fixtures/hello.json", "utf8", _
  @deepEqual page, expected, "parsed"
