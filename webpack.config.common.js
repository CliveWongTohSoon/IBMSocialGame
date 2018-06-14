const path = require('path');

module.exports = {
    entry: {
        'app': './assets/app/main.ts'
    },

    resolve: {
        extensions: ['.js', '.ts']
    },

    module: {
        loaders: [
            {
                test: /\.(png|jpg|ttf|eot)$/,
                exclude: /node_modules/,
                include: path.join(__dirname, 'src'),
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]'
                }
            }
        ],
        rules: [
            {
                test: /\.html$/,
                use: [{ loader: 'html-loader' }]
            },
            {
                test: /\.css$/,
                use: [{ loader: 'raw-loader' }]
            }
        ],
        exprContextCritical: false
    }
};