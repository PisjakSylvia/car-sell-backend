const express = require('express');
const cors = require('cors'); // Importiere das cors-Paket

const app = express();

const port = process.env.PORT || 3000;
// Erlaube CORS für alle Anfragen
app.use(cors());

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const { Pool } = require('pg');

const pool = new Pool({
  user: 'willhaben-backend',
  host: 'localhost',
  database: 'webtech-project',
  password: 'test123',
  port: 4000,
});

pool.connect((err) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Connected to PostgreSQL');
  }
});
// frontend greift zu auf api cars
app.get('/api/cars', (req, res) => {
    pool.query('SELECT * FROM cars', (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json(result.rows);
      }
    });
});

app.get('/api/cars-to-sell', (req, res) => {
  pool.query('SELECT * FROM "cars-to-sell" left join cars on "cars-to-sell"."cars-id" = cars.id', 
    (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(result.rows);
    }
  });
});

app.post('/api/cars/:id/:Type/:Marke/:Model', (req, res) => {
  const id = req.params.id;
  var Type = req.params.Type;
  var Marke = req.params.Marke;
  var Model = req.params.Model;
 // Entferne den "Type=" Teil, wenn er vorhanden ist
 Type = Type.split('=')[1] || Type; // Falls "Type=" enthalten ist, nur den Wert extrahieren
 Marke = Marke.split('=')[1] || Marke; // Dasselbe für Marke
 Model = Model.split('=')[1] || Model; // Dasselbe für Model

  pool.query(
    'INSERT INTO cars (id, "Type", "Marke", "Model") VALUES ($1, $2, $3, $4) RETURNING *',
    [id, Type, Marke, Model], // Hier werden die Werte als Array übergeben
    (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json(result.rows[0]);
      }
    }
  );
});

// abfrage der marken
app.get('/api/car-brands', (req, res) => {
  pool.query('SELECT distinct "Marke" FROM cars order by "Marke" asc', (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      // nur die Marken auswählen, und in einem "Array" speichern
      const brands = result.rows.map(row => row.Marke);
      res.json(brands);    
    }
    });
});