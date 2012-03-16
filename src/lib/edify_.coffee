# Quick and dirty GitHub documention generation designed to work with
# `gh-pages`. Docco inspired. Not quite as quick and dirty as Docco.
#
# * [Home](/edify/index.html)

# Node.js requirements.
fs      = require "fs"
spawn   = require("child_process").spawn
parse   = require("url").parse

# Stencil is our templating language. Stencil is asynchronous. It does layouts,
# includes and snippets.
stencil   = require "stencil"
# This is GitHub Flavored Markdown Showdown. The original Docco removed the
# GitHub flavors. We'll follow suit when we figure out why.
showdown  = require "./../vendor/showdown"

# The Stencil rendering engine needs a resolver to load the unparsed Stencils.
# We read them from the file system relative to the root of the `gh-pages`
# project directory.
engine = new stencil.Engine (resource, compiler, callback) ->
  fs.readFile "#{resource}", "utf8", (error, source) ->
    if error
      callback error
    else
      compiler source, callback

# ### Utilities

# Copy values from one hash into another.
extend = (to, from) ->
  to[key] = value for key, value of from
  to

# Useful for debugging. If you don't see them called in the code, it means the
# code is absolutely bug free.
die = (splat...) ->
  console.log.apply console, splat if splat.length
  process.exit 1
say = (splat...) -> console.log.apply console, splat

# Highlight a block of code using [Pygments](http://pygments.org/). We call this
# method to highlight the code blocks for literate programming. We also use it
# for highlighting the examples in plain old Markdown.
#
# When formatting for literate programming, we chunk all the code together with
# dividers just as the origina Docco does. See below.
pygmentize = (language, code, callback) ->
  pygments = spawn "pygmentize", ["-l", language, "-f", "html", "-O", "encoding=utf-8"], { customFds: [ -1, -1, 2 ] }
  output = []
  pygments.stdout.setEncoding("utf8")
  pygments.stdout.on "data", (data) -> output.push data
  pygments.addListener 'exit', (code) -> callback(null, output.join(""))
  pygments.stdin.write(code)
  pygments.stdin.end()

# Not in use, yet. It is from my previous project, IDL. It is used to format a
# block of code when a Pygments lexer cannot be found for it.
pre = (block) ->
  indent = parseInt(/^(\s*)/.exec(block[0])[1], 10)
  block = for line in block
    line.substring(indent)
  block = block.join("\n")
  block = block.replace(/&/g, "&amp").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  section.html.push("<div class='highlight'><pre>" + block + "</pre></div>")
  callback()

# We use a Cakefile to initiate a build. The Edify class will define tasks in
# the Cakefile. The public methods of Edify are used to configure the Cakefile
# tasks that the Edify class creates.

