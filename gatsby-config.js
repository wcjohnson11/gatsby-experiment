module.exports = {
    siteMetadata: {
        title: 'Gatsby Experiment',
    },
    plugins: [
        {
            resolve: 'gatsby-plugin-typography',
            options: {
                pathToConfigModule: 'src/utils/typography.js',
            },
        },
    ],
}
