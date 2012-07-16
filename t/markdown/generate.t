#!/usr/bin/env node

require('proof')(1, function (async) {
  
  var fs = require('fs'), edify = require("../..").create();

  edify.language({
    lexer: 'javascript'
  , docco: '//'
  });

  async(function () {
    fs.readFile(__dirname + '/fixtures/markdown.md', 'utf8', async());
  }, function (source) {
    edify.docco('markdown', source, async());
  }, function (page) {
    fs.readFile(__dirname + '/fixtures/markdown.json', 'utf8', async());
  }, function (expected, page, deepEqual) {
    deepEqual(page, JSON.parse(expected), 'parsed');
  });
});
