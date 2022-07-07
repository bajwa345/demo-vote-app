const msSql = require("mssql");
const util = require('util');
const config = require("../config/db.config.js");

exports.reportFoodIncharge = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        //console.log(util.inspect(req.body, {showHidden: false, depth: null, colors: true}));

        sql.input('icanid', msSql.VarChar(6), req.userData.canId);

        sql.execute('GetFoodInchargeReport')
        .then((result) => {
            conn.close();
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

exports.reportTransportIncharge = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        //console.log(util.inspect(req.body, {showHidden: false, depth: null, colors: true}));

        sql.input('icanid', msSql.VarChar(6), req.userData.canId);

        sql.execute('GetTransportInchargeReport')
        .then((result) => {
            conn.close();
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

exports.reportVoterReachability = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        //console.log(util.inspect(req.body, {showHidden: false, depth: null, colors: true}));

        sql.input('icanid', msSql.VarChar(6), req.userData.canId);

        sql.execute('GetVoterReachabilityReport')
        .then((result) => {
            conn.close();
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

exports.reportWorkersCampaignSummary = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        //console.log(util.inspect(req.body, {showHidden: false, depth: null, colors: true}));

        sql.input('icanid', msSql.VarChar(6), req.userData.canId);

        sql.execute('GetWorkersCampaignSummaryReport')
        .then((result) => {
            conn.close();
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

exports.updateFoodInchargeDetails = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    //console.log("update food incharge details " + req.body.plsId);
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
            //console.log(util.inspect(resultSet.rowsAffected, {showHidden: false, depth: null, colors: true}));
            conn.close();

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
