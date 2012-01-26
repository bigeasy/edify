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
