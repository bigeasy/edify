edify = require("./code/lib/edify")()
edify.language "coffee"
  suffix: "coffee"
  docco: /^\s*#(.*)/
  ignore: [ /^#!/, /^#\s+vim/ ]
edify.language "c"
  suffix: [ "c", "h" ]
  ignore: [ /^#!/, /^# vim/ ]
  docco:
    start:  /^\s*\s(.*)/
    end:    /^(.*)\*\//
    strip:  /^\s+\*/
edify.parse "coffee", "code/src", "src", /\.coffee$/
edify.parse "code/README.md", "index.html"
edify.stencil /code\/.*.md/, "code/edify/default.stencil"
edify.tasks task
