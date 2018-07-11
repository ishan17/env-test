const path = require('path')
const webpack = require('webpack')
// 压缩css
const optimizeCss = require('optimize-css-assets-webpack-plugin')
// const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin')
// const extractTextPlugin = require ('extract-text-webpack-plugin')
// webpack@4+ css提取插件
const miniCssExtractPlugin = require("mini-css-extract-plugin");
// 引入模板插件
const htmlWebpackPlugin = require("html-webpack-plugin")

let htmlPlugins = []
let entrys = {}

const pages = [{
    title: '首页',
    favicon: '',
    page: 'index'
},{
    title: '详情',
    favicon: '',
    page: 'detail'
}]

// dist的目录结构 *.html、css、js、images   
// 把所有生成html放在view目录下，如何更改link、script引入文件路径？？？
pages.forEach((item) => {
    const htmlPlugin = new htmlWebpackPlugin({
        filename: `${item.page}.html`, // 输出到dist目录的文件名
        template: path.resolve(__dirname, `../src/view/${item.page}.html`), // 源文件src中的文件路径
        title: `${item.title}`,
        chunks: [`${item.page}`],
        minify: {
            // "removeAttributeQuotes": true,
            "removeComments": true,
            "removeEmptyAttributes": true
        }
    })
    htmlPlugins.push(htmlPlugin)
    entrys[item.page] = path.resolve(__dirname, `../src/js/${item.page}.js`)
})

module.exports = {
    mode: 'development', // production---js会被压缩
    // entry: {
    //     index: path.resolve(__dirname, '../src/js/index'),
    //     detail: path.resolve(__dirname, 'src/pages/detail/detail')
    // },
    entry: entrys,
    output: {
        // 配置输出文件的名称----热更新(HMR)不能和[chunkhash]同时使用  线上用chunkhash
        filename: 'js/[name]_[hash:8].bundle.js',
        // 配置无入口的Chunk在输出时的文件名称,会在运行时生成Chunk的常见场景包括:
        // 使用CommonChunkPlugin、使用import('path/to/module')动态加载等
        // chunkFilename: '[id]_[nam e].js',
        // 配置输出文件存放在本地的目录--绝对路径
        path: path.resolve(__dirname,'../dist'),
        // 配置发布到线上资源的URL前缀,为string类型。默认值是空字符串'',即使用相对路径
        publicPath: ''
    },
    module: {
        rules: [
            // {
            //     test: /\.html$/,
            //     use: [{
            //         loader: 'html-loader',
            //         options: {
            //             attrs: ['img:src', 'link:href'],
            //             interpolate: true
            //         }
            //     }]
            // },
            {
                test: /\.js$/,
                //用babel -loader 转换JavaScript 文件
                // ?cacheDirectory 表示传给babel-loader的参数,用于缓存babel的编译结果,加快重新编译的速度
                // use: ['babel-loader?cacheDirectory=true']
                use: [{
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true
                    },
                    // enforce:'post'的含义是将该Loader的执行顺序放到最后
                    // enforce的值还可以是pre,代表将Loader的执行顺序放到最前面
                    // enforce: 'post'
                }],
                // 只命中src目录里的JavaScript文件,加快Webpack的搜索速度
                include: path.resolve(__dirname ,'src')
            },
            // {
            //     test: /\.css$/,
            //     exclude: path.resolve(__dirname, 'node_modules'),
            //     use: [
            //         'style-loader',
            //         'css-loader'
            //     ]
            // },
            {
                test: /\.scss$/,
                // 使用一组Loader去处理scss文件
                // 处理顺序为从后到前,即先交给sass-loader处理,再将结果交给css-loader,最后交给style-loader
                // use: ['style-loader', 'css-loader', 'sass-loader'],
                // loaders: extractTextPlugin.extract({
                //     use: ['css-loader', 'sass-loader']
                // }),
                use: [miniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
                exclude: path.resolve(__dirname, 'node_modules'),
            },{
                test: /\.(gif|png|jpe?g|eot|woff|ttf|svg|pdf)$/,
                use: ['file-loader']
            }
        ],
        // noParse配置项可以让Webpack忽略对部分没采用模块化的文件的递归解析和处理,这样做的好处是能提高构建性能
        // 使用正则表达式
        // noParse: /jquery|chartjs/
        // 使用函数
        noParse: (content) => {
            // content 代表一个模块的文件路径
            // 返回true 或false
            return /jquery|chartjs/.test(content);
        }
    },
    resolve: {
        alias: {
            '@': './src'
        },
        // 有一些第三方模块会针对不同的环境提供几份代码,webpack会根据package.json中相关字段查找
        // 优先采用ES6
        mainFields: ['jsnext:main','browser','main'],
        // 在导入语句没带文件后缀时,Webpack 会自动带上后缀后去尝试访问文件是否存在
        extensions: ['.js'],
        // resolve.modules配置Webpack去哪些目录下寻找第三方模块,默认只会去node_modules目录下寻找
        modules: ['node_modules'],
        // resolve.descriptionFiles配置描述第三方模块的文件名称,也就是package.json文件 默认如下
        descriptionFiles: ['package.json'],
        // 如果resolve.enforceExtension被配置为true,则所有导入语句都必须带文件后缀
        enforceExtension: false,
        // enforceModuleExtension和enforceExtens的作用类似,但enforceModuleExtension只对node_modules下的模块生效
        // enforceModuleExtension通常搭配enforceExtension使用,在enforceExtension:true时,因为安装的第三方模块中大
        // 多数导入语句都没带文件的后缀,所以这时通过配置enforceModuleExtension:false来兼容第三方模块
        enforceModuleExtension: false
    },
    devServer: {
        hot: true,
        inline: true,
        host: 'localhost',
        // open: true,
    },
    // 只有在开启监昕模式时,watchOptions才有意义
    // 默认为false,也就是不开启
    watch: true,
    watchOptions: {
        // 忽略监听文件夹
        ignored: /node modules/,
        // 监听到变化后会等300ms再去执行动作,防止文件更新太快导致重新编译频率太高
        aggregateTimeout: 300,
        // 判断文件是否发生变化是通过不停地询问系统指定文件有没有变化实现的 默认每秒次
        poll: 1000
    },
    devtool: 'cheap-module-source-map',
    // Externals用来告诉在Webpack,要构建的代码中使用了哪些不用被打包的模块,也就是说这些模板是外部环境提供的例如jquery
    externals: {
        // 将导入语句里的jquery替换成运行环境里的全局变量jQuery
        'jquery': 'jQuery'
    },
    optimization: {
        // minimize: true,
        minimizer: [new optimizeCss({})]
    },
    plugins: [
        // ----热更新(HMR)不能和[chunkhash]同时使用
        new webpack.HotModuleReplacementPlugin(),
        // 从.js中提取的css文件
        // new extractTextPlugin({
        //     filename: `css/[name]_[hash:8].css`
        // }),
        new miniCssExtractPlugin({
            filename: `css/[name]_[hash:8].css`
        }),
        new optimizeCss({
            assetNameRegExp: /\.css$/g,
            cssProcessor: require('cssnano'),
            cssProcessorOptions: {
                discardComments: { 
                    removeAll: true 
                } 
            },
            canPrint: true
        }),
        // 所有页面都会用到的公共代码被提取到common代码块中
        // new CommonsChunkPlugin({
        //     name: 'common',
        //     chunks: ['index', 'detail']
        // }),
        ...htmlPlugins,
    ]
}