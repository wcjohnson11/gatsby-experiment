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
    }
`