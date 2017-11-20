# mechanize

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![MIT License][license-image]][license-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Build Status][travis-image]][travis-url]
[![AppVeyor Build Status][appveyor-image]][appveyor-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![Codecov Status][codecov-image]][codecov-url]
[![Code Climate][code-climate-image]][code-climate-url]
[![Gitter][gitter-image]][gitter-url]
[![Dependency Status][dependency-image]][dependency-url]
[![bitHound Overall Score][bithound-image]][bithound-url]
<!-- [![js-canonical-style][canonical-image]][canonical-url] -->

The Mechanize module is used for automating interaction with websites.
Mechanize automatically stores and sends cookies, follows redirects,
can follow links, and submit forms. Form fields can be populated and
submitted. Mechanize also keeps track of the sites that you have
visited as a history.

## Getting Started

From the root folder, you can run the *get_page* example:

`node bin/get_page.js`

To load from a specific URL:

`node bin/get_page.js "http://www.cnn.com"`

The example gets the page and then performs a `console.log()` on all of the returned object data.

### Posting a form

For form posting, you can run the *submit_form* example:

`node bin/submit_form.js "http://localhost/"`

The example POSTs a username and password to the */login* path at the specificied URL

### Chaining page accesses

For an example of chaining requests, you can run the *submit_form_chain* example:

`node bin/submit_form_chain.js`

### Logging into Twitter and getting personal notifications

To see an example of chaining to log into Twitter and access the notifications page, run the *twitter_notifications* example:

`node bin/twitter_notifications.js MYTWITTERUSERNAME MYTWITTERPASSWORD`

The example gets the Twitter login page, fills out the username and password fields, logs into Twitter, gets the private notifications page, and displays the returned results.

## Installation

From the mechanize directory, run npm install:

`npm install`

## Dependencies

    cookiejar >= 2.1.1
    libxmljs >= 0.18.7
    mime >= 2.0.3
    request >= 2.83.0

## Credits

This borrows heavily from Aaron Patterson's
[mechanize](http://mechanize.rubyforge.org/) Ruby gem.

### Contributors

* 佐藤
* Dan Rahmel
* Anders Hjelm

[npm-image]: https://img.shields.io/npm/v/mechanize.svg
[npm-url]: https://npmjs.org/package/mechanize
[downloads-image]: https://img.shields.io/npm/dm/mechanize.svg
[downloads-url]: https://npmjs.org/package/mechanize
[node-version-image]: https://img.shields.io/node/v/mechanize.svg
[node-version-url]: https://nodejs.org/en/download/
[travis-image]: https://img.shields.io/travis/srveit/mechanize-js/master.svg
[travis-url]: https://travis-ci.org/srveit/mechanize-js
[appveyor-image]: https://img.shields.io/appveyor/ci/srveit/mechanize-js/master.svg
[appveyor-url]: https://ci.appveyor.com/project/srveit/mechanize-js/branch/master
[coveralls-image]: https://img.shields.io/coveralls/srveit/mechanize-js/master.svg
[coveralls-url]: https://coveralls.io/r/srveit/mechanize-js
[code-climate-image]: https://img.shields.io/codeclimate/maintainability/srveit/mechanize-js.svg
[code-climate-url]: https://codeclimate.com/github/srveit/mechanize-js
[gitter-image]: https://img.shields.io/gitter/room/mechanize-js/Lobby.svg
[gitter-url]: https://gitter.im/mechanize-js/Lobby
[bithound-image]: https://www.bithound.io/github/srveit/mechanize-js/badges/score.svg
[bithound-url]: https://www.bithound.io/github/srveit/mechanize-js
[dependency-image]: https://img.shields.io/david/srveit/mechanize-js.svg
[dependency-url]: https://david-dm.org/srveit/mechanize-js
[codecov-image]: https://img.shields.io/codecov/c/github/babel/babylon/master.svg?style=flat
[codecov-url]: https://codecov.io/gh/babel/babylon
[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: http://choosealicense.com/licenses/mit/
[canonical-image]: https://img.shields.io/badge/code%20style-canonical-brightgreen.svg?style=flat
[canonical-url]: https://github.com/gajus/eslint-config-canonical


<!--
[testling-image]: https://ci.testling.com/srveit/mechanize-js.png
[testling-url]: https://ci.testling.com/srveit/mechanize-js
[cdnjs-image]: https://img.shields.io/cdnjs/v/mechanize-js.svg
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
