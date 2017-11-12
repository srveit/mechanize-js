module.exports = {
  "plugins": ["jasmine"],
  "env": {
    "es6": true,
    "commonjs": true,
    "node": true,
    "jasmine": true
  },
  "extends": ["eslint:recommended", "plugin:jasmine/recommended"],
  "rules": {
    "indent": [
      "error",
      2,
      {
        VariableDeclarator: 1
      }
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
