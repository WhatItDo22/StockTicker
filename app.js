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
app.get('/process', async (req, res) => {
  const searchTerm = req.query.searchTerm;
  const searchType = req.query.searchType;

  try {
    // Connect to MongoDB
    const client = await MongoClient.connect(url);
    const db = client.db('Stock');
    const collection = db.collection('PublicCompanies');

    // Determine the search query based on the search type
    const query = searchType === 'ticker' ? { stockTicker: searchTerm } : { companyName: { $regex: searchTerm, $options: 'i' } };

    console.log('Starting database query');
    // Find the matching companies in the database
    const companies = await collection.find(query).limit(10).toArray();
    console.log('Database query completed');
    console.log('Matching companies:', companies);

    // Format the search results as plain text
    let results = '';
    if (companies.length > 0) {
      companies.forEach(company => {
        results += `Company: ${company.companyName}\nTicker: ${company.stockTicker}\nPrice: $${company.stockPrice.toFixed(2)}\n\n`;
      });
    } else {
      results = 'No matching companies found.';
    }

    // Send the search results as plain text
    res.set('Content-Type', 'text/plain');
    res.send(results);

    // Close the MongoDB connection
    client.close();
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
