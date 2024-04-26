const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection URL
const url = 'mongodb+srv://kaspalanamol:pass@stock.xiozwgc.mongodb.net/';

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

// Process route
app.get('/process', (req, res) => {
  const searchTerm = req.query.searchTerm;
  const searchType = req.query.searchType;

  // Connect to MongoDB
  MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
    if (err) {
      console.error('Error connecting to MongoDB:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    const db = client.db('Stock');
    const collection = db.collection('PublicCompanies');

    // Determine the search query based on the search type
    const query = searchType === 'ticker' ? { stockTicker: searchTerm } : { companyName: { $regex: searchTerm, $options: 'i' } };

    console.log('Starting database query');
    // Find the matching companies in the database
    collection.find(query).limit(10).toArray((err, companies) => {
      console.log('Database query completed');
      if (err) {
        console.error('Error querying the database:', err);
        res.status(500).send('Internal Server Error');
        client.close();
        return;
      }

      console.log('Matching companies:', companies);

      // Pass the matching companies as JSON response
      res.json(companies);

      // Close the MongoDB connection
      client.close();
    });
  });
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

server.timeout = 60000; 
