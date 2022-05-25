const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Commune = new Schema({
    name: {
        type: String,
        required: true
    },

    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District',
    }
})

module.exports = mongoose.model('Commune', Commune)