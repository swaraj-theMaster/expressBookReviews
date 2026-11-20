const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();

// Register a new user (Task 6)
public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (isValid(username)) {
        return res.status(400).json({ message: "User already exists!" });
    }

    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Helper promise function to get all books (Tasks 1 & 10)
const getAllBooksPromise = () => {
    return new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject(new Error("Unable to fetch books"));
        }
    });
};

// Get the book list available in the shop (Task 1 & Task 10 using async-await / Promises)
public_users.get('/', async function (req, res) {
    try {
        const bookList = await getAllBooksPromise();
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Helper promise function to get book by ISBN (Tasks 2 & 11)
const getBookByISBNPromise = (isbn) => {
    return new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject({ status: 404, message: "Book not found" });
        }
    });
};

// Get book details based on ISBN (Task 2 & Task 11 using async-await / Promises)
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getBookByISBNPromise(isbn)
        .then((book) => {
            return res.status(200).send(JSON.stringify(book, null, 4));
        })
        .catch((err) => {
            return res.status(err.status || 500).json({ message: err.message });
        });
});

// Helper promise function to get books by author (Tasks 3 & 12)
const getBooksByAuthorPromise = (author) => {
    return new Promise((resolve) => {
        let matchingBooks = [];
        const bookKeys = Object.keys(books);
        bookKeys.forEach((key) => {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
                matchingBooks.push({ isbn: key, ...books[key] });
            }
        });
        resolve(matchingBooks);
    });
};

// Get book details based on author (Task 3 & Task 12 using async-await / Promises)
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const matchingBooks = await getBooksByAuthorPromise(author);
        if (matchingBooks.length > 0) {
            return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
        } else {
            return res.status(404).json({ message: "No books found by this author" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Helper promise function to get books by title (Tasks 4 & 13)
const getBooksByTitlePromise = (title) => {
    return new Promise((resolve) => {
        let matchingBooks = [];
        const bookKeys = Object.keys(books);
        bookKeys.forEach((key) => {
            if (books[key].title.toLowerCase() === title.toLowerCase()) {
                matchingBooks.push({ isbn: key, ...books[key] });
            }
        });
        resolve(matchingBooks);
    });
};

// Get all books based on title (Task 4 & Task 13 using async-await / Promises)
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    getBooksByTitlePromise(title)
        .then((matchingBooks) => {
            if (matchingBooks.length > 0) {
                return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
            } else {
                return res.status(404).json({ message: "No books found with this title" });
            }
        })
        .catch((err) => {
            return res.status(500).json({ message: err.message });
        });
});

// Get book review (Task 5)
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
