// Quick and dirty GitHub documention generation designed to work with
// `gh-pages`. Docco inspired. Not quite as quick and dirty as Docco.
//
// * [Home](edify/index.html)

// Node.js requirements.
var fs = require("fs")
  , spawn = require("child_process").spawn
  , parse = require("url").parse
  ;

// This is GitHub Flavored Markdown Showdown. The original Docco removed the
// GitHub flavors. We'll follow suit when we figure out why.
var showdown = require("./../vendor/showdown");

// ### Utilities

// Copy values from one hash into another.
function extend (to, from) {
  for (key in from) to[key] = from[key];
  return to;
}

// Useful for debugging. If you don't see them called in the code, it means the
// code is absolutely bug free.
var __slice = [].slice;
function die () {
  console.log.apply(console, __slice.call(arguments, 0));
  return process.exit(1);
}

function say () { return console.log.apply(console, __slice.call(arguments, 0)) }

// Highlight a block of code using [Pygments](http://pygments.org/). We call this
// method to highlight the code blocks for literate programming. We also use it
// for highlighting the examples in plain old Markdown.
//
// When formatting for literate programming, we chunk all the code together with
// dividers just as the origina Docco does. See below.
function pygmentize (language, code, callback) {
  pygments = spawn("pygmentize", ["-l", language, "-f", "html", "-O", "encoding=utf-8"], { customFds: [ -1, -1, 2 ] });
  output = [];
  pygments.stdout.setEncoding("utf8");
  pygments.stdout.on("data", function (data) { output.push(data) });
  pygments.addListener('exit', function (code) { callback(null, output.join("")) });
  pygments.stdin.write(code);
  pygments.stdin.end();
}

// Not in use, yet. It is from my previous project, IDL. It is used to format a
// block of code when a Pygments lexer cannot be found for it.
function pre (block) {
  var indent = parseInt(/^(\s*)/.exec(block[0])[1], 10)
  for (var i = 0; i < block.length; i++) {
    block[i] = block[i].substring(indent);
  }
  block = block.join("\n"):
  block = block.replace(/&/g, "&amp").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  section.html.push("<div class='highlight'><pre>" + block + "</pre></div>");
  callback();
}

// We use a Cakefile to initiate a build. The Edify class will define tasks in
// the Cakefile. The public methods of Edify are used to configure the Cakefile
// tasks that the Edify class creates.

