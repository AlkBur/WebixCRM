var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var basename = path.basename(module.filename);
var env = process.env.NODE_ENV || 'development';
var config = require('../config/database');
var db = {};

const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
    host: config.HOST,
    dialect: config.dialect,
    operatorsAliases: 0,

    pool: {
        max: config.pool.max,
        min: config.pool.min,
        acquire: config.pool.acquire,
        idle: config.pool.idle
    }
});

let dataTypes = Sequelize.DataTypes;

// Create class for custom datatype
class MVARCHAR extends dataTypes.CITEXT {
    toSql() {
        return 'MVARCHAR';
    }
};

class MCHAR extends dataTypes.CITEXT {
    toSql() {
        return 'MCHAR';
    }
};

// Add to DataTypes
dataTypes.MVARCHAR = MVARCHAR;
dataTypes.MCHAR = MCHAR;

fs
    .readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(function (file) {
        var model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function (modelName) {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;