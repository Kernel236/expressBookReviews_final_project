const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

/**
 * In questo array salviamo gli utenti registrati.
 * Struttura di esempio: users = [{username: "pippo", password: "pluto"}, ...]
 */
let users = [];

/**
 * Funzione di utilità per controllare se l'username è valido.
 * Ritorna TRUE se l'username non è ancora presente tra gli utenti registrati.
 */
const isValid = (username) => {
  // Verifica se esiste già un utente con lo stesso username
  let userMatches = users.filter((user) => user.username === username);
  return (userMatches.length === 0);
}

/**
 * Funzione di autenticazione di un utente registrato.
 * Ritorna TRUE se username e password combaciano con un record esistente in 'users'.
 */
const authenticatedUser = (username, password) => {
  let validUsers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  return (validUsers.length > 0);
}

/**
 * Task 7:
 * Endpoint per il login di un utente registrato.
 * - Verifica se la coppia username/password è presente in 'users'.
 * - Se sì, genera un token JWT e lo salva nella sessione.
 * - Risponde con status 200 in caso di successo, altrimenti 401 se credenziali non valide.
 */
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Se username o password non sono presenti nella richiesta
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  // Verifichiamo se l'utente esiste ed è autenticato
  if (authenticatedUser(username, password)) {
    // Generiamo un token JWT contenente un payload (puoi personalizzarlo)
    let accessToken = jwt.sign(
      { data: username },   // il payload (info che vogliamo memorizzare nel token)
      'access',            // la 'secret' usata per criptare il token (assicurati di gestirla in modo sicuro in produzione)
      { expiresIn: 60 * 60 }  // token scade dopo 1 ora
    );

    // Salviamo token e username nella sessione
    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({ message: "User successfully logged in!" });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

/**
 * Task 8:
 * Endpoint per aggiungere o modificare la recensione di un libro.
 * Rotta protetta: /auth/review/:isbn
 * - Se l’utente ha già lasciato una recensione per quell’ISBN, la modifichiamo.
 * - Se è un altro utente, aggiungiamo una nuova recensione.
 * - Prendiamo la recensione da req.query.review.
 * - Inseriamo/aggiorniamo la review in books[isbn].reviews[<username>].
 */
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review; // la recensione viene passata come query param
  const sessionData = req.session.authorization;

  // Verifichiamo che l'utente sia autenticato e che abbia un username nella sessione
  if (!sessionData) {
    return res.status(401).json({ message: "You need to be logged in to post a review" });
  }
  const username = sessionData.username;

  // Controlliamo che il libro esista
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Se la recensione non è fornita nella query string
  if (!review) {
    return res.status(400).json({ message: "Review text is required (use ?review=<text>)" });
  }

  // Se la proprietà reviews non esiste, la creiamo
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Aggiungiamo o modifichiamo la recensione per l’utente corrente
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review posted/modified successfully",
    book: books[isbn]
  });
});

/**
 * Task 9:
 * Endpoint per eliminare la recensione di un libro.
 * Rotta protetta: /auth/review/:isbn
 * - Solo l’utente che ha scritto la review può eliminarla.
 */
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const sessionData = req.session.authorization;

  // Verifichiamo che l'utente sia autenticato e che abbia un username nella sessione
  if (!sessionData) {
    return res.status(401).json({ message: "You need to be logged in to delete a review" });
  }
  const username = sessionData.username;

  // Verifichiamo che il libro esista
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Verifichiamo se la review esiste per l'utente in questione
  if (
    !books[isbn].reviews ||
    !books[isbn].reviews[username]
  ) {
    return res.status(400).json({ message: "No review found for this user" });
  }

  // Eliminiamo la recensione
  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    book: books[isbn]
  });
});


// Esportiamo router e funzioni di utilità
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
