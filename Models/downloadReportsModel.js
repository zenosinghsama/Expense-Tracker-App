const Sequelize = require('sequelize');
const sequelize = require('../Util/database');

const DownloadedReports = sequelize.define('downloadedReports', {
    fileUrl: {
        type: Sequelize.STRING,
        primaryKey: false,
        allowNull: false
    }
});

module.exports = DownloadedReports;