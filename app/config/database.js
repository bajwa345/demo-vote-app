var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 100,
    host: 'SQL5105.site4now.net',
    user: 'db_a8877c_dbvoogle_admin',
    password: 'Zxcv1234@',
    database: 'db_a8877c_dbvoogle',
    debug: false
});

module.exports = pool