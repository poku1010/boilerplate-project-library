'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 建立書籍的 Schema
const bookSchema = new Schema({
  title: { type: String, required: true },
  comments: { type: [String], default: [] },
  commentcount: { type: Number, default: 0 }
});

// 建立書籍模型
const Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {

  // Route for handling all books
  app.route('/api/books')
    .get(async function (req, res) {
      try {
        const books = await Book.find({}, '_id title commentcount');
        res.json(books);
      } catch (err) {
        res.status(500).send('Server error');
      }
    })
    
    .post(async function (req, res) {
      const title = req.body.title;

      if (!title) {
        return res.status(200).send('missing required field title');
      }

      try {
        const newBook = new Book({ title, commentcount: 0, comments: [] });
        await newBook.save();
        res.json({ _id: newBook._id, title: newBook.title });
      } catch (err) {
        res.status(500).send('Server error');
      }
    })
    
    .delete(async function (req, res) {
      try {
        await Book.deleteMany({});
        res.send('complete delete successful');
      } catch (err) {
        res.status(500).send('Server error');
      }
    });

  // Route for handling a single book by ID
  app.route('/api/books/:id')
    .get(async function (req, res) {
      const bookid = req.params.id;

      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.status(200).send('no book exists');
        }
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch (err) {
        res.status(200).send('no book exists');
      }
    })
    
    .post(async function (req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;

      if (!comment) {
        return res.status(200).send('missing required field comment');
      }

      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.status(200).send('no book exists');
        }

        book.comments.push(comment);
        book.commentcount = book.comments.length;
        await book.save();

        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch (err) {
        res.status(200).send('no book exists');
      }
    })
    
    .delete(async function (req, res) {
      const bookid = req.params.id;

      try {
        const deletedBook = await Book.findByIdAndDelete(bookid);
        if (!deletedBook) {
          return res.status(200).send('no book exists');
        }
        res.send('delete successful');
      } catch (err) {
        res.status(200).send('no book exists');
      }
    });

};
