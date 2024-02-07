import path from 'path'
import { Configuration, WebpackPluginInstance } from 'webpack'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { StatsWriterPlugin } from "webpack-stats-plugin"
import MiniCssExtractPlugin from "mini-css-extract-plugin"

import jsRule from './rules/jsRule'
import cssRule from './rules/cssRule'
import urlRule from './rules/urlRule'

export interface WebpackPaths {
    root: string
    src: string
    build: string
}

const createWebpackPaths = (root: string): WebpackPaths => {
    return {
        root,
        src: path.resolve(root, 'src', 'browser', 'main.tsx'),
        build: path.resolve(root, 'dist'),
    }
}

const PATH_ROOT = path.resolve(__dirname, "..", "..")

const createWebpackConfig = (): Configuration => {
    const paths = createWebpackPaths(PATH_ROOT)

    return {
        target: "web",
        entry: paths.src,
        mode: "production",
        optimization: {
            runtimeChunk: "single",
            splitChunks: {
                cacheGroups: {
                    // TODO: Customize code splitting to your needs
                    vendor: {
                        name: "vendor",
                        test: /[\\/]node_modules[\\/]/,
                        chunks: "all",
                    },
                    components: {
                        name: "components",
                        test: /[\\/]src[\\/]components[\\/]/,
                        chunks: "all",
                        minSize: 0,
                    },
                    pages: {
                        name: "pages",
                        test: /[\\/]src[\\/]pages[\\/]/,
                        chunks: "all",
                        minSize: 0,
                    },
                },
            },
        },
        devtool: "nosources-source-map",
        performance: {
            // Turn off size warnings for entry points
            hints: false,
        },
        module: {
            rules: [
                jsRule,
                cssRule,
                urlRule,
            ],
        },
        plugins: [
            /**
             * Add assets to dist
             */
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.join(paths.root, 'assets'),
                        to: path.join(paths.root, 'dist', 'assets'),
                    },
                ],
            }),

            /**
             * Extract CSS
             */
            new MiniCssExtractPlugin({
                filename: "[name].[contenthash:8].css",
            }),

            /**
             * Create Stats
             */
            new StatsWriterPlugin({
                filename: "stats.json",
                transform(data, _opts) {
                    const assets = data.assetsByChunkName as Record<string, Array<string>>;
                    const stats = JSON.stringify(
                        {
                            scripts: Object.entries(assets).flatMap(([_asset, files]) => {
                                return files.filter((filename) => filename.endsWith(".js") && !/\.hot-update\./.test(filename));
                            }),
                            styles: Object.entries(assets).flatMap(([_asset, files]) => {
                                return files.filter((filename) => filename.endsWith(".css") && !/\.hot-update\./.test(filename));
                            }),
                        },
                        null,
                        2,
                    );
                    return stats;
                },
            }) as unknown as WebpackPluginInstance,
        ],
        resolve: {
            plugins: [
            ],
            extensions: ['.tsx', '.ts', '.js', 'jsx'],
        },
        output: {
            crossOriginLoading: "anonymous",
            path: paths.build,
            filename: "[name].[contenthash:8].js",
            sourceMapFilename: "[file].map",
            chunkFilename: 'chunk.[name].[contenthash].js',
        },
    }
}

export default createWebpackConfig
