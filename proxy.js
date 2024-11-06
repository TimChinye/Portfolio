import express from 'express';
import axios from 'axios';

const app = express();
const port = 8080;

// Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin (public proxy behavior)
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Define the proxy route
app.get('/proxy/*', async (req, res) => {
  const urlToFetch = decodeURIComponent(req.params[0]); // Get the URL to fetch

  // Validate the URL format
  try {
    const urlObject = new URL(urlToFetch); // Parse the URL
  } catch (error) {
    return res.status(400).send('Invalid URL');
  }

  // If URL is valid, fetch the resource
  try {
    const response = await axios.get(urlToFetch, {
      headers: {
        'User-Agent': req.get('User-Agent'), // Optionally set the User-Agent to mimic the original request
      },
    });

    // Set the appropriate content type based on the fetched content
    const contentType = response.headers['content-type'];
    res.setHeader('Content-Type', contentType);

    // Send the fetched content to the client
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching the URL:', error);
    res.status(500).send('Error fetching the resource');
  }
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
