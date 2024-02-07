import { RuleSetRule } from 'webpack'
import MiniCssExtractPlugin from "mini-css-extract-plugin"

const sassCss: RuleSetRule = {
    test: /\.s[ac]ss$/i,
    use: [
        MiniCssExtractPlugin.loader,
        {
            loader: 'css-loader',
            options: {
                modules: {
                    localIdentName: '[name]___[local]___[hash:base64:5]',
                    namedExport: true,
                },
                importLoaders: 1,
                url: true,
                import: true,
            },
        },
        {
            loader: 'sass-loader',
        },
    ],
}

/**
 * Imports raw css, helpful when using 3rd party libraries such as prism
 * e.g:
 * import 'prismjs/themes/prism-tomorrow?raw';
 */
const rawCss: RuleSetRule = {
    test: /\.css$/,
    resourceQuery: /^\?raw$/,
    use: [
        MiniCssExtractPlugin.loader,
        // 'style-loader', 
        'css-loader'
    ],
}

const cssRule: RuleSetRule = {
    oneOf: [rawCss, sassCss],
}

const serverSideCss: RuleSetRule = {
    test: /\.(css|scss)$/,
    use: [
        {
            loader: "css-loader",
            options: {
                modules: {
                    exportOnlyLocals: true,
                    localIdentName: '[name]___[local]___[hash:base64:5]',
                    namedExport: true,
                },
                importLoaders: 1,
                url: true,
                import: true,
            }
        },
        {
            loader: 'sass-loader',
        },
    ]
}

export {
    serverSideCss,
    cssRule as default
}
