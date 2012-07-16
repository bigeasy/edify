#!/usr/bin/env node

require('proof')(1, function (async) {
  
  var fs = require('fs'), edify = require("../..").create();

  edify.language({
    lexer: 'coffeescript'
  , docco: '#'
  , ignore: [ /^#!/, /^#\s+vim/ ]
  });
  
  async(function () {
    fs.readFile(__dirname + '/fixtures/hello.coffee', 'utf8', async());
  }, function (source) {
    edify.docco('coffeescript', source, async());
  }, function (page) {
    fs.readFile(__dirname + '/fixtures/hello.json', 'utf8', async());
  }, function (expected, page, deepEqual) {
    deepEqual(page, JSON.parse(expected), 'parsed');
  });
});
