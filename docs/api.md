# Edify

You configure Edify in the `gh-pages` branch of you git repository. Create a git
submodule to the **public** git repository. The GitHub pages engine will not be
able to checkout a private module.

Alternatively, you can publish an Edify web site using `rsync` to a server that
you manage.

Edify documentation is supposed to look nice when viewed at GitHub, but it can also
be formatted specially. There is a format that you can use to define the bits and
pieces of your program. It has JavaScript in mind, but you can define your own parsers
for the information.

`class Edify` - Created when you invoke the edify method.

Can we continue in this vein? Would we notice this in the ordinary markdown? How do we
convey that this belongs to the above definition? It just does, because we started one
and this is just text.

```javascript
var i = 0;
```

```coffeescript
i = 0
```

The notion is that this is still legible on GitHub in GitHub markdown.

`Edify.tasks(task)` - Create Edify tasks.  
`task` - the task object in the CoffeeScript file.  
`options` - Example of an options list. We could go on about the options list and
that would be fine by us. We could wrap and blather and blergle.  
 * `size` -- The default size of the thing.  
 * `color` -- The color of the thing.  
`callback` - Call me back Monty.

Creates the Eidfy specific tasks in the coffee script file. These are visible
using use namespace `"edify"`.

We could create a C flavor. It would look like this.

`int min(int a, int b)` - Choose a minimum value.  
`a` - One of two values from which to choose.  
`b` - One of two values from which to choose.  
`@` - The lesser of the two values.  

We can even go all out with madness like C++

`class Container<Storage, Key, Value>` - Contains things and you pass type parameters, oh my.  
`Storage` - The storage engine.  
`Key` - The key store.  
`Value` - The value type.  