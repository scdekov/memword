module.exports = {
    "extends": [
        "standard",
        "plugin:react/recommended"
    ],
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        }
    },
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
        "babel",
        "react"
    ]
}
