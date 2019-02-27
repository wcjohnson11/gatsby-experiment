import React from "react";
import { Helmet } from "react-helmet";
import { graphql, StaticQuery } from "gatsby";

// TODO, add canoncial refs for each page
// Grab location from context
// https://www.gatsbyjs.org/docs/add-seo-component/

const SiteMetadata = ({ title, url, description, image }) => (
  <StaticQuery
    query={Metadata}
    render={({
      site: {
        siteMetadata: {
            title,
            url,
            description,
            image,
            social
        },
      },
    }) => (
      <Helmet defaultTitle={title} titleTemplate={`%s | ${title}`}>
        <html lang="en" />
        <link rel="canonical" href={`${url}`} />
        <meta name="docsearch:version" content="2.0" />
        <meta name="description" content={description} />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,shrink-to-fit=no,viewport-fit=cover"
        />

        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en" />
        <meta property="og:site_name" content={title} />
        <meta property="og:image" content={`${url}${image}`} />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta name="twitter:creator" content={social.twitter} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        <meta name="github:creator" content={social.github} />

      </Helmet>
    )}
  />
)

export default SiteMetadata

const Metadata = graphql`
query SiteMetadata {
    site {
      siteMetadata {
        title
        url
        description
        image
        social {
            github
            twitter
        }
      }
    }
  }
`;