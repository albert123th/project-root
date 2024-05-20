const path = require('path');

module.exports = {
    mode: 'development', // or 'production' or 'none'
    entry: './public/index.html', // Entry point of your application (assuming you have a separate JavaScript file)
    output: {
        path: path.resolve(__dirname, 'dist'), // Output directory
        filename: 'bundle.js' // Output bundle filename
    },
    module: {
        rules: [
            {
                test: /\.js$/, // Apply this rule to files ending in .js
                exclude: /node_modules/, // Exclude the node_modules directory
                use: {
                    loader: 'babel-loader', // Use Babel loader for transpiling ES6+
                    options: {
                        presets: ['@babel/preset-env'] // Babel presets
                    }
                }
            },
            {
                test: /\.html$/, // Apply this rule to files ending in .html
                use: {
                    loader: 'html-loader' // Use html-loader to process HTML files
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js'] // Resolve .js extensions when importing modules
    },
    devtool: 'source-map' // Generate source maps for debugging
};
