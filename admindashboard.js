const API = "http://localhost:5000";


// =======================
// LOGOUT
// =======================
const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        alert("Logged out 😎");
        window.location.href = "admin.html";
    });
}


// =======================
// LOAD BOOKS
// =======================
async function loadBooks() {
    try {
        const res = await fetch(`${API}/books`);
        const books = await res.json();

        const container = document.getElementById("books-list");
        if (!container) return;

        container.innerHTML = "";

        if (!books || books.length === 0) {
            container.innerHTML = "<p>No books available 📚</p>";
            return;
        }

        books.forEach(book => {
            container.innerHTML += `
                <div class="book-card">
                    <h3>${book.title}</h3>
                    <p>Author: ${book.author}</p>
                    <p>Genre: ${book.genre}</p>
                    <p>Qty: ${book.quantity}</p>

                    <div style="display:flex; gap:10px; justify-content:center; margin-top:10px;">
                        <button class="add-stock-btn" onclick="addStock(${book.id})">
    Add Stock
</button>
                        <button onclick="deleteBook(${book.id})">Delete</button>
                        <button onclick="reduceBook(${book.id})">Reduce Qty</button>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        console.error("LOAD ERROR:", err);
        alert("Failed to load books ❌");
    }
}


async function addStock(id) {
    const qty = prompt("How many more copies to add?");
    if (!qty || isNaN(qty) || Number(qty) <= 0) return;

    try {
        const res = await fetch(`${API}/add-stock/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ count: Number(qty) })
        });
        const data = await res.json();
        if (data.success) {
            alert("Stock Added! 📈");
            loadBooks();
        }
    } catch (err) {
        console.error(err);
    }
}

// =======================
// ADD BOOK
// =======================
async function addBook() {
    const title = document.getElementById("title")?.value.trim();
    const author = document.getElementById("author")?.value.trim();
    const genre = document.getElementById("genre")?.value.trim();
    const quantity = document.getElementById("quantity")?.value;

    if (!title || !author || !genre || !quantity) {
        alert("Fill all fields ❌");
        return;
    }

    try {
        const res = await fetch(`${API}/add-book`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                author,
                genre,
                quantity: Number(quantity)
            })
        });

        const data = await res.json();

        if (data.success) {
            alert("Book Added 🚀");
            document.getElementById("title").value = "";
            document.getElementById("author").value = "";
            document.getElementById("genre").value = "";
            document.getElementById("quantity").value = "";
            loadBooks();
        } else {
            alert(data.message || "Failed ❌");
        }
    } catch (err) {
        console.error("ADD ERROR:", err);
        alert("Server error ❌");
    }
}


// =======================
// DELETE BOOK
// =======================
async function deleteBook(id) {
    const ok = confirm("Delete this book?");
    if (!ok) return;

    try {
        const res = await fetch(`${API}/delete-book/${id}`, {
            method: "DELETE"
        });
        const data = await res.json();
        if (data.success) {
            alert("Deleted 🗑️");
            loadBooks();
        } else {
            alert(data.message || "Delete failed ❌");
        }
    } catch (err) {
        console.error("DELETE ERROR:", err);
        alert("Server error ❌");
    }
}


// =======================
// REDUCE QUANTITY
// =======================
async function reduceBook(id) {
    const qty = prompt("How many copies to reduce?");
    if (!qty || isNaN(qty) || Number(qty) <= 0) {
        alert("Enter valid number ❌");
        return;
    }

    try {
        const res = await fetch(`${API}/reduce-book/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ count: Number(qty) })
        });
        const data = await res.json();
        if (data.success) {
            alert(data.message);
            loadBooks();
        } else {
            alert(data.message || "Operation failed ❌");
        }
    } catch (err) {
        console.error("REDUCE ERROR:", err);
        alert("Server error ❌");
    }
}

async function addStock(id) {
    const qty = prompt("How many more copies to add?");

    if (!qty || isNaN(qty) || Number(qty) <= 0) {
        alert("Enter a valid number ❌");
        return;
    }

    try {
        const res = await fetch(`${API}/add-stock/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ count: Number(qty) })
        });

        const data = await res.json();
        if (data.success) {
            alert("Stock Added! 📈");
            loadBooks(); // List-ah refresh pannum
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error("ADD STOCK ERROR:", err);
        alert("Server error ❌");
    }
}

// =======================
// LOAD BORROWED BOOKS (UPDATED)
// =======================
async function loadBorrowedBooks() {
    try {
        const res = await fetch(`${API}/borrowed-books`);
        const data = await res.json();

        const container = document.getElementById("borrowed-books-list");
        if (!container) return;

        container.innerHTML = "";

        if (!data || data.length === 0) {
            container.innerHTML = "<p>No borrowed books 📚</p>";
            return;
        }

        data.forEach(item => {
            container.innerHTML += `
                <div class="book-card">
                    <h3>${item.book_title}</h3> <p>👨 Student: ${item.student_name}</p> <p>📧 Email: ${item.student_email}</p> <p>📅 Borrowed: ${new Date(item.borrow_date).toLocaleDateString()}</p>
                </div>
            `;
        });

    } catch (err) {
        console.error("BORROW LOAD ERROR:", err);
        alert("Failed to load borrowed books ❌");
    }
}


// =======================
// INIT
// =======================
document.addEventListener("DOMContentLoaded", () => {
    loadBooks();
    loadBorrowedBooks();
});