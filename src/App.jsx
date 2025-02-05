import React, { useState, useEffect } from 'react';

const App = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const PRODUCT_HUNT_API_TOKEN = 'KJ2x4PiASJc7moi6g-CVNi6KUGIjqexWzOmFDXnhPo8';

  // Delay function to prevent rate limiting
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    const fetchProductHuntData = async () => {
      try {
        setIsLoading(true);
        let allProducts = [];

        // Generate dates for the last 7 days
        const dates = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        });

        // Fetch products for each day
        for (const date of dates) {
          try {
            const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${PRODUCT_HUNT_API_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                query: `
                  query GetDailyPosts {
                    posts(first: 50, postedAfter: "${date}T00:00:00Z", postedBefore: "${date}T23:59:59Z") {
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
                          votesCount
                          createdAt
                        }
                      }
                    }
                  }
                `
              })
            });

            // Add a small delay to prevent rate limiting
            await delay(500);

            const responseBody = await response.text();
            console.log(`Fetching products for ${date}`);

            if (!response.ok) {
              console.error(`Error fetching for ${date}:`, responseBody);
              continue; // Skip to next date if this one fails
            }

            const result = JSON.parse(responseBody);
            
            if (result.errors) {
              console.error(`Errors for ${date}:`, result.errors);
              continue;
            }

            const fetchedProducts = result.data.posts.edges.map(edge => edge.node);
            allProducts = [...allProducts, ...fetchedProducts];

          } catch (dayError) {
            console.error(`Error processing ${date}:`, dayError);
          }
        }

        // Sort products by creation date (most recent first)
        allProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setProducts(allProducts);
        setIsLoading(false);
      } catch (err) {
        console.error('Overall fetch error:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchProductHuntData();
  }, []);

  if (isLoading) return <div>Loading... (fetching products day by day)</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Products from Last Week</h1>
      <p>Total Products: {products.length}</p>
      {products.map((product) => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <p>{product.tagline}</p>
          <p><strong>Description:</strong> {product.description}</p>
          <p><strong>Created:</strong> {new Date(product.createdAt).toLocaleDateString()}</p>
          {product.thumbnail?.url && (
            <img 
              src={product.thumbnail.url} 
              alt={product.name} 
              style={{width: '100px', height: '100px'}} 
            />
          )}
          <p>Votes: {product.votesCount}</p>
          <a href={product.url} target="_blank" rel="noopener noreferrer">
            View Product
          </a>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default App;