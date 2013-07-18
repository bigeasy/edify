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
