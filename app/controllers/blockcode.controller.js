const msSql = require("mssql");
const util = require('util');
const config = require("../config/db.config.js");

exports.listBlockCodes = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    let fromRow = parseInt(req.body.fromRow) || 1;
    let toRow = parseInt(req.body.toRow) || 25;

    let sortColumn = req.body.sortColumn == null || req.body.sortColumn == '' ? '' : req.body.sortColumn;
    let sortOrder = req.body.sortOrder == null || req.body.sortOrder == '' ? 'desc' : req.body.sortOrder;

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        //console.log(util.inspect(req.body, {showHidden: false, depth: null, colors: true}));

        sql.input('icanid', msSql.VarChar(6), req.userData.canId);
        if(req.body.ipollinglocationid && req.body.ipollinglocationid != ''){
            sql.input('ipollinglocationid', msSql.VarChar(6), req.body.ipollinglocationid);
        }
        if(req.body.ipollingstationid && req.body.ipollingstationid != ''){
            sql.input('ipollingstationid', msSql.VarChar(6), req.body.ipollingstationid);
        }
        if(req.body.ielectoralareaid && req.body.ielectoralareaid != ''){
            sql.input('ielectoralareaid', msSql.VarChar(6), req.body.ielectoralareaid);
        }
        if(req.body.isearchtype && req.body.isearchtype != ''){
            sql.input('isearchtype', msSql.VarChar(1), req.body.isearchtype);
        }

        sql.input('StartRowNum', msSql.Int, fromRow);
        sql.input('EndRowNum', msSql.Int, toRow);
        sql.input('sortColumn', msSql.VarChar(63), sortColumn);
        sql.input('sortOrder', msSql.VarChar(5), sortOrder);
        sql.input('searchStr', msSql.VarChar(127), req.body.search);

        //console.log("list blockcodes");
        sql.execute('GetBlockCodesList')
        .then((result) => {
            conn.close();
            //console.log("blockcodes count " + result.recordset.length );

            res.status(201).json({
                message: "Data is Attached",
                items: result.recordset,
                rows_count: result.recordset != null && result.recordset.length > 0 ? result.recordset[0].totalrows : 0
            });
        })
        .catch(function (err) {
            console.log(err);
            conn.close();
            res.status(501).json({
            message: "Execution Failed",
            });
        });
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).json({
      message: "No Storage Connection",
    });
  });
};

exports.getBlockCodeDetails = (req, res, next) => {
const conn = new msSql.ConnectionPool(config.dbConfig);
conn
  .connect()
  .then(() => {
    const sql = new msSql.Request(conn);
    sql
      .query(
        "SELECT blc_id, blc_code, blc_votersCount, blc_maleVotersCount, blc_femaleVotersCount, blc_familiesCount, "+
        "plc_nameUrdu as pollingLocation, ela_nameUrdu as electoralArea, pollingStations = "+
        "STUFF((SELECT ', ' + CONVERT(NVARCHAR(512), pls_nameUrdu) FROM tbl_pollingstations ps  WHERE ps.plc_id = bc.plc_id FOR XML PATH('')), 1, 1, '') " +
        "FROM dbo.tbl_blockcodes as bc " +
        "left join tbl_electoralareas as ela on bc.ela_id = ela.ela_id "+
        "left join tbl_pollinglocations as plc on bc.plc_id = plc.plc_id "+
        "where blc_code = '"+ req.params.blockcode +"'"
      )
      .then((resutl) => {
        conn.close();
        if(resutl.recordset.length > 0){
            res.status(201).json({
                message: "Data is attached",
                item: resutl.recordset[0],
            });
        }
        else {
            res.status(201).json({
                message: "Data is Empty",
                item: null,
            });
        }
      })
      .catch(function (err) {
        console.log(err);
        conn.close();
        res.status(501).json({
          message: "Execution Failed",
        });
      });
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).json({
      message: "No Storage Connection",
    });
  });
};
