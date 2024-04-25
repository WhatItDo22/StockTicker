const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;


const uri = "mongodb+srv://kaspalanamol:pass@stock.xiozwgc.mongodb.net/";

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/search', async (req, res) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('Stock');
    const collection = db.collection('PublicCompanies');
    const searchField = req.query.searchBy === 'ticker' ? 'stockTicker' : 'companyName';
    const query = { [searchField]: req.query.searchValue };
    const results = await collection.find(query).toArray();

    if (results.length > 0) {
      res.json(results);
    } else {
      res.send('No results found.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error connecting to database.");
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
