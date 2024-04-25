const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection URL
const url = 'mongodb+srv://kaspalanamol:pass@stock.xiozwgc.mongodb.net/';

// Serve static files from the "public" directory
app.use(express.static('public'));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Home route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/home.html');
});

// Process route
app.get('/process', (req, res) => {
  const searchTerm = req.query.searchTerm;
  const searchType = req.query.searchType;

  // Connect to MongoDB
  MongoClient.connect(url, (err, client) => {
    if (err) {
      console.error('Error connecting to MongoDB:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    const db = client.db('Stock');
    const collection = db.collection('PublicCompanies');

    // Determine the search query based on the search type
    const query = searchType === 'ticker' ? { ticker: searchTerm } : { company: { $regex: searchTerm, $options: 'i' } };

    // Find the matching companies in the database
    collection.find(query).toArray((err, companies) => {
      if (err) {
        console.error('Error querying the database:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      console.log('Matching companies:', companies);

      // Send the matching companies as a JSON response
      res.json(companies);

      // Close the MongoDB connection
      client.close();
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
