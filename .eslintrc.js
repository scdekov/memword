module.exports = {
    "extends": "standard",
    "parser": "babel-eslint",
    "rules": {
        "indent": ["error", 4],
        "no-unused-vars": ["error", { "vars": "all", "args": "after-used", "ignoreRestSiblings": false  }],
    },
    "globals": {
        "fetch": false
    },
    "plugins": [
        "babel"
    ]
}
