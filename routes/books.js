const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Book = require('../models/book')
const uploadPath = path.join('public', Book.coverImageBasePath)
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})


// All Books Route
router.get('/', async (req, res) => {
    const searchOptions = {}
    if (req.query.title != null && req.query.title !== '') {
      searchOptions.title = new RegExp(req.query.title, 'i')
    }
    if (req.query.author != null && req.query.author !== '') {
      searchOptions.author = req.query.author
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter !== '') {
      searchOptions.publishDate = {
        $gte: new Date(req.query.publishedAfter)
      }
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore !== '') {
      if (searchOptions.publishDate == null) {
        searchOptions.publishDate = {}
      }
      searchOptions.publishDate.$lte = new Date(req.query.publishedBefore)
    }
    try {
      const books = await Book.find(searchOptions).exec()
      const authors = await Author.find({})
      res.render('books/index', {
        books: books,
        searchOptions: req.query,
        authors: authors
      })
    } catch {
      res.redirect('/')
    }
  })
  

// New Book Route

router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
    
})

// Create Book Route
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })

    try {
        const newBook = await book.save()
        res.redirect('books')
    } catch {
        if (book.coverImageName != null) {
            removeBookCover(book.coverImageName)
        }
        renderNewPage(res, book, true)
    }
})

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err)
    })
}

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage = 'Error Creating Book'
        res.render('books/new', params)
    } catch {
        res.redirect('/books')
    }
}


module.exports = router