fs      = require "fs"
stencil = require "stencil"
showdown = require "./../vendor/showdown"

engine = new stencil.Engine (resource, compiler, callback) ->
  fs.readFile "#{resource}", "utf8", (error, source) ->
    if error
      callback error
    else
      compiler source, callback

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

# Highlights a single chunk of CoffeeScript code, using **Pygments** over stdio,
# and runs the text of its corresponding comment through **Markdown**, using the
# **Github-flavored-Markdown** modification of
# [Showdown.js](http://attacklab.net/showdown/).
#
# We process the entire file in a single call to Pygments by inserting little
# marker comments between each section and then splitting the result string
# wherever our markers occur.

#
highlight = (section, block, callback) ->
  language = block.shift()
  if language
    pygments = spawn 'pygmentize', ['-l', language, '-f', 'html', '-O', 'encoding=utf-8']
    output   = ''
    pygments.stderr.addListener 'data',  (error)  ->
      process.stderr.write error if error
    pygments.stdout.addListener 'data', (result) ->
      output += result if result
    pygments.addListener 'exit', ->
      section.html.push(output)
      #output = output.replace(highlight_start, '').replace(highlight_end, '')
      #fragments = output.split language.divider_html
      #for section, i in sections
      #j.u  section.code_html = highlight_start + fragments[i] + highlight_end
      #  section.docs_html = showdown.makeHtml section.docs_text
      callback()
    pygments.stdin.write(block.join("\n"))
    pygments.stdin.end()
  else if block.length
    indent = parseInt(/^(\s*)/.exec(block[0])[1], 10)
    block = for line in block
      line.substring(indent)
    block = block.join("\n")
    block = block.replace(/&/g, "&amp").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    section.html.push("<div class='highlight'><pre>" + block + "</pre></div>")
    callback()

# The Twinkie model will work great for this project. Twinkie will ever be of
# any interest to anyone but myself. Using a Cakefile to initiate a build,
# however, will be appealing. The problem with Twinkie is that we want people to
# check out and build immediately, so it must be written in pure CoffeeScript,
# because too many build dependencies are going to frustrate adoption.
# Generating an entire web site, that requires something. People already use a
# command line application do this, they are expecting it. We'll require that
# you run npm, which they expect, but then run cake. All the configuration goes
# into the Cakefile.
class Edify
  constructor: ->
    @contents = []
    @languages = {}
    @templates = []
  parse: (options...) -> @contents.push options
  language: (language, options) ->
    suffixes = options.suffix
    suffixes = [ suffixes ] if not Array.isArray(suffix)
    for suffix in suffixes
      @languages[suffix] = extend { language }, options
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
  _format: (language, from, to, _) ->
    lines = fs.readFile(from, "utf8", _).split(/\n/)
    page = [{}]
    if language is "markdown"
      page.push { docco: lines }
    else
      language = @languages[language]
      for line in lines
        if match = language.docco.exec line
          page.unshift { docco: [] } if page[0].source
          page[0].docco.push match[1]
        else
          page[0].source = [] unless page[0].source
          page[0].source.push line
    page.reverse()
    page.pop() unless page[page.length - 1].source
    for section in page
      section.docco = showdown.makeHtml(section.docco.join("\n"))
    for template in @templates
      if template.regex.test from
        break
    output = engine.execute template.stencil, { page }, _
    fs.writeFile to, output, "utf8", _
  _edify: (_) ->
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
        @_format(language, from, to, _)
  tasks: ->
    task "edify", """Construct web site.""", => @_edify (error) -> throw error if error

module.exports = -> new Edify
