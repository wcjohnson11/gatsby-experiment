module.exports = {
    siteMetadata: {
        title: 'wcj.io',
    },
    plugins: [
        'gatsby-transformer-remark',
        {
            resolve: 'gatsby-plugin-typography',
            options: {
                pathToConfigModule: 'src/utils/typography.js',
            },
        },
        {
            resolve: 'gatsby-source-filesystem',
            options: {
                name: 'src',
                path: `${__dirname}/src/`
            },
        },
    ],
}
