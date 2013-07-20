# Design Diary

I'm only going to make notes here, and not explore syntax, since I'll be
exploring syntax as I develop web sites using Edify. 

Currently, I'm looking to put properties in yaml like so...

```yaml
function: read(buffer[, offset][, length])
arguments: 
  buffer: The buffer.
  offset: The optional offset or else `0`.
  length: The optional length or else `buffer.length`.
```

This allows the user go do what ever they need to do with the properties. They
can get properties as strings, convert them using the markdown parser, or even a
special parser, like maybe a parser that highlights that function declaration.

Used from Stencil, you would call specific bits and pieces by specifying anchors
and offsets, like `document.section('installation', 'getting-help')`.

Then you could break it up further.

```
section.blocks(0, 3)
section.yaml(0).markdown('arguments').buffer
```

And we can use inquiry to fetch specific bits and pieces from both yaml and
markdown.

## HTML

I'm considering using Inquiry to create a path language to for an HTML tree that
would be the output of `htmlpaser2`. This would allow you to select ranges, or
to order or chunk the documentation into bits and pieces.

## Pygments

It would be nice to have intermediate files for pygments, to cache the output
and to only regenerate it if the output changes. Slower than the strategy, but
probably much simpiler. It would be a restart.

What does `htmlparser2` output look like?

## How To Procede

Hard to say which project matters most. Packet would let you see how well you
work when you can write your documentation as you write your code. (Locket is
already API documented.) Strata is important because people are paying attention
to it. Stencil itself needs to evolve.

However, there is nothing to document here, yet. Thus, if you do want to do
something meaningful, start with *any* other project.

## Clearing Cache

The cache is going to get dirty and full. It's keyed on code, so it doesn't
replace itself, so eventually you're going to have a great big bundle of stuff
you cannot use. How do you purge the cache? Remove entries that are very old?
Time stamp each entry? Yes, because that's what a cache is, isn't it?