//
function Edify (lexers) {

  function language (options) {
    options = extend {}, options;
    if (typeof options.docco == "string") {
      comment = options.docco;
      options.docco = {};
      options.docco.start = new RegExp "^\\s*//{comment}\\s*(.*)$";
      options.divider = "//{comment} --- EDIFY DIVIDER ---";
    }
    lexers[options.lexer] = extend(lexers[options.lexer] || {}, options);
  }

  // ### Highlight

  // Inovke Pygments for a language an array of snippets. We concat the snippets
  // using a divider, a comment that is unlikely to occur in real code. We can
  // then run Pygments once, instead of once for each snippet. We remove the
  // Pygmnts wrapper and split the result on our special divider comment.
  //
  // This trick is lifted from [Docco](https://github.com/jashkenas/docco).
  function _highlight (language, sources, callback) {
    source = sources.join("//{language.divider}\n")
    pygmentize(language.lexer, source, check(callback, function (pygmentized) {
      pygmentized = pygmentized.replace('<div class="highlight"><pre>', '');
      pygmentized = pygmentized.replace('</pre></div>', '');
      if (language.divider.length) {
        regex = "(" + "/ . * + ? | ( ) [ ] { } \\".split(/\s+/).join("|\\") + ")";
        regex = new RegExp(regex, "g");
        divider = language.divider.replace(regex, "\\$1");
        divider = new RegExp("<span[^>]+>//{divider}</span>");
        callback(null, pygmentized.split(divider));
      } else {
        callback(null, [ pygmentized ]);
      }
    }));
  }

  // ### Markdown
  //
  // Ordinary documentation is written in Markdown. We support only Markdown in
  // Edify. There is no pluggable markup language facility, nor will there be.
  //
  // Here we split the code between Markdown prose and code examples. If a
  // Pygments language highligher name is attached to the code example, the code
  // example is fed to Pygments.

  //
  function markdown (lines, callback) {
    var page = []
      , markdown = []
      , indexes = {}
      , snippets = {}
      , i, I, line, language, sources
      ;

    // Split the source between prose and code examples. We run the prose through
    // markdown and push it onto the page array.
    //
    // For code examples, we gather them into arrays grouped by language name. We
    // push a null value onto the page and take note of the current index in the
    // page array, because we're going to come back and place the highlighed code
    // into the page array when we've formatted them as HTML.
    for line in lines
    for (i = 0, I = lines.length; i < I; i++) {
      if (snippet) {
        if (/^```/.test(line)) {
          snippets[language].push(snippet.join("\n"));
          snippet = null;
          source = false;
        } else {
          snippet.push(line);k
        }
      } else if (match = /^```(\w+)?/.exec(line)) {
        language = match[1] || "text";

        page.push({ docco: showdown.makeHtml(markdown.join("\n")), source: "" });
        markdown.length = 0;

        snippets[language] || (snippets[language] = []);
        indexes[language] || (indexes[language] = []);
        indexes[language].push(page.length);

        page.push(null);

        snippet = [];
      } else {
        markdown.push(line);
      }
    }

    // Push any remaning markdown onto the page.
    if (markdown.length) {
      page.push({ docco: showdown.makeHtml(markdown.join("\n")), source: "" });
    }

    // For each language and its array of snippets, format the snippets.
    for (language in snippets) {
      sources = snippets[language];
      // We have no language specified, escape the source and expose it is as
      // pre-formatted text.
      if (language == "text") {
        snippets[language] = for source, i in sources
          source = source.replace /[&<>]/g, (ch) ->
            { "&": "&amp;"
            , "<": "&lt;"
            , ">": "&gt;"
            }[ch]
          "<pre>//{source}</pre>"
      // Otherwise, use Pygments.
      } else {
        // If the application developer has defined a language in her `Cakefile`,
        // we can do a mass highlight, combining all the code with a divider,
        // then spliting the results. If not, we hightlight the snippets one at
        // time.
        if (lexers[language]) {
          sources = _highlight(lexers[language], sources, CALLBACKY);
        } else {
          sources = for source, i in sources
            _highlight({ lexer: language, divider: "" }, [ source ], CALLBACKY).pop()
        }
        snippets[language] = for source in sources
          '<div class="highlight"><pre>' + source + '</pre></div>'
        }
      }
    }
    // Replace the sources with our formatted sources.
    for (language in snippets) {
      sources = snippets[language];
      for (i = 0, I = sources.length; i < I; i++) {
        page[indexes[language][i]] = { docco: sources[i] }
      }
    }
    // Return the page.
    return page;
  }

  // Format a source file converting it into an HTML page. 
  function docco (language, source, CALLBACKY) {
    lines = source.split(/\n/);
    // In the case of a markdown file, the lines are the docco.
    if (language == "markdown") {
      page = @_markdown(lines, CALLBACKY)
    // Otherwise, we extract docco from a source file. We create maps that
    // assocate chunk of docco with lines of code.
    } else {
      page = [{ docco: [] }];
      language = lexers[language];
      if (typeof language.docco == "function") {
        for (i = 0, I = lines.length; i < I; i++) {
          line = lines[i];
          if (match = language.docco.exec(line)) {
            page.unshift { docco: [] } if page[0].source
            page[0].docco.push match[1]
          } else {
            page[0].source = [] unless page[0].source
            page[0].source.push line
          }
        }
      } else {
        for (i = 0, I = lines.length; i < I; i++) {
          line = lines[i];
          if (docco) {
            if (language.docco.end) {
              if (match = language.docco.end.exec(line)) {
                if (match[1].trim()) {
                  page[0].docco.push match[1].replace language.docco.strip, ""
                }
                docco = false
              } else {
                page[0].docco.push line.replace language.docco.strip, ""
              }
            } else if (match = language.docco.start.exec(line)) {
              page[0].docco.push match[1]
            } else {
              docco = false
              page[0].source = [] unless page[0].source
              page[0].source.push line
            }
          } else if (match = language.docco.start.exec(line)) {
            docco = true
            if (page[0].source) page.unshift({ docco: [] });
            comment = match[1]
            if (language.docco.end && (match = language.docco.end.exec(comment))) {
              comment = match[1]
              docco = false
            }
            page[0].docco.push comment
          } else {
            page[0].source = [] unless page[0].source
            page[0].source.push line
          }
        }
      }
      page.reverse();
      // Format the markdown.
      for (i = 0, I = page.length; i < I; i++) {
        if (page[i].docco) {
          page[i].docco = showdown.makeHtml(page[i].docco.join("\n"));
        }
      }
      // If we are program source, format the source code. We clump it together so
      // we only have to run pygmentize once, and so that pygmentize has all the
      // context it needs to color the code.
      if (language.lexer) {
        sources = []
        for section in page
          sources.push section.source.join("\n") or ""
        for source, i in _highlight language, sources, CALLBACKY;
          page[i].source = source
      }
    }
    return page
  }
}

module.exports.create = -> new Edify
