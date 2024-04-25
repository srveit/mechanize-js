# mechanize

[![NPM Version][npm-badge]][npm-url]
[![NPM Downloads][downloads-badge]][downloads-url]
[![MIT License][license-badge]][license-url]
[![Node.js Version][node-version-badge]][node-version-url]
[![GitHub Build Status][github-build-badge]][github-build-url]
[![Codecov Status][codecov-badge]][codecov-url]
[![Code Climate][code-climate-badge]][code-climate-url]
[![Gitter][gitter-badge]][gitter-url]
[![Known Vulnerabilities][snyk-badge]][snyk-url]

<!-- [![js-canonical-style][canonical-badge]][canonical-url] -->

The Mechanize module is used for automating interaction with websites.
Mechanize automatically stores and sends cookies, follows redirects,
can follow links, and submit forms. Form fields can be populated and
submitted. Mechanize also keeps track of the sites that you have
visited as a history.

## Getting Started

From the root folder, you can run the _get_page_ example:

`node examples/get_page.js`

To load from a specific URL:

`node examples/get_page.js "http://www.cnn.com"`

The example gets the page and then performs a `console.log()` on all
of the returned object data.

### Posting a form

For form posting, you can run the _submit_form_ example:

`node examples/submit_form.js "http://localhost/"`

The example POSTs a username and password to the _/login_ path at the
specificied URL.

### Chaining page accesses

For an example of chaining requests, you can run the _submit_form_chain_ example:

`node examples/submit_form_chain.js`

## Installation

From the mechanize directory, run npm install:

`npm install`

## Dependencies

    jsdom >= 19.0.0
    mime >= 3.0.0
    node-fetch >= 2.6.7
    tough-cookie >= 4.0.0
    unescape >= 1.0.1
    windows-1252 >= 1.1.0

## Documentation

[mechanize-js](https://github.com/srveit/mechanize-js)

## Credits

This borrows heavily from Aaron Patterson's
[mechanize](https://rubygems.org/gems/mechanize) Ruby gem.

### Contributors

- 佐藤
- Dan Rahmel
- Anders Hjelm

[npm-badge]: https://img.shields.io/npm/v/mechanize.svg
[npm-url]: https://npmjs.org/package/mechanize
[downloads-badge]: https://img.shields.io/npm/dm/mechanize.svg
[downloads-url]: https://npmjs.org/package/mechanize
[node-version-badge]: https://img.shields.io/node/v/mechanize.svg
[node-version-url]: https://nodejs.org/en/download/
[github-build-badge]: https://img.shields.io/github/workflow/status/srveit/mechanize-js/build-actions
[github-build-url]: https://github.com/srveit/mechanize-js/actions/workflows/test-actions.yml
[coveralls-badge]: https://coveralls.io/repos/github/srveit/mechanize-js/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/srveit/mechanize-js?branch=master
[code-climate-badge]: https://img.shields.io/codeclimate/maintainability/srveit/mechanize-js.svg
[code-climate-url]: https://codeclimate.com/github/srveit/mechanize-js
[gitter-badge]: https://img.shields.io/gitter/room/mechanize-js/Lobby.svg
[gitter-url]: https://gitter.im/mechanize-js/Lobby
[bithound-badge]: https://www.bithound.io/github/srveit/mechanize-js/badges/score.svg
[bithound-url]: https://www.bithound.io/github/srveit/mechanize-js
[codecov-badge]: https://img.shields.io/codecov/c/github/srveit/mechanize-js/master.svg?style=flat
[codecov-url]: https://codecov.io/github/srveit/mechanize-js
[license-badge]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: http://choosealicense.com/licenses/mit/
[canonical-badge]: https://img.shields.io/badge/code%20style-canonical-brightgreen.svg?style=flat
[canonical-url]: https://github.com/gajus/eslint-config-canonical
[snyk-badge]: https://snyk.io/test/github/srveit/mechanize-js/badge.svg
[snyk-url]: https://snyk.io/test/github/srveit/mechanize-js

<!--

https://sonarcloud.io/dashboard/index/srveit:mechanize

[testling-badge]: https://ci.testling.com/srveit/mechanize-js.png
[testling-url]: https://ci.testling.com/srveit/mechanize-js
[cdnjs-badge]: https://img.shields.io/cdnjs/v/mechanize-js.svg
[cdnjs-url]: https://cdnjs.com/libraries/mechanize-js

[![locked](http://badges.github.io/stability-badges/dist/locked.svg)](http://github.com/badges/stability-badges)
[![Readme](https://img.shields.io/badge/readme-tested-brightgreen.svg?style=flat)](https://www.npmjs.com/package/reamde)
[![Doug's Gratipay][gratipay-image-dougwilson]][gratipay-url-dougwilson]
[![API documented](https://img.shields.io/badge/API-documented-brightgreen.svg)](https://raszi.github.io/node-tmp/)
[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/thlorenz/convert-source-map/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
[![Bountysource](https://www.bountysource.com/badge/tracker?tracker_id=282608)](https://www.bountysource.com/trackers/282608-eslint?utm_source=282608&utm_medium=shield&utm_campaign=TRACKER_BADGE)
[![Bower version](https://img.shields.io/bower/v/spdx-license-ids.svg)](https://github.com/shinnn/spdx-license-ids/releases)
[![Codeship Status for ashtuchkin/iconv-lite](https://www.codeship.com/projects/81670840-fa72-0131-4520-4a01a6c01acc/status)](https://www.codeship.com/projects/29053)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![ExternalEditor uses the MIT](https://img.shields.io/npm/l/external-editor.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Feslint%2Feslint.svg?type=large)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Feslint%2Feslint?ref=badge_large)
[![Follow on Twitter](https://img.shields.io/twitter/url/http/shields.io.svg?style=social&label=Follow&maxAge=2592000)](https://twitter.com/hiddentao)
[![Known Vulnerabilities](https://snyk.io/test/npm/promise-core/badge.svg?style=flat-square&maxAge=2592000)](https://snyk.io/test/npm/promise-core)
[![NPM Stats](https://nodei.co/npm/iconv-lite.png?downloads=true&downloadRank=true)](https://npmjs.org/packages/iconv-lite/)
[![NPM](https://nodei.co/npm-dl/deep-extend.png?height=3)](https://nodei.co/npm/deep-extend/)
[![OpenCollective](https://opencollective.com/debug/sponsors/badge.svg)](#sponsors)
[![Sauce Test Status](https://saucelabs.com/browser-matrix/epoberezkin.svg)](https://saucelabs.com/u/epoberezkin)
[![Slack Channel](http://zeit-slackin.now.sh/badge.svg)](https://zeit.chat/)
[![Standard Version](https://img.shields.io/badge/release-standard%20version-brightgreen.svg)](https://github.com/conventional-changelog/standard-version)
[![Windows Build](https://img.shields.io/appveyor/ci/alexindigo/asynckit/v0.4.0.svg?label=windows:0.12-6.x&style=flat)](https://ci.appveyor.com/project/alexindigo/asynckit)
[![Windows Tests](https://img.shields.io/appveyor/ci/bcoe/nyc-ilw23/master.svg?label=Windows%20Tests)](https://ci.appveyor.com/project/bcoe/nyc-ilw23)
[![](http://img.shields.io/badge/unicorn-approved-ff69b4.svg)](https://www.youtube.com/watch?v=9auOCbH5Ns4)

-->
