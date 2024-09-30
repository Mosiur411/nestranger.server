const express = require('express');
const { createProprietary, getAllProprietaries, getProprietaryById, deleteProprietary, updateProprietary, getSearchProprietaries, uploadsImages } = require('../controller/proprietary.controller');
const { upload } = require('../middleware/multer.config');
const proprietariesrouter = express.Router();

// CRUD routes for Proprietary
proprietariesrouter.post('/create', createProprietary);
proprietariesrouter.get('/all', getAllProprietaries);
proprietariesrouter.get('/single', getProprietaryById);
proprietariesrouter.put('/update/:id', updateProprietary);
proprietariesrouter.delete('/deleter/:id', deleteProprietary);
proprietariesrouter.get('/search', getSearchProprietaries);
proprietariesrouter.post('/uploads', upload.array('images', 50), uploadsImages);

module.exports = proprietariesrouter;
