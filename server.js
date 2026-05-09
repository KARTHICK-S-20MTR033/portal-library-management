const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// =======================
// HOME ROUTE
// =======================
app.get("/", async (req, res) => {
    try {
        const data = await pool.query("SELECT NOW()");
        res.json({ success: true, data: data.rows });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// =======================
// REGISTER ROUTE
// =======================
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const checkUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (checkUser.rows.length > 0) {
            return res.json({ success: false, message: "Email already exists" });
        }

        const newUser = await pool.query(
            "INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING *",
            [name, email, password]
        );

        res.json({ success: true, message: "Registration Successful", user: newUser.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// =======================
// STUDENT LOGIN
// =======================
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await pool.query(
            "SELECT * FROM users WHERE email = $1 AND password = $2",
            [email, password]
        );

        if (user.rows.length > 0) {
            res.json({
                success: true,
                message: "Login Successful",
                user: { id: user.rows[0].id, name: user.rows[0].name, email: user.rows[0].email }
            });
        } else {
            res.json({ success: false, message: "Invalid Credentials" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// =======================
// ADMIN LOGIN
// =======================
app.post("/admin-login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await pool.query("SELECT * FROM admins WHERE email = $1 AND password = $2", [email, password]);

        if (admin.rows.length > 0) {
            res.json({ success: true, message: "Admin Login Successful" });
        } else {
            res.json({ success: false, message: "Invalid Admin Credentials" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// =======================
// GET ALL BOOKS
// =======================
app.get("/books", async (req, res) => {
    try {
        const allBooks = await pool.query("SELECT * FROM books ORDER BY id ASC");
        res.json(allBooks.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// =======================
// ADD BOOK
// =======================
app.post("/add-book", async (req, res) => {
    try {
        const { title, author, genre, quantity } = req.body;
        const newBook = await pool.query(
            "INSERT INTO books (title, author, genre, quantity) VALUES ($1, $2, $3, $4) RETURNING *",
            [title, author, genre, quantity]
        );
        res.json({ success: true, message: "Book added successfully", book: newBook.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// =======================
// DELETE BOOK
// =======================
app.delete("/delete-book/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM books WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.json({ success: false, message: "Book not found" });
        }
        res.json({ success: true, message: "Book deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// =======================
// REDUCE BOOK QUANTITY (Manual Update)
// =======================
app.put("/reduce-book/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { count } = req.body;
        const book = await pool.query("SELECT quantity FROM books WHERE id = $1", [id]);

        if (book.rows.length === 0) return res.json({ success: false, message: "Book not found" });

        let newQty = book.rows[0].quantity - count;
        if (newQty <= 0) {
            await pool.query("DELETE FROM books WHERE id = $1", [id]);
            return res.json({ success: true, message: "Book removed" });
        }

        const updated = await pool.query("UPDATE books SET quantity = $1 WHERE id = $2 RETURNING *", [newQty, id]);
        res.json({ success: true, book: updated.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// =======================
// BORROW BOOK (Final Version - Name & Email)
// =======================
app.post("/borrow-book", async (req, res) => {
    const { email, bookId } = req.body;
    try {
        // 1. Get book and user info
        const bookResult = await pool.query("SELECT title, quantity FROM books WHERE id = $1", [bookId]);
        const userResult = await pool.query("SELECT name FROM users WHERE email = $1", [email]);

        if (bookResult.rows.length === 0 || userResult.rows.length === 0) {
            return res.json({ success: false, message: "Invalid Book or User" });
        }

        const book = bookResult.rows[0];
        const student = userResult.rows[0];

        if (book.quantity <= 0) {
            return res.json({ success: false, message: "Out of Stock" });
        }

        // 2. Insert with direct data
        await pool.query(
            "INSERT INTO borrowings (student_name, student_email, book_title, borrow_date) VALUES ($1, $2, $3, CURRENT_DATE)",
            [student.name, email, book.title]
        );

        // 3. Update stock
        await pool.query("UPDATE books SET quantity = quantity - 1 WHERE id = $1", [bookId]);

        res.json({ success: true, message: "Book borrowed successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// =======================
// GET BORROWED BOOKS (History)
// =======================
app.get("/borrowed-books", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM borrowings ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// =======================
// ADD BOOK QUANTITY (Stock Update)
// =======================
app.put("/add-stock/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { count } = req.body;

        const updated = await pool.query(
            "UPDATE books SET quantity = quantity + $1 WHERE id = $2 RETURNING *",
            [Number(count), id]
        );

        if (updated.rows.length === 0) {
            return res.json({ success: false, message: "Book not found" });
        }

        res.json({
            success: true,
            message: "Stock updated successfully",
            book: updated.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.put("/add-stock/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { count } = req.body;
        const updated = await pool.query(
            "UPDATE books SET quantity = quantity + $1 WHERE id = $2 RETURNING *",
            [Number(count), id]
        );
        res.json({ success: true, book: updated.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// =======================
// SERVER START
// =======================
app.listen(5000, () => {
    console.log("Server started on port 5000 🚀");
});