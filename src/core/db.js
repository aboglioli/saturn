const config = require('../config');

const mongoose = require('mongoose');

module.exports = mongoose.connect(`mongodb://${config.database.host}:${config.database.port}/${config.database.name}`);
