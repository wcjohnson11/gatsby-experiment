import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"

export default ({ data }) => {
    console.log(data)
    return (
        <Layout>
            <div>
                <h1>My site's files</h1>
                <table>
                    <thead>
                        <tr>
                            <th>absolutePath</th>
                            <th>relativePath</th>
                            <th>prettySize</th>
                            <th>extension</th>
                            <th>birthTime</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.allFile.edges.map(({ node }, index) => (
                            <tr key={index}>
                                <td>{node.absolutePath}</td>
                                <td>{node.relativePath}</td>
                                <td>{node.prettySize}</td>
                                <td>{node.extension}</td>
                                <td>{node.birthTime}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <h1>My site's posts</h1>
                <h4>{data.allMarkdownRemark.totalCount} Posts</h4>
                {data.allMarkdownRemark.edges.map(({node}) => (
                    <div key={node.id}>
                        <h3>{node.frontmatter.title}{" "}</h3>
                        <span> - {node.frontmatter.date}</span>
                        <p>{node.excerpt}</p>
                    </div>
                ))}
            </div>
        </Layout>
    )
}

export const query = graphql`
    query {
        allFile {
            edges {
                node {
                    relativePath
                    absolutePath
                    prettySize
                    extension
                    birthTime(fromNow: true)
                }
            }
        }
        allMarkdownRemark {
            totalCount
            edges {
                node {
                    id
                    frontmatter {
                        title
                        date(formatString: "DD MMMM, YYYY")
                    }
                    excerpt
                }
            }
        }
    }
`