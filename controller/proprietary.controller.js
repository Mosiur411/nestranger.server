const path = require('path');
const fs = require('fs');
const { uploadToCloudinary, compressImage } = require("../config/files.config");
const { ProprietaryModel } = require("../model/proprietary.model");
const { bookingCheckerHelp } = require("../utils/bookingChecker");
// Create Proprietary
const createProprietary = async (req, res) => {
    try {
        const data = req.body;
        if (!data) return res.status(400).json({ error: 'No data provided to create proprietary' });
        const newProprietary = new ProprietaryModel(data);
        const savedProprietary = await newProprietary.save();
        res.status(201).json({ message: 'Proprietary create successfully', data: savedProprietary });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create proprietary', details: error.message });
    }
};
// Get All Proprietaries with Pagination
const getAllProprietaries = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 if not provided

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const proprietaries = await ProprietaryModel.find()
            .skip((pageNumber - 1) * limitNumber) // Skip the previous pages
            .limit(limitNumber); // Limit the number of results

        // Get total count of documents
        const totalCount = await ProprietaryModel.countDocuments();

        res.status(200).json({
            totalPages: Math.ceil(totalCount / limitNumber),
            currentPage: pageNumber,
            totalCount,
            data: proprietaries
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch proprietaries', details: error.message });
    }
};


// Get Single Proprietary by ID
const getProprietaryById = async (req, res) => {
    try {
        const { slug, city } = req.query;
        console.log(req.query)
        const proprietary = await ProprietaryModel.findOne({ slug: slug, 'location.city': city });
        if (!proprietary) {
            return res.status(404).json({ error: 'Proprietary not found' });
        }
        res.status(200).json(proprietary);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch proprietary', details: error.message });
    }
};

// Update Proprietary by ID
const updateProprietary = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProprietary = await ProprietaryModel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updatedProprietary) {
            return res.status(404).json({ error: 'Proprietary not found' });
        }
        res.status(200).json(updatedProprietary);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update proprietary', details: error.message });
    }
};

// Delete Proprietary by ID
const deleteProprietary = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProprietary = await ProprietaryModel.findByIdAndDelete(id);
        if (!deletedProprietary) {
            return res.status(404).json({ error: 'Proprietary not found' });
        }
        res.status(200).json({ message: 'Proprietary deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete proprietary', details: error.message });
    }
};

/* search book data  */

const getSearchProprietaries = async (req, res) => {
    try {
        const data = req.query;
        if (!data?.city || !data?.startDate || !data?.endDate) return res.status(400).json({ error: 'if proprietary filtering provided city and startDate or endDate.' });
        const result = await bookingCheckerHelp(data)
        if (result) {
            return res.status(400).json({ error: 'Room is already booked for the selected date range' });
        } else {
            const proprietaries = await ProprietaryModel.find({ 'location.city': data?.city });
            res.status(200).json(proprietaries);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch proprietaries', details: error.message });
    }
};
const uploadsImages = async (req, res) => {
    try {
        const images = [];
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images uploaded' });
        }
        for (const file of req.files) {
            const result = await uploadToCloudinary(file?.path, 'proprietary')
            images.push(result);
           /*  const filePath = path.join(__dirname, '../public/uploads', file.filename);
            const compressedImagePath = await compressImage(filePath);
            if(compressedImagePath){
                fs.unlinkSync(file?.path) 
            }
            images.push(compressedImagePath); 
            */
        }
        res.status(200).json({ message: 'Images uploaded and compressed successfully', uploadImages: images });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload images', details: error.message });
    }
};
/* 
      //upload Cloudinary
      for (const file of req.files) {
          const result = await uploadToCloudinary(file?.path, 'proprietary')
          imageUrls.push(result);
      }
          */

module.exports = {
    createProprietary,
    getAllProprietaries,
    getProprietaryById,
    updateProprietary,
    deleteProprietary,
    getSearchProprietaries,
    uploadsImages
};
