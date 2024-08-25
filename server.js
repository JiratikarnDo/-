const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// ใช้ environment variables แทน hard-coded credentials
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "shopdee"
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1); // ออกจากโปรแกรมหากการเชื่อมต่อล้มเหลว
  }
  console.log('Connected to the database');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ป้องกัน SQL Injection โดยใช้ parameterized queries
app.post('/product', function (req, res) {
  const { productName, productDetail, price, cost, quantity } = req.body;
  const sql = "INSERT INTO product (productName, productDetail, price, cost, quantity) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [productName, productDetail, price, cost, quantity], function (err, result) {
    if (err) {
      console.error('Error inserting product:', err);
      return res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'status': false });
    }
    res.send({ 'message': 'บันทึกข้อมูลสำเร็จ', 'status': true });
  });
});

app.get('/product/:id', function (req, res) {
  const productID = req.params.id;
  const sql = "SELECT * FROM product WHERE productID = ?";
  db.query(sql, [productID], function (err, result) {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในการดึงข้อมูล', 'status': false });
    }
    res.send(result);
  });
});

app.post('/login', function (req, res) {
  const { username, password } = req.body;
  const sql = "SELECT * FROM customer WHERE username = ? AND password = ? AND isActive = 1";
  db.query(sql, [username, password], function (err, result) {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', 'status': false });
    }
    if (result.length > 0) {
      let customer = result[0];
      customer['message'] = "เข้าสู่ระบบสำเร็จ";
      customer['status'] = true;
      res.send(customer);
    } else {
      res.send({ "message": "กรุณาระบุรหัสผ่านใหม่อีกครั้ง", "status": false });
    }
  });
});

app.listen(port, function () {
  console.log(`Server listening on port ${port}`);
});