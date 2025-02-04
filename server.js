const express = require('express');
const cors = require('cors'); // Importiere das cors-Paket

const app = express();

const port = process.env.PORT || 3000;


//app.use(bodyParser.json({ limit: '5mb' }))

// Erlaube CORS für alle Anfragen
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const { Pool } = require('pg');
// https://www.youtube.com/watch?v=cc-cSSsGqbA
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
function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}
// zb:
// http://localhost:3000/api/cars-to-sell/f5ae3b28-583d-4925-a24b-7517d4796967/War%20ein%20Raucher%20Auto/2499/2009-01-01/191000/Benzin/Gelb/Gebraucht/f5ae3b28-583d-4925-a24b-7517d4796966
app.post('/api/cars-to-sell/:description/:price/:registrationDate/:mileage/:fuel/:color/:condition/:carsid', (req, res) => {
  //console.log(req);
  //const id = req.params.id;
  // id noch generieren hier
  
  const id = uuidv4();
  let description = req.params.description;
  let price = req.params.price;
  let registrationDate = req.params.registrationDate;
  let mileage = req.params.mileage;
  let fuel = req.params.fuel;
  let color = req.params.color;
  let condition = req.params.condition;
  let carsid = req.params.carsid;

  // entfernt den "Key=" Teil, wenn er vorhanden ist
  description = description.split('=')[1] || description;
  price = price.split('=')[1] || price;
  registrationDate = registrationDate.split('=')[1] || registrationDate;
  mileage = mileage.split('=')[1] || mileage;
  fuel = fuel.split('=')[1] || fuel;
  color = color.split('=')[1] || color;
  condition = condition.split('=')[1] || condition;
  carsid = carsid.split('=')[1] || carsid;

  pool.query(
    `INSERT INTO "cars-to-sell" (
      id, description, price, "registrationDate", mileage, fuel, color, condition, "cars-id"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [id, description, price, registrationDate, mileage, fuel, color, condition, carsid],
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
// bilder einfügen

app.post('/api/car-images/:carsToSellId', (req, res) => {
  //console.log("hallo");  
  console.log(req.body);
  let image = req.body.image;
  //const id = req.params.id;
  // id noch generieren hier
  
  const id = uuidv4();
  let carsToSellId = req.params.carsToSellId;

  // entfernt den "Key=" Teil, wenn er vorhanden ist
  carsToSellId = carsToSellId.split('=')[1] || carsToSellId;

  pool.query(
    `INSERT INTO "car-images" (
      id, "cars-to-sell-id", image) VALUES ($1, $2, $3) RETURNING *`,
    [id, carsToSellId, image],
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
app.get('/api/car-models/:brand', (req, res) => {
  const brand = req.params.brand;
  pool.query('SELECT DISTINCT "Model" FROM cars WHERE "Marke" = $1 ORDER BY "Model" ASC', [brand], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const models = result.rows.map(row => row.Model);
      res.json(models);
    }
  });
});


// so bekommt man genau 1mal das zu verkaufende Auto mit "Titelbild" , ohne dass es zb 3 mal selected wird weil es 3 Bilder hat
app.get('/api/cars-to-sell-with-image', (req, res) => {
  pool.query('SELECT * FROM  "cars-to-sell" left join cars on "cars-to-sell"."cars-id" = cars.id left join "car-images" on "cars-to-sell"."id" = "car-images"."cars-to-sell-id" where "car-images".order = 1', 
    (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(result.rows);
    }
  });
});

app.get('/api/messages/:senderID/:receiverID', (req, res) => {
  const senderID = req.params.senderID;
  const receiverID = req.params.receiverID;

  pool.query(
    `SELECT * FROM public.messages
     WHERE ("senderID" = $1 AND "receiverID" = $2) 
     OR ("senderID" = $2 AND "receiverID" = $1)
     ORDER BY "time"`,
    [senderID, receiverID],
    (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json(result.rows); 
      }
    }
  );
});
