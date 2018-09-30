module.exports = {
    "extends": "standard",
    "parser": "babel-eslint",
    "rules": {
        "indent": ["error", 4],
        "no-unused-vars": ["error", { "vars": "all", "args": "after-used", "ignoreRestSiblings": false  }],
        "no-debugger": "off",
        "argsIgnorePattern": "^_"
    },
    "globals": {
        "fetch": false
    },
    "plugins": [
        "babel"
    ]
}
