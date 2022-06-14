const msSql = require("mssql");
const util = require('util');
const config = require("../config/db.config.js");

exports.listPollingStations = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    let fromRow = parseInt(req.body.fromRow) || 1;
    let toRow = parseInt(req.body.toRow) || 25;

    let sortColumn = req.body.sortColumn == null || req.body.sortColumn == '' ? '' : req.body.sortColumn;
    let sortOrder = req.body.sortOrder == null || req.body.sortOrder == '' ? 'asc' : req.body.sortOrder;

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        //console.log(util.inspect(req.body, {showHidden: false, depth: null, colors: true}));

        sql.input('icanid', msSql.VarChar(6), req.userData.canId);
        if(req.body.ipaconstituency){
            sql.input('ipaconstituency', msSql.VarChar(4), req.body.ipaconstituency);
        }
        if(req.body.iucconstituency){
            sql.input('iucconstituency', msSql.VarChar(4), req.body.iucconstituency);
        }
        if(req.body.ipollinglocationid){
            sql.input('ipollinglocationid', msSql.VarChar(6), req.body.ipollinglocationid);
        }
        if(req.body.isearchtype && req.body.isearchtype != ''){
            sql.input('isearchtype', msSql.VarChar(1), req.body.isearchtype);
        }

        sql.input('StartRowNum', msSql.Int, fromRow);
        sql.input('EndRowNum', msSql.Int, toRow);
        sql.input('sortColumn', msSql.VarChar(63), sortColumn);
        sql.input('sortOrder', msSql.VarChar(5), sortOrder);
        sql.input('searchStr', msSql.VarChar(127), req.body.search);

        //console.log("list pollingstations");
        sql.execute('GetPollingStationsList')
        .then((result) => {
            conn.close();

            //console.log("pollingstations count " + result.recordset.length );
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

exports.getPollingStationDetails = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);
    conn
      .connect()
      .then(() => {
        const sql = new msSql.Request(conn);
        sql
          .query(
            "SELECT ps.pls_id, pls_nameUrdu as pls_name, pls_type, pls_votersCount, pls_maleVotersCount, pls_femaleVotersCount, "+
            "pls_boothsCount, pls_maleBoothsCount, pls_femaleBoothsCount, "+
            "pls_blockcodes = STUFF((SELECT ', ' + CONVERT(VARCHAR(16), bc.blc_code) FROM tbl_blockcodes as bc inner join tbl_blockcodespollingstations as bu on bc.blc_id = bu.blc_id and bu.pls_id = ps.pls_id order by bc.blc_id FOR XML PATH('')), 1, 1, ''), "+
            "pls_electoralareas = STUFF((SELECT ', ' + CONVERT(NVARCHAR(128), ea.ela_nameUrdu) FROM tbl_electoralareas as ea inner join tbl_blockcodes as bc on bc.ela_id = ea.ela_id inner join tbl_blockcodespollingstations as bu on bc.blc_id = bu.blc_id and bu.pls_id = ps.pls_id order by bc.blc_id FOR XML PATH('')), 1, 1, ''), "+
            "pls_pollingagents = STUFF((SELECT ', ' + CONVERT(VARCHAR(16), pa.pag_cnic) FROM tbl_pollingagents as pa where pa.pls_id = ps.pls_id and pa.cn_id = '"+ req.userData.canId +"' FOR XML PATH('')), 1, 1, '') "+
            "from tbl_pollingstations as ps "+
            "where ps.pls_id = '"+ req.params.pollingstationid +"'"
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

exports.updatePollingStationDetails = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    //console.log("update polling station details " + req.body.plsId);
    //console.log(util.inspect(req.body, {showHidden: false, depth: null, colors: true}));

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        let queri = '';
        if(req.body.inchargeCnic.length < 13){
            queri = "update psi "+
            "set psi.psi_inchargeCnic = '', "+
            "psi.psi_inchargeName = '', psi.psi_inchargeMobile = '', psi.psi_updateTime = SYSDATETIME() "+
            "from tbl_pollingstationsincharges psi "+
            "join tbl_pollingstations pls on pls.pls_id = psi.pls_id "+
            "where psi.pls_id = '"+req.body.plsId+"' and psi.cn_id = '"+req.userData.canId+"'";
        }
        else{
            queri = "BEGIN TRANSACTION "+
            "    IF (EXISTS (SELECT * FROM tbl_pollingstationsincharges WHERE pls_id = '"+req.body.plsId+"' and cn_id = '"+req.userData.canId+"')) "+
            "        update psi "+
            "        set psi.psi_inchargeCnic = '"+req.body.inchargeCnic+"', "+
            "            psi.psi_inchargeName = vtr.vtr_nameText, "+
            "            psi.psi_inchargeMobile = '"+req.body.inchargeMobile+"', "+
            "            psi.psi_updateTime = SYSDATETIME() "+
            "        from tbl_pollingstationsincharges psi "+
            "        join tbl_pollingstations pls on pls.pls_id = psi.pls_id "+
            "        join tbl_voterdetails vtr on vtr.vtr_cnic = '"+req.body.inchargeCnic+"' "+
            "        where vtr.vtr_id is not null and psi.pls_id = '"+req.body.plsId+"' and psi.cn_id = '"+req.userData.canId+"' "+
            "    ELSE "+
            "        insert into tbl_pollingstationsincharges (cn_id, pls_id, psi_inchargeCnic, psi_inchargeName, psi_inchargeMobile, psi_updateTime) "+
            "        select '"+req.userData.canId+"', '"+req.body.plsId+"', '"+req.body.inchargeCnic+"', vtr_nameText, '"+req.body.inchargeMobile+"', SYSDATETIME() from tbl_voterdetails where vtr_cnic = '"+req.body.inchargeCnic+"' "+
            "COMMIT TRANSACTION";
        }

        sql.query(queri)
        .then((resultSet) => {
            conn.close();

            //console.log(util.inspect(resultSet.rowsAffected, {showHidden: false, depth: null, colors: true}));

            if (resultSet.rowsAffected.length === 0 || (resultSet.rowsAffected.length > 0 && resultSet.rowsAffected[0] === 0)) {
                res.status(200).json({
                    type: "error",
                    message: "Voter against CNIC is not found",
                });
            }
            else{
                res.status(200).json({
                    type: "success",
                    message: "Operation Successfull",
                });
            }
        })
        .catch((err) => {
            console.log(err);
            conn.close();
            res.status(500).json({
              type: "error",
              message: "Execution Failed",
            });
        });
    })
    .catch(function (err) {
        console.log(err);
        res.status(500).json({
          type: "error",
          message: "No Storage Connection",
        });
    });
}
