/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/gatsby-config/
 */

module.exports = {
  siteMetadata: {
    title: 'Spotify Music Viewer',
    author: 'Andrew Rodebaugh',
  },
  pathPrefix: "/spotify-music-viewer",
  plugins: ['gatsby-plugin-postcss', 'gatsby-plugin-extract-image-colors', 'gatsby-plugin-fontawesome-css', 'gatsby-plugin-react-helmet'],
}
