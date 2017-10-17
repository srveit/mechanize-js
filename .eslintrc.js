module.exports = {
  "plugins": ["jasmine"],
  "env": {
    "browser": true,
    "commonjs": true,
    "node": true,
    "jasmine": true
  },
  "extends": ["eslint:recommended", "plugin:jasmine/recommended"],
  "rules": {
    "indent": [
      "error",
      4
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ]
  },
  "globals": {
    "fixture": false,
    "context": false,
    "asyncSpecDone": false,
    "asyncSpecWait": false
  }
}