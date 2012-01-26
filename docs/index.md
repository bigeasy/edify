# Edify

You configure Edify in the `gh-pages` branch of you git repository. Create a git
submodule to the **public** git repository. The GitHub pages engine will not be
able to checkout a private module.

Alternatively, you can publish an Edify web site using `rsync` to a server that
you manage.

- `Edify.tasks(task)`
- `task` - the task object in the CoffeeScript file.
