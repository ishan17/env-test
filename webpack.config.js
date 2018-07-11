// module.exports = function(env, argv) {
//     return {
//         mode: env.production ? 'production' : 'development',
//         devtool: env.production ? 'source-maps' : 'eval',
//         plugins: [
//             new webpack.optimize.UglifyJsPlugin({
//                 compress: argv['optimize-minimize']
//             })
//         ]
//     }
// }