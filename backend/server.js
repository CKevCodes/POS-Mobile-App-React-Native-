const express = require('express');
const mysql = require('mysql2/promise')
const app = express();
const port = 8082;


const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Fr4nk@0920!905A72#',
    database: 'POS',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

app.get('/products', async (req, res) => {
    try {
        const[rows] = await pool.query(
            "SELECT * FROM Products")

            res.json(rows)

    }catch(err) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});

async function testConnection () {
    try {
        const connection = await pool.getConnection();
        console.log("Successfully connected to MYSQL")
        connection.release();
    }catch (err) {
        console.log(err)
    }
}
testConnection();

app.listen(port , () => {
    console.log(`Server is running on http://localhost:${port}`)
});