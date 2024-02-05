import * as path from 'path'
import { Configuration } from 'webpack'

export interface WebpackPaths {
    root: string
    src: string
    build: string
}

const createWebpackPaths = (root: string): WebpackPaths => {
    return {
        root,
        src: path.resolve(root, 'src', 'index'),
        build: path.resolve(root, 'dist'),
    }
}

const PATH_ROOT = path.resolve(__dirname)

const createWebpackConfig = (): Configuration => {
    const paths = createWebpackPaths(PATH_ROOT)

    return {
        target: "node",
        entry: paths.src,
        mode: "production",
        optimization: {
            minimize: false, // We don't need to minimize our Lambda code.
            moduleIds: "named",
        },
        performance: {
            // Turn off size warnings for entry points
            hints: false,
        },
        devtool: "nosources-source-map",
        module: {
            rules: [
                {
                    test: /\.(ts|js)x?$/,
                    exclude: /node_modules/, // we shouldn't need processing `node_modules`
                    use: "babel-loader",
                },
                {
                    test: /\.css$/,
                    use: "null-loader", // No server-side CSS processing
                },
                {
                    test: /\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$/,
                    use: "url-loader",
                },
            ],
        },
        resolve: {
            plugins: [],
            extensions: ['.tsx', '.ts', '.js', 'jsx'],
        },
        output: {
            libraryTarget: "commonjs2",
            path: paths.build,
            filename: "index.js",
            sourceMapFilename: "[file].map",
            chunkFilename: 'chunk.[name].[contenthash].js',
        },
    }
}

export default createWebpackConfig
