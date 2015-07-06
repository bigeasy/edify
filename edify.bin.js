#!/usr/bin/env node

/*

  ___ usage: en_US ___
  usage: edify <options> [path?name=value] [name=value] [name=value]

        --help                  display this message

  ___ strings ___

    path required:
      a path to a script or script directory is required

    path not found:
      cannot locate path: %s

  ___ usage ___

*/

require('arguable')(module, function (options, callback) {
    require('./edify').runner(options, options.stdin, options.stdout, options.stderr, callback)
})
