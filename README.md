# Edify

Quicky and dirty project documentation in the spirit of
[Docco](://github.com/jashkenas/docco).

## Overview

Edify is a quick and dirty publishing platform for your GitHub:Pages. It is
Docco inspired, but not quite as quick and dirty as Docco.

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

## Requirements

Edify requires **Pygments** to format code blocks. You can install Pygments
using `easy_install Pygments`. I've had a lot of success pulling pygments from
the the [Mercurial repository](http://pygments.org/download/) and installing
using `sudo python setup.py`.

## Change Log

Changes for each release.

### Version 0.0.4

 * Implement Pygments rewriting. #21.
 * Implemnet Markdown rewriting. #20.
 * Implement cache for complicated transforms like Pygments. #19.
 * Change design to rewrite plain HTML. #18.

### Version 0.0.3

Released: Mon Jul 23 11:08:56 UTC 2012

 * Convert to JavaScript. #8. #7.

### Version 0.0.2

Released: Mon May 28 19:21:54 2012 -0400

 * Remove Stencil. #6.
 * Convert Stencil into supporting library. #3.
 * Build on Travis CI.
 t * Created `Makefile`.

### Version 0.0.1

Released:  Wed Apr 25 23:09:19 2012 -0400

 * Markdown documentation with code snippets.
 * Remove GFM from Showdown.
 * Generate an array of objects that model Docco.
