/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var mongoose = require("mongoose");
var objectId = mongoose.Types.ObjectId;

var bookSchema = new mongoose.Schema({
  title: String,
  comments: { type: [String], default: [] },
});

var Book = mongoose.model("book", bookSchema);

module.exports = function (app) {
  app
    .route("/api/books")
    .get(function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      let arrayOfBooks = [];
      Book.find({}, (error, results) => {
        if (!error && results) {
          results.forEach((result) => {
            let book = result.toJSON();
            book["commentcount"] = book.comments.length;
            arrayOfBooks.push(book);
          });
          return res.json(arrayOfBooks);
        }
      });
    })

    .post(function (req, res) {
      var title = req.body.title;
      if (!title) {
        return res.send("missing required field title");
      }
      //response will contain new book object including atleast _id and title
      let newBook = new Book({
        title: title,
        comments: [],
      });
      newBook.save((error, savedBook) => {
        if (!error && savedBook) {
          res.json(savedBook);
        }
      });
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'
      Book.remove({}, (error, jsonStatus) => {
        if (!error && jsonStatus) {
          return res.send("complete delete successful");
        }
      });
    });

  app
    .route("/api/books/:id")
    .get(function (req, res) {
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      Book.findById(bookid, (error, result) => {
        if (!error && result) {
          return res.json(result);
        } else if (!result) {
          return res.send("no book exists");
        }
      });
    })

    .post(function (req, res) {
      var bookid = req.params.id;
      var comment = req.body.comment;
      if (!comment) return res.json("missing required field comment");
      //json res format same as .get
      Book.findByIdAndUpdate(
        bookid,
        { $push: { comments: comment } },
        { new: true },
        (error, updatedBook) => {
          if (!error && updatedBook) {
            return res.send(updatedBook);
          } else if (!updatedBook) {
            return res.send("no book exists");
          }
        }
      );
    })

    .delete(function (req, res) {
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      Book.findByIdAndRemove(bookid, (error, deletedBook) => {
        if (!error && deletedBook) {
          return res.send("delete successful");
        } else if (!deletedBook) {
          return res.send("no book exists");
        }
      });
    });
};
