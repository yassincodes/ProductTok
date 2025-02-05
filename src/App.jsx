const PRODUCT_HUNT_QUERY = `
  query GetTrendingPosts {
    posts(first: 50) {
      edges {
        node {
          id
          name
          tagline
          description
          url
          thumbnail {
            url
          }
          media {
            url
            type
          }
          votesCount
          topics {
            edges {
              node {
                name
              }
            }
          }
          makers {
            name
            profileImage
          }
          website
          reviewsRating
          commentsCount
        }
      }
    }
  }
`;
import {useState, useEffect} from "react";
import "./App.css"
const App = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const PRODUCT_HUNT_API_TOKEN = 'KJ2x4PiASJc7moi6g-CVNi6KUGIjqexWzOmFDXnhPo8';

  useEffect(() => {
    const fetchProductHuntData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PRODUCT_HUNT_API_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            query: PRODUCT_HUNT_QUERY
          })
        });

        const data = await response.json();
        setProducts(data.data.posts.edges.map(edge => edge.node));
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchProductHuntData();
  }, []);

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="app">
      {products.map(product => (
        <div key={product.id} className="product-card">
          <div className="product-content">
            <div>
              <h2 className="product-title">{product.name}</h2>
              <p className="product-tagline">{product.tagline}</p>
              <p className="product-description">{product.description}</p>
              
              {product.thumbnail?.url && (
                <img 
                  src={product.thumbnail.url} 
                  alt={product.name}
                  className="product-thumbnail"
                />
              )}

              <div className="product-makers">
                {product.makers?.map((maker, index) => (
                  <div key={index} className="maker">
                    {maker.profileImage && (
                      <img src={maker.profileImage} alt={maker.name} className="maker-image" />
                    )}
                    <span>{maker.name}</span>
                  </div>
                ))}
              </div>

              <div className="product-topics">
                {product.topics?.edges.map((edge, index) => (
                  <span key={index} className="topic-tag">
                    {edge.node.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="product-info">
              <div className="product-stats">
                <span className="votes">🔼 {product.votesCount} votes</span>
                <span className="comments">💬 {product.commentsCount} comments</span>
                {product.reviewsRating && (
                  <span className="rating">⭐ {product.reviewsRating.toFixed(1)}</span>
                )}
              </div>
              <a 
                href={product.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="view-link"
              >
                View Product
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};


export default App;

