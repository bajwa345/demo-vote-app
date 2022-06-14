const msSql = require("mssql");
const util = require('util');
const config = require("../config/db.config.js");

exports.listPollingLocationHeads = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);
    conn
      .connect()
      .then(() => {
        const sql = new msSql.Request(conn);
        sql
          .query(
            "select pl.plc_id as id, plc_nameUrdu as name, sum(pls_votersCount) as votersCount, sum(pls_boothsCount) as boothsCount, pli_inchargeCnic as inchargeCnic "+
            "from dbo.tbl_pollinglocations as pl left join dbo.tbl_pollingstations as ps on pl.plc_id = ps.plc_id "+
            "left join dbo.tbl_pollinglocationsincharges as pli on pli.plc_id = ps.plc_id and cn_id = '"+req.userData.canId+"' "+
            //"where uc_id = '"+ req.params.pollingstationid +"' and pag.cn_id = '"+ req.userData.canId +"'"
            "group by pl.plc_id, plc_nameUrdu, pli_inchargeCnic order by pl.plc_id asc"
          )
          .then((result) => {
            conn.close();
            //console.log(result.recordset.length);

            if(result.recordset.length > 0){
                res.status(201).json({
                    message: "Data is attached",
                    items: result.recordset,
                    rows_count: result.recordset != null && result.recordset.length > 0 ? result.recordset[0].totalrows : 0
                });
            }
            else {
                res.status(201).json({
                    message: "Data is Empty",
                    items: null,
                    rows_count: 0
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

exports.getPollingLocationDetails = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        //console.log(util.inspect(req.body, {showHidden: false, depth: null, colors: true}));

        sql.input('icanid', msSql.VarChar(6), req.userData.canId);
        if(req.params.pollinglocationid && req.params.pollinglocationid != ''){
            sql.input('iplcid', msSql.VarChar(6), req.params.pollinglocationid);
        }

        //console.log("polling location details");
        sql.execute('GetPollingLocationDetails')
        .then((result) => {
            conn.close();
            //console.log(util.inspect(result, {showHidden: false, depth: null, colors: true}));

            const resObject = {
                pollinglocation: result.recordsets[0][0],
                pollingstations: result.recordsets[1],
            }
            res.status(201).json({
                message: "Data is Attached",
                item: resObject
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

exports.updatePollingLocationDetails = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    //console.log("update polling location details " + req.body.plcId);
    //console.log(util.inspect(req.body, {showHidden: false, depth: null, colors: true}));

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        let queri = '';
        if(req.body.inchargeCnic.length < 13){
            queri = "delete from dbo.tbl_pollinglocationsincharges "+
            "where plc_id = '"+req.body.plcId+"' and cn_id = '"+req.userData.canId+"'";
        }
        else{
            queri = "BEGIN TRANSACTION "+
            "    IF (EXISTS (SELECT * FROM tbl_pollinglocationsincharges WHERE plc_id = '"+req.body.plcId+"' and cn_id = '"+req.userData.canId+"')) "+
            "        update pli "+
            "        set pli.pli_inchargeCnic = '"+req.body.inchargeCnic+"', "+
            "            pli.pli_updateTime = SYSDATETIME() "+
            "        from tbl_pollinglocationsincharges pli "+
            "        where pli.plc_id = '"+req.body.plcId+"' and pli.cn_id = '"+req.userData.canId+"' "+
            "    ELSE "+
            "        insert into tbl_pollinglocationsincharges (cn_id, plc_id, pli_inchargeCnic, pli_updateTime) VALUES "+
            "        ('"+req.userData.canId+"', '"+req.body.plcId+"', '"+req.body.inchargeCnic+"', SYSDATETIME())"+
            "COMMIT TRANSACTION";
        }

        sql.query(queri)
        .then((resultSet) => {
            conn.close();

            //console.log(util.inspect(resultSet.rowsAffected, {showHidden: false, depth: null, colors: true}));

            if (resultSet.rowsAffected.length === 0 || (resultSet.rowsAffected.length > 0 && resultSet.rowsAffected[0] === 0)) {
                res.status(200).json({
                    type: "error",
                    message: "Something went wrong on Data server",
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