#
class Edify
  constructor: ->
    @contents = []
    @languages = {}
    @templates = []
    @_mime =
      jpg: "image/jpg"
      jpeg: "image/jpg"
      png: "image/png"
      gif: "image/gif"
      js: "application/javascript"
      html: "text/html"
      css: "text/css"
      txt: "text/plain"
  parse: (options...) -> @contents.push options
  language: (language, options) ->
    if typeof options.docco is "string"
      comment = options.docco
      options.docco = {}
      options.docco.start = new RegExp "^\\s*#{comment}\\s*(.*)$"
      options.divider = "#{comment} --- EDIFY DIVIDER ---"
    @languages[language] = options
  stencil: (regex, stencil) ->
    @templates.push { regex, stencil }
  _find: (from, to, include, exclude) ->
    find = (found, from, to, _) ->
      found ?= []
      stat = fs.stat from, _
      if stat.isDirectory()
        # Gather up the CoffeeScript files and directories in the source directory.
        files = []
        dirs = []
        for file in fs.readdir from, _
          source = "#{from}/#{file}"
          if include.test(source) and not (exclude and exclude.test(source))
            try
              if fs.stat(source, _).mtime > fs.stat("#{to}/#{file}", _).mtime
                files.push source
            catch e
              files.push source
          else
            try
              stat = fs.stat "#{from}/#{file}", _
              if stat.isDirectory()
                dirs.push file # Create the destination directory if it does not exist.
            catch e
              console.warn "Cannot stat: #{from}/#{file}"
              throw e if e.code isnt "ENOENT"
              console.warn "File disappeared: #{from}/#{file}"
        if files.length
          try
            fs.stat to, _
          catch e
            path = to.split /\//
            for i in [0..path.length]
              try
                fs.mkdir path[0..i].join("/"), parseInt(755, 8), _
              catch e
                throw e if e.code isnt "EEXIST"
          for file in files
            base = /^.*\/(.*)$/.exec(file)[1]
            found.push [ file, "#{to}/#{base}.html" ]

        for dir in dirs
          continue if /^\./.test dir
          find found, "#{from}/#{dir}",  "#{to}/#{dir}", _
      else
        found.push [ from, to ]
      found
    (_) -> find([], from, to,_)

  # ### Highlight

  # Inovke Pygments for a language an array of snippets. We concat the snippets
  # using a divider, a comment that is unlikely to occur in real code. We can
  # then run Pygments once, instead of once for each snippet. We remove the
  # Pygmnts wrapper and split the result on our special divider comment.
  #
  # This trick is lifted from [Docco](https://github.com/jashkenas/docco).
  _highlight: (language, sources, _) ->
    source = sources.join("#{language.divider}\n")
    pygmentized = pygmentize(language.lexer, source, _)
    pygmentized = pygmentized.replace('<div class="highlight"><pre>', '')
    pygmentized = pygmentized.replace('</pre></div>', '')
    if language.divider.length
      regex = "(#{"/ . * + ? | ( ) [ ] { } \\".split(/\s+/).join("|\\")})"
      regex = new RegExp regex, "g"
      divider = language.divider.replace regex, "\\$1"
      divider = new RegExp("<span[^>]+>#{divider}</span>")
      pygmentized.split divider
    else
      [ pygmentized ]

  # ### Markdown
  #
  # Ordinary documentation is written in Markdown. We support only Markdown in
  # Edify. There is no pluggable markup language facility, nor will there be.
  #
  # Here we split the code between Markdown prose and code examples. If a
  # Pygments language highligher name is attached to the code example, the code
  # example is fed to Pygments.

  #
  _markdown: (lines, _) ->
    page = []
    markdown = []
    indexes = {}
    snippets = {}

    # Split the source between prose and code examples. We run the prose through
    # markdown and push it onto the page array.
    #
    # For code examples, we gather them into arrays grouped by language name. We
    # push a null value onto the page and take note of the current index in the
    # page array, because we're going to come back and place the highlighed code
    # into the page array when we've formatted them as HTML.
    for line in lines
      if snippet
        if /^```/.test line
          snippets[language].push snippet.join("\n")
          snippet = null
          source = false
        else
          snippet.push line
      else if match = /^```(\w+)?/.exec line
        language = match[1] or "text"

        page.push { docco: showdown.makeHtml(markdown.join("\n")), source: "" }
        markdown.length = 0

        snippets[language] ?= []
        indexes[language] ?= []
        indexes[language].push page.length

        page.push null

        snippet = []
      else
        markdown.push line

    # Push any remaning markdown onto the page.
    if markdown.length
      page.push { docco: showdown.makeHtml(markdown.join("\n")), source: "" }

    # For each language and its array of snippets, format the snippets.
    for language, sources of snippets
      # We have no language specified, escape the source and expose it is as
      # pre-formatted text.
      if language is "text"
        snippets[language] = for source, i in sources
          source = source.replace /[&<>]/g, (ch) ->
            { "&": "&amp;"
            , "<": "&lt;"
            , ">": "&gt;"
            }[ch]
          "<pre>#{source}</pre>"
      # Otherwise, use Pygments.
      else
        # If the application developer has defined a language in her `Cakefile`,
        # we can do a mass highlight, combining all the code with a divider,
        # then spliting the results. If not, we hightlight the snippets one at
        # time.
        if @languages[language]
          sources = @_highlight @languages[language], sources, _
        else
          sources = for source, i in sources
            @_highlight({ lexer: language, divider: "" }, [ source ], _).pop()
        snippets[language] = for source in sources
          '<div class="highlight"><pre>' + source + '</pre></div>'
    # Replace the sources with our formatted sources.
    for language, sources of snippets
      for source, i in sources
        page[indexes[language][i]] = { docco: source }
    # Return the page.
    page

  # Format a source file converting it into an HTML page. 
  _format: (language, from, to, _) ->
    lines = fs.readFile(from, "utf8", _).split(/\n/)
    # In the case of a markdown file, the lines are the docco.
    if language is "markdown"
      page = @_markdown(lines, _)
    # Otherwise, we extract docco from a source file. We create maps that
    # assocate chunk of docco with lines of code.
    else
      page = [{ docco: [] }]
      language = @languages[language]
      if typeof language.docco is "function"
        for line in lines
          if match = language.docco.exec line
            page.unshift { docco: [] } if page[0].source
            page[0].docco.push match[1]
          else
            page[0].source = [] unless page[0].source
            page[0].source.push line
      else
        for line in lines
          if docco
            if language.docco.end
              if match = language.docco.end.exec line
                if match[1].trim()
                  page[0].docco.push match[1].replace language.docco.strip, ""
                docco = false
              else
                page[0].docco.push line.replace language.docco.strip, ""
            else if match = language.docco.start.exec line
              page[0].docco.push match[1]
            else
              docco = false
              page[0].source = [] unless page[0].source
              page[0].source.push line
          else if match = language.docco.start.exec line
            docco = true
            page.unshift { docco: [] } if page[0].source
            comment = match[1]
            if language.docco.end and match = language.docco.end.exec comment
              comment = match[1]
              docco = false
            page[0].docco.push comment
          else
            page[0].source = [] unless page[0].source
            page[0].source.push line
      page.reverse()
      # Format the markdown.
      for section in page
        if section.docco
          section.docco = showdown.makeHtml(section.docco.join("\n"))
      # If we are program source, format the source code. We clump it together so
      # we only have to run pygmentize once, and so that pygmentize has all the
      # context it needs to color the code.
      if language.lexer
        sources = []
        for section in page
          sources.push section.source.join("\n") or ""
        for source, i in @_highlight language, sources, _
          page[i].source = source
    # Match a template to format the file.
    for template in @templates
      if template.regex.test from
        stencil = template.stencil
        break
    file = /^.*\/(.*)$/.exec(from)[1]
    output = engine.execute stencil, { page, file }, _
    fs.writeFile to, output, "utf8", _

  # Convert to HTML all documents that have changed.
  _edify: (_) ->
    sources = []
    for content in @contents
      count = 0
      count++ while typeof content[count] is "string"
      if count is 2
        [ from, to, include, exclude ] = content
        language = "markdown"
      else
        [ language, from, to, include, exclude ] = content
      for batch in @_find(from, to, include, exclude)(_)
        [ from, to ] = batch
        sources.push from
        @_format(language, from, to, _)
    sources

  _serve: (request, response, _) ->
    try
      @_watch(_) if @_dirty
      path = parse(request.url).pathname.replace(/\/[^/]+/, '')
      file = "#{process.cwd()}#{path}"
      mime = @_mime[/\.([^.]+)$/.exec(file)[1]] or "text/plain"
      stat = fs.stat file, _
      response.writeHead 200, "Content-Type": mime, "Content-Length": stat.size
      response.end fs.readFile(file, _)
    catch e
      if e.code is "ENOENT"
        response.writeHead 404, "Content-Type": "text/plain"
        response.end "Not found."
      else
        response.writeHead 500, "Content-Type": "text/plain"
        response.end e.toString()
  _watch: (_) ->
    @_dirty = false
    sources = @_edify(_)
    update = (current, previous) =>
      if current.mtime.getTime() != previous.mtime.getTime()
        for source in sources
          fs.unwatchFile source
        @_dirty = true
    for source in sources
      fs.watchFile source, update
  _server: ->
      http = require('http')
      @server = http.createServer (request, response) =>
        @_serve request, response, (error) -> throw error if error
      @server.listen(8088)
  tasks: ->
    task "edify", "Construct web site.", => @_edify (error) -> throw error if error
    task "edify:serve", "Serve web site and watch for changes.", =>
      @_dirty = true
      @_server()

module.exports = -> new Edify
