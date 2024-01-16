import React, { useMemo } from 'react';
import { graphql, useStaticQuery } from 'gatsby';

interface ImageProps {
    src: string,
    alt: string,
    className: string
}

interface NodeData {
    node: {
        relativePath: string,
        extension: string,
        publicURL: string,
        childImageSharp: {
            gatsbyImageData: {
                layout: string,
                backgroundColor: string,
                images: {
                    fallback: {
                        src: string,
                        srcSet: string,
                        sizes: string
                    },
                    sources: Array<
                        {
                            srcSet: string,
                            type: string,
                            sizes: string
                        }
                    >
                },
                width: number,
                height: number
            }
        }
    }
}

interface Data {
    images: {
        edges: NodeData[]
    }
}

const Image: React.FC<ImageProps> = ({ src, ...props }) => {
    const data = useStaticQuery<Data>(graphql`
    query {
      images: allFile(filter: { internal: { mediaType: { regex: "/image/" } } }) {
        edges {
          node {
            relativePath
            extension
            publicURL
            childImageSharp {
                gatsbyImageData(width: 500)
              }
          }
        }
      }
    }
  `);

    const match = useMemo(() => data.images.edges.find(({ node }) => src === node.relativePath), [data, src]);

    if (!match) return null;

    const { node: { childImageSharp, publicURL, extension } = {} } = match;

    if (extension === 'svg' || !childImageSharp) {
        return <img src={publicURL} {...props} className={props.className} />;
    }

    const source = childImageSharp.gatsbyImageData.images.sources[0]

    console.log(props.className, src)
    return (
        <img
            srcSet={source.srcSet}
            sizes={source.sizes}
            alt={props.alt}
            className={props.className}
        />
    )
};


export { Image };