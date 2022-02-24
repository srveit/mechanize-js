# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Changed fixture to return a promise
- Updated Npm module eslint-config-prettier to 8.4.0
- Updated spec/helpers/fixture.js to use fs/promises
- Updated lib/mechanize/agent.js to use fs/promises
- Updated .github/workflows/test-actions.yml to run on Node 14, 16, and 17
- Updated Npm module eslint to 8.9.0
- Updated Npm module eslint-plugin-promise to 6.0.0
- Updated spec/form.test.js to not fix fixture EOLs since added .gitattributes
- Updated lint script to run lint-markdown

### Added

- File .gitattributes
- File .markdownlint.json
- Npm module jest-extended
- Npm module jest-spec-reporter
- Npm module markdownlint-cli2
- Npm module standard

### Removed

- Npm module codecov
- Npm module eslint-config-standard
- File appveyor.yml
- File .travis.yml

## [1.2.1] - 2022-02-21

### Changed

- Fixed GitHub build badge URL in README.md
- Updated documentation

## [1.2.0] - 2022-02-21

### Added

- File CHANGELOG.md
- File lib/mechanize/utils.js
- Npm module jest

### Changed

- Renamed LICENSE.txt to LICENSE
- Replaced request with node-fetch
- Replaced cookiejar with tough-cookie
- Replaced libxmljs with jsdom
- Renamed spec files

### Removed

- File examples/twitter_notifications.js
- File spec/support/jasmine.json
- Npm module jasmine
- Npm module jsonlint
- Npm module lodash
- Npm module mime-types
- Npm module moment
- Npm module npm-run
- Npm module nyc
- Npm module nyc

## [1.1.0] - 2020-04-26

### Added

- Initial code

## [1.0.3] - 2019-12-30 from 188c4b

### Added

- allFields property to form

### Changed

- Fixed bug with undefined options.encoding
- Updated dependencies

## [1.0.2] - 2017-06-20

### Changed

- Update Coveralls badge in README.md
- Updated dependencies

## [1.0.1] - 2017-06-20

### Added

- appveyor
- greenkeeper

### Changed

- Updated dependencies

## [1.0.0] - 2018-09-30

### Added

- File image.js
- Handling of page encodings

### Changed

- Updated README.md
- Fixed tests
- Updated dependencies
- Fixed cookies

## [0.4.0] - 2017-11-12

### Added

- Contributers to package.json and README.md
- License to package.json
- Support for Node.js 6

### Changed

- Updated tests
- Updated classes
- Updated form
- Fixed lint errors
- Updated dependencies
- Switch to use eslint

### Removed

- File yarn.lock

## [0.3.0] - 2013-05-27

### Changed

- Upgraded to Node.js 8

## [0.2.0] - 2013-05-27

### Changed

- Upgraded to Node.js 0.10
- Fix lint errors

## [0.1.0] - 2012-01-14

### Changed

- Updated dependencies

## [0.0.7] - 2011-11-18

### Changed

- Upgraded nodelint to version 0.5.2
- Fixed lint errors

## [0.0.6] - 2011-09-13

### Changed

- Updated format of package.json

## [0.0.5] - 2011-09-13

### Changed

- Updated dependencies

## [0.0.4] - 2011-09-13

### Added

- cookieJar to agent

## [0.0.3] - 2011-08-11

### Added

- test/run.sh

## [0.0.2] - 2011-07-24

### Added

- Initial code

[Unreleased]: https://github.com/srveit/mechanize-js/compare/v1.2.1...HEAD

[1.2.1]: https://github.com/srveit/mechanize-js/compare/v1.2.0...v1.2.1

[1.2.0]: https://github.com/srveit/mechanize-js/compare/v1.1.0...v1.2.0

[1.1.0]: https://github.com/srveit/mechanize-js/compare/v1.0.3...v1.1.0

[1.0.3]: https://github.com/srveit/mechanize-js/compare/v1.0.2...v1.0.3

[1.0.2]: https://github.com/srveit/mechanize-js/compare/v1.0.1...v1.0.2

[1.0.1]: https://github.com/srveit/mechanize-js/compare/v0.4.0...v1.0.1

[0.4.0]: https://github.com/srveit/mechanize-js/compare/v0.3.0...v0.4.0

[0.3.0]: https://github.com/srveit/mechanize-js/compare/v0.2.0...v0.3.0

[0.2.0]: https://github.com/srveit/mechanize-js/compare/v0.1.0...v0.4.0

[0.1.0]: https://github.com/srveit/mechanize-js/compare/v0.0.7...v0.1.0

[0.0.7]: https://github.com/srveit/mechanize-js/compare/v0.0.6...v0.0.7

[0.0.6]: https://github.com/srveit/mechanize-js/compare/v0.0.5...v0.0.6

[0.0.5]: https://github.com/srveit/mechanize-js/compare/v0.0.4...v0.0.5

[0.0.4]: https://github.com/srveit/mechanize-js/compare/v0.0.3...v0.0.4

[0.0.3]: https://github.com/srveit/mechanize-js/compare/v0.0.2...v0.0.3

[0.0.2]: https://github.com/srveit/mechanize-js/releases/tag/v0.0.2
