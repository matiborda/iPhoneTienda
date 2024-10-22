const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));

const dbConfig = {
  host: '<mysql://root:MWuJAAIfutgkxCeOSHNXVBbLAAKGplel@junction.proxy.rlwy.net:11819/railway>',
  user: '<root>',
  password: '<MWuJAAIfutgkxCeOSHNXVBbLAAKGplel>',
  database: '<railway>',
  port: 3306 // Asegúrate de usar el puerto correcto
};

// MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

// Ruta para la raíz
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html'); // Sirve el archivo HTML directamente
});

// Ruta de registro
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  connection.query(query, [username, email, hashedPassword], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Error registering user' });
    } else {
      res.status(201).json({ message: 'User registered successfully' });
    }
  });
});

// Ruta de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  const query = 'SELECT * FROM users WHERE username = ?';
  connection.query(query, [username], async (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Error logging in' });
    } else if (results.length === 0) {
      res.status(400).json({ error: 'User not found' });
    } else {
      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (passwordMatch) {
        res.json({ message: 'Logged in successfully', user });
      } else {
        res.status(400).json({ error: 'Invalid password' });
      }
    }
  });
});

// Ruta para obtener productos
app.get('/products', (req, res) => {
  const query = 'SELECT * FROM products';
  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Error retrieving products' });
    } else {
      res.json(results);
    }
  });
});

// Ruta para realizar compras
app.post('/purchase', (req, res) => {
  const { userId, productId } = req.body;
  
  const query = 'INSERT INTO purchases (user_id, product_id) VALUES (?, ?)';
  connection.query(query, [userId, productId], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Error processing purchase' });
    } else {
      res.json({ message: 'Purchase successful' });
    }
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
