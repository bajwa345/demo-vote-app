const msSql = require("mssql");
const util = require('util');
const config = require("../config/db.config.js");

exports.ddListPaConstituencies = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        //console.log(util.inspect(req.body, {showHidden: false, depth: null, colors: true}));
        var _query = "";//req.userData.canId

        sql.query(
            "select pa_id as id, pa_name as description from tbl_constituencyprovincial where 1=1" + _query + ";"
        )
        .then((resultSet) => {
            conn.close();
            res.status(200).json({
                ddlist: resultSet.recordset
            });
        })
        .catch((err) => {
            console.log(err);
            conn.close();
            res.status(500).json({
                ddlist: [],
            });
        });
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).json({
        ddlist: [],
    });
  });
};

exports.ddListUcConstituencies = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        //console.log(util.inspect(req.body, {showHidden: false, depth: null, colors: true}));
        var _query = "";//req.userData.canId
        if(req.body.ipaconstituency){
            _query += " and pa_id = " + req.body.ipaconstituency;
        }

        sql.query(
            "select uc_id as id, uc_nameUrdu as description from tbl_constituencyuc where 1=1" + _query + ";"
        )
        .then((resultSet) => {
            conn.close();
            res.status(200).json({
                ddlist: resultSet.recordset
            });
        })
        .catch((err) => {
            console.log(err);
            conn.close();
            res.status(500).json({
                ddlist: [],
            });
        });
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).json({
        ddlist: [],
    });
  });
};

exports.ddListPollingStations = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        //console.log(util.inspect(req.body, {showHidden: false, depth: null, colors: true}));
        var _query = "";//req.userData.canId
        if(req.body.ipaconstituency){
            _query += " and pa_id = " + req.body.ipaconstituency;
        }
        if(req.body.iucconstituency){
            _query += " and uc_id = " + req.body.iucconstituency;
        }
        if(req.body.ipollinglocation){
            _query += " and plc_id = " + req.body.ipollinglocation;
        }

        sql.query(
            "select pls_id as id, pls_nameUrdu as description from tbl_pollingstations where 1=1" + _query + ";"
        )
        .then((resultSet) => {
            conn.close();
            res.status(200).json({
                ddlist: resultSet.recordset
            });
        })
        .catch((err) => {
            console.log(err);
            conn.close();
            res.status(500).json({
                ddlist: [],
            });
        });
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).json({
        ddlist: [],
    });
  });
};

exports.ddListPollingLocations = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        var _query = "";//req.userData.canId
        if(req.body.ipaconstituency){
            _query += " and pa_id = " + req.body.ipaconstituency;
        }
        if(req.body.iucconstituency){
            _query += " and uc_id = " + req.body.iucconstituency;
        }

        sql.query(
            "select plc_id as id, plc_nameUrdu as description from tbl_pollinglocations where 1=1" + _query + ";"
        )
        .then((resultSet) => {
            conn.close();
            res.status(200).json({
                ddlist: resultSet.recordset
            });
        })
        .catch((err) => {
            console.log(err);
            conn.close();
            res.status(500).json({
                ddlist: [],
            });
        });
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).json({
        ddlist: [],
    });
  });
};

exports.ddListElectoralAreas = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        var _query = "";//req.userData.canId
        if(req.body.ipaconstituency){
            _query += " and ea.pa_id = " + req.body.ipaconstituency;
        }
        if(req.body.iucconstituency){
            _query += " and ea.uc_id = " + req.body.iucconstituency;
        }
        if(req.body.ipollinglocationid){
            _query += " and bc.plc_id = " + req.body.ipollinglocationid;
        }
        if(req.body.ipollingstationid){
            _query += " and bp.pls_id = " + req.body.ipollingstationid;
        }

        sql.query(
            "SELECT distinct ea.ela_id as id, ela_nameUrdu as description from tbl_electoralareas as ea "+
            "inner join dbo.tbl_blockcodes as bc on bc.ela_id = ea.ela_id "+
            "left join tbl_blockcodespollingstations bp on bp.blc_id = bc.blc_id "+
            "where 1=1" + _query + ";"
        )
        .then((resultSet) => {
            conn.close();
            res.status(200).json({
                ddlist: resultSet.recordset
            });
        })
        .catch((err) => {
            console.log(err);
            conn.close();
            res.status(500).json({
                ddlist: [],
            });
        });
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).json({
        ddlist: [],
    });
  });
};

exports.ddListBlockcodes = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        //console.log(util.inspect(req.body, {showHidden: false, depth: null, colors: true}));
        var _query = "";//req.userData.canId
        if(req.body.ipaconstituency){
            _query += " and pa_id = " + req.body.ipaconstituency;
        }
        if(req.body.iucconstituency){
            _query += " and uc_id = " + req.body.iucconstituency;
        }
        if(req.body.ipollinglocationid){
            _query += " and plc_id = " + req.body.ipollinglocationid;
        }

        sql.query(
            "SELECT blc_code as id, blc_code as description from tbl_blockcodes where 1=1" + _query + ";"
        )
        .then((resultSet) => {
            conn.close();
            res.status(200).json({
                ddlist: resultSet.recordset
            });
        })
        .catch((err) => {
            console.log(err);
            conn.close();
            res.status(500).json({
                ddlist: [],
            });
        });
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).json({
        ddlist: [],
    });
  });
};
