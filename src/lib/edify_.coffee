fs      = require "fs"
stencil = require "stencil"

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
  parse: (options...) -> @contents.push options
  language: (language, options) ->
    suffixes = options.suffix
    suffixes = [ suffixes ] if not Array.isArray(suffix)
    for suffix in suffixes
      @languages[suffix] = extend { language }, options
  _find: (from, to, include, exclude) ->
    find = (found, from, to, _) ->
      found ?= []
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
        found.push files.concat(to)

      for dir in dirs
        continue if /^\./.test dir
        find found, "#{from}/#{dir}",  "#{to}/#{dir}", _

      found
    (_) -> find([], from, to,_)
  _format: (from, to, _) ->
    language = @languages[/\.([^.]+)$/.exec(from)[1]]
    lines = fs.readFile(from, "utf8", _).split(/\n/)
    file = [{}]
    for line in lines
      if match = language.docco.exec line
        file.unshift { docco: [] } unless file[0].docco
        file[0].docco.push match[1]
      else
        file.unshift { source: [] } unless file[0].source
        file[0].source.push line
    file.pop()
    file.reverse()
    base = /^.*\/(.*)\.[^.]+/.exec(from)[1]
    fs.writeFile "#{to}/#{base}.html", "<p>Hello, World!</p>", "utf8", _
  _edify: (_) ->
    for content in @contents
      [ language, from, to, include, exclude ] = content
      for batch in @_find(from, to, include, exclude)(_)
        to = batch.pop()
        for from in batch
          @_format(from, to, _)
  tasks: ->
    task "edify", """Construct web site.""", => @_edify (error) -> throw error if error

module.exports = -> new Edify
