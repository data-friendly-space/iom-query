module.exports = {
    'extends': [
        'airbnb/base',
    ],
    'env': {
        'node': true,
    },
    'plugins': [],
    'rules': {
        'strict': 0,
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'no-unused-vars': [1, { 'vars': 'all', 'args': 'after-used', 'ignoreRestSiblings': false }],
        'no-console': 0,

        'import/extensions': ['off', 'never'],
        'import/no-extraneous-dependencies': ['error', {'devDependencies': true }],

        'prefer-destructuring': 'warn',
        'function-paren-newline': ['warn', 'consistent'],
        'object-curly-newline': [2, {
            'ObjectExpression': { 'consistent': true },
            'ObjectPattern': { 'consistent': true },
            'ImportDeclaration': { 'consistent': true },
            'ExportDeclaration': { 'consistent': true },
        }],
    },
};

