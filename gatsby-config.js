module.exports = {
    siteMetadata: {
        title: 'William Johnson',
        url: 'https://wcj.io',
        description: 'Analytics, Art, Data, Engineering',
        image: "/src/assets/favicon.ico",
        social: {
            twitter: "@wcj111",
            github: "wcjohnson11"
        }
    },
    plugins: [
        'gatsby-transformer-remark',
        'gatsby-plugin-react-helmet',
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
