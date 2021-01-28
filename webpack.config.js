const path = require('path');
const nodeExternals = require('webpack-node-externals');

const clientConfig = {
    mode: 'development',
    entry: './src/client.ts',
    output: {
        path: path.join(__dirname, 'public'),
        filename: 'bundle.js'
    },
    module: {
        rules: [{
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        }]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
};

const serverConfig = {
    mode: 'development',
    entry: './server.ts',
    target: 'node',
    node: {
        __dirname: false,
        __filename: false,
    },
    externals: [nodeExternals()],
    module: {
        rules: [{
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        }]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
}

module.exports = [clientConfig, serverConfig];