# Quick and dirty GitHub documention generation designed to work with
# `gh-pages`. Docco inspired. Not quite as quick and dirty as Docco.
#
# * [Home](/index.html)

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
  console.log.apply null, splat if splat.length
  process.exit 1
say = (splat...) -> console.log.apply null, splat

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
      options.docco = new RegExp "^\\s*#{options.docco}\\s*(.*)"
      options.divider = "# --- EDIFY DIVIDER ---"
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
            base = /^.*\/(.*)\.[^.]+/.exec(file)[1]
            found.push [ file, "#{to}/#{base}.html" ]

        for dir in dirs
          continue if /^\./.test dir
          find found, "#{from}/#{dir}",  "#{to}/#{dir}", _
      else
        found.push [ from, to ]
      found
    (_) -> find([], from, to,_)

  # Format a source file converting it into an HTML page. 
  _format: (language, from, to, _) ->
    lines = fs.readFile(from, "utf8", _).split(/\n/)
    # In the case of a markdown file, the lines are the docco.
    if language is "markdown"
      page = [{ docco: lines }]
    # Otherwise, we extract docco from a source file. We create maps that
    # assocate chunk of docco with lines of code.
    else
      page = [{ docco: [] }]
      language = @languages[language]
      for line in lines
        if match = language.docco.exec line
          page.unshift { docco: [] } if page[0].source
          page[0].docco.push match[1]
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
      source = sources.join("#{language.divider}\n")
      pygmentized = pygmentize(language.lexer, source, _)
      divider = new RegExp("<span[^>]+>#{language.divider}</span>")
      for source, i in pygmentized.split divider
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
      path = parse(request.url).pathname
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
