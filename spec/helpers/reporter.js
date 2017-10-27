'use strict';
const util = require('util'),
  options = {
    timer: new jasmine.Timer(),
    print: function() {
      process.stdout.write(util.format.apply(this, arguments));
    },
    showColors: true,
    jasmineCorePath: jasmine.jasmineCorePath
  },
  {SpecReporter} = require('jasmine-spec-reporter'),
  specReporter = new SpecReporter(options);

// jasmine.getEnv().clearReporters();              // remove default reporter logs
// jasmine.getEnv().addReporter(specReporter);
