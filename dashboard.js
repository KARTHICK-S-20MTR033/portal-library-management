const API = "http://localhost:5000";
const booksContainer = document.getElementById("books-container");
const borrowedContainer = document.getElementById("borrowed-books-container");

// =======================
// FETCH BOOKS
// =======================
async function fetchBooks() {
    try {
        const response = await fetch(`${API}/books`);
        const books = await response.json();
        booksContainer.innerHTML = "";

        const groupedBooks = {};
        books.forEach(book => {
            if (!groupedBooks[book.genre]) groupedBooks[book.genre] = [];
            groupedBooks[book.genre].push(book);
        });

        let sectionsHTML = ""; 

        for (const genre in groupedBooks) {
            let booksHTML = "";
            groupedBooks[genre].forEach((book, index) => {
                const isOutOfStock = book.quantity <= 0;
                booksHTML += `
                    <div class="book-card">
                        <h3>${index + 1}. ${book.title}</h3>
                        <p>✍ Author: ${book.author}</p>
                        <div class="qty">Qty Available : ${book.quantity}</div>
                        <button 
                            onclick="borrowBook(${book.id})" 
                            ${isOutOfStock ? "disabled style='background: #ccc; cursor: not-allowed;'" : ""}>
                            ${isOutOfStock ? "Out Of Stock" : "Borrow Book"}
                        </button>
                    </div>`;
            });

            sectionsHTML += `
                <div class="genre-section">
                    <h2 class="genre-heading">${genre}</h2>
                    <div class="genre-books">${booksHTML}</div>
                </div>`;
        }
        booksContainer.innerHTML = sectionsHTML;

    } catch (error) {
        console.error(error);
        alert("Failed to fetch books ❌");
    }
}

// =======================
// BORROW BOOK (Dynamic)
// =======================
async function borrowBook(bookId) {
    // LocalStorage-la irunthu login panna user email edukirom
    const email = localStorage.getItem("studentEmail");

    if (!email) {
        alert("Session expired. Please login again.");
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetch(`${API}/borrow-book`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                email: email, // Unga server.js email thaan expect pannuthu
                bookId: bookId 
            })
        });

        const data = await response.json();

        if (data.success) {
            alert("Book Borrowed 📚");
            fetchBooks();
            loadBorrowedBooks();
        } else {
            alert(data.message || "Failed ❌");
        }
    } catch (err) {
        console.error(err);
        alert("Server Error ❌");
    }
}

// =======================
// LOAD BORROWED BOOKS
// =======================
async function loadBorrowedBooks() {
    try {
        const response = await fetch(`${API}/borrowed-books`);
        const books = await response.json();

        borrowedContainer.innerHTML = "";

        books.forEach(book => {
            borrowedContainer.innerHTML += `
                <div class="book-card">
                    <h3>${book.book_title}</h3> <p>👨 Student: ${book.student_name}</p> <p>📧 Email: ${book.student_email}</p>
                    <p>📅 Date: ${new Date(book.borrow_date).toLocaleDateString()}</p>
                </div>
            `;
        });
    } catch (err) {
        console.error(err);
    }
}

// =======================
// LOGOUT & INIT
// =======================
document.addEventListener("DOMContentLoaded", () => {
    // Check if user is logged in
    if (!localStorage.getItem("studentEmail")) {
        window.location.href = "index.html";
        return;
    }

    const logoutBtn = document.getElementById("logout-btn");
    if(logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear(); // Session clear panniduvom
            alert("Logged Out Successfully 😎");
            window.location.href = "index.html";
        });
    }

    fetchBooks();
    loadBorrowedBooks();
});