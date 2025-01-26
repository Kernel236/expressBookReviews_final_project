const express = require('express');
const axios = require('axios');  // Se vuoi mostrare l’uso di Axios
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

/****************************************
 *    Resta il codice originale
 *    delle rotte “sincrone” (Tasks 1-5)
 ****************************************/

public_users.post("/register", (req,res) => {
  return res.status(300).json({message: "Yet to be implemented"});
});

public_users.get('/', function (req, res) {
  // Task 1 (sinc.): Restituiamo la lista di libri
  return res.status(200).send(JSON.stringify(books, null, 4));
});

public_users.get('/isbn/:isbn', function (req, res) {
  // Task 2 (sinc.): Cerca libro per ISBN
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

public_users.get('/author/:author', function (req, res) {
  // Task 3 (sinc.): Cerca libri per autore
  const requestedAuthor = req.params.author;
  const booksByAuthor = Object.values(books).filter((book) => {
    return book.author === requestedAuthor;
  });
  return res.status(200).json(booksByAuthor);
});

public_users.get('/title/:title', function (req, res) {
  // Task 4 (sinc.): Cerca libri per titolo
  const requestedTitle = req.params.title;
  const booksByTitle = Object.values(books).filter((book) => {
    return book.title === requestedTitle;
  });
  return res.status(200).json(booksByTitle);
});

// Task 5 (sinc.): Review per ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});


/*******************************************************
 *   ESECUZIONE DELLE STESSE RICERCHE (Tasks 10-13)
 *   TRAMITE PROMISES O ASYNC/AWAIT
 *******************************************************/

/**
 * Task 10: Restituire la lista di tutti i libri (come Task 1) ma usando:
 * - Promises (in questo esempio) 
 * - Oppure potresti usare async/await + axios
 */
public_users.get('/async/books', (req, res) => {
  // Esempio usando una Promise nativa:
  const getBooks = new Promise((resolve, reject) => {
    // Qui potresti fare qualunque operazione asincrona (DB, file, etc.)
    // In questo caso, simuliamo un “successo” immediato restituendo 'books'
    if (books) {
      resolve(books);
    } else {
      reject("No books found");
    }
  });

  getBooks
    .then((bookList) => {
      return res.status(200).json(bookList);
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});

/**
 * Task 11: Restituire i dettagli di un libro basato su ISBN (come Task 2)
 * usando async/await (ed eventualmente axios).
 */
public_users.get('/async/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    
    // Oppure usiamo una funzione interna con Promise:
    const book = await new Promise((resolve, reject) => {
      const result = books[isbn];
      if (result) resolve(result);
      else reject("Book not found");
    });

    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

/**
 * Task 12: Restituire i dettagli dei libri basato su Autore (come Task 3)
 * usando Promises.
 */
public_users.get('/async/author/:author', (req, res) => {
  const author = req.params.author;

  const getBooksByAuthor = new Promise((resolve, reject) => {
    const filtered = Object.values(books).filter((book) => {
      return book.author === author;
    });
    if (filtered.length > 0) {
      resolve(filtered);
    } else {
      reject(`No books found for author ${author}`);
    }
  });

  getBooksByAuthor
    .then((booksFound) => {
      return res.status(200).json(booksFound);
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});

/**
 * Task 13: Restituire i dettagli dei libri basato su Titolo (come Task 4)
 * usando async/await.
 */
public_users.get('/async/title/:title', async (req, res) => {
  const title = req.params.title;
  
  try {
    // Creiamo una funzione asincrona che restituisce i libri corrispondenti
    const getBooksByTitle = () => {
      return new Promise((resolve, reject) => {
        const filtered = Object.values(books).filter((book) => {
          return book.title === title;
        });
        if (filtered.length > 0) {
          resolve(filtered);
        } else {
          reject(`No books found with title: ${title}`);
        }
      });
    }

    // Aspettiamo la risoluzione della Promise
    const foundBooks = await getBooksByTitle();
    return res.status(200).json(foundBooks);

  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

module.exports.general = public_users;
