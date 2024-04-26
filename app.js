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

    // Generate HTML for the search results
    let resultsHtml = '';
    if (companies.length > 0) {
      companies.forEach(company => {
        resultsHtml += `
          <div class="result">
            <p class="company-name">${company.companyName}</p>
            <p class="stock-ticker">${company.stockTicker}</p>
            <p class="stock-price">$${company.stockPrice.toFixed(2)}</p>
          </div>
        `;
      });
    } else {
      resultsHtml = '<p class="no-results">No matching companies found.</p>';
    }

    // Send the search results as HTML
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Search Results</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px auto;
            width: 80%;
            max-width: 800px;
            line-height: 1.6;
            background-color: #f4f4f4;
          }
          h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
          }
          .result {
            background-color: #fff;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .result p {
            margin: 0;
          }
          .result .company-name {
            font-size: 20px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
          }
          .result .stock-ticker {
            font-size: 16px;
            color: #666;
            margin-bottom: 5px;
          }
          .result .stock-price {
            font-size: 18px;
            color: #5cb85c;
          }
          .no-results {
            text-align: center;
            color: #666;
          }
          .error-message {
            text-align: center;
            color: #ff0000;
          }
        </style>
      </head>
      <body>
        <h1>Search Results</h1>
        <div id="results">
          ${resultsHtml}
        </div>
      </body>
      </html>
    `);

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
