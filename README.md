# Edify

Template driven GitHub documentation publishing.

Edify is a quick and dirty publishing platform for your gh-pages. It is Docco
inspired, but not quite as quick and dirty as Docco. Docco.

This works. This does not always work. Does it work if I wait a beat to serve
it? Now this doesn't work. It just wants to work.

Why won't this work? Guess it needs a beat. Waiting that half a second does it.
I don't like the aribtrary wait. Can I detect a real change?

Okay. Mark as dirty. There ought to be enough time between the write and the
reload to trigger a rebuild. That did it. No more problems! Yeah! So now I have
to style these. Let's try to style the Docco.

Added timeout. Hello?

 * <a href="/edify/src/lib/edify_.html">edify\_.html</a>

## Concerns and Decisions

 * Wondering if I want to implement globs.
 * Probably want to feed a file name to a template so that the file name is
   relative to the root of the project, or the directory where it was told to
   search.
 * Patterns should match relative to the project root.
 * Name collisions are a problem in C. A `.h` file and a `.c` file may share the
   same names.
 * Base is annoying. We probably base off of a project subdirectory most of the
   time as in `/edify`, but this is going to be goofy when people view Markdown
   files in GitHub, they will be relative to GitHub. I'd like to be able to have
   those rewritten when served locally, stripping the prefix so it will navigate
   correctly.

Using Cakefile as the interface to Edify. Got this idea from my own batch of
Cakefile utilities, Twinkie. The problem with Twinkie is that we want people to
check out and build immediately, so it must be written in pure CoffeeScript,
because too many build dependencies are going to frustrate adoption.  Generating
an entire web site, that requires something.  People already use a command line
application do this, they are expecting it.  We'll require that you run npm,
which they expect, but then run cake. All the configuration goes into the
Cakefile.
