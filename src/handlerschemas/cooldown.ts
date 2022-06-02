const mongoose = require('mongoose')

const cooldown = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  unix: {
    type: Number,
    required: true,
  },

})
export default mongoose.model('cooldown', cooldown)