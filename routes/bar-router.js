const express = require('express')

const BarCtrl = require('../controllers/bar-ctrl')

const barRouter = express.Router()

barRouter.post('/bar', BarCtrl.createBar)
barRouter.put('/bar/:_id', BarCtrl.updateBar)
barRouter.delete('/bar/:_id', BarCtrl.deleteBar)
barRouter.get('/bar/:_id', BarCtrl.getBarById)
barRouter.get('/bars/ip/:ip', BarCtrl.getBarsByIp)
barRouter.get('/bars/twitterId/:_id', BarCtrl.getBarsByTwitterId)
barRouter.get('/bars', BarCtrl.getBars)

module.exports = barRouter