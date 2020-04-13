const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Bars = new Schema({
  //key - _id
  find_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'NCA-finds'
  },
  business_id: {type: 'String'},
  date: {type: 'Date'},
  assist: {type: 'Boolean'},

  ip: {type: 'String'},
  twitterId: {type: 'String', required: true},
})
module.exports = mongoose.model('NCA-bars', Bars)
