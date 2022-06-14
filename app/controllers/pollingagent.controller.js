const msSql = require("mssql");
const util = require('util');
const config = require("../config/db.config.js");

exports.listPollingAgents = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    let fromRow = parseInt(req.body.fromRow) || 1;
    let toRow = parseInt(req.body.toRow) || 25;

    let sortColumn = req.body.sortColumn == null || req.body.sortColumn == '' ? '' : req.body.sortColumn;
    let sortOrder = req.body.sortOrder == null || req.body.sortOrder == '' ? 'desc' : req.body.sortOrder;

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
        if(req.body.iagentcnicnumber){
            sql.input('iagentcnicnumber', msSql.VarChar(15), req.body.iagentcnicnumber);
        }
        if(req.body.isearchtype && req.body.isearchtype != ''){
            sql.input('isearchtype', msSql.VarChar(1), req.body.isearchtype);
        }

        sql.input('StartRowNum', msSql.Int, fromRow);
        sql.input('EndRowNum', msSql.Int, toRow);
        sql.input('sortColumn', msSql.VarChar(63), sortColumn);
        sql.input('sortOrder', msSql.VarChar(5), sortOrder);
        sql.input('searchStr', msSql.VarChar(127), req.body.search);

        //console.log("list polling agents");
        sql.execute('GetPollingAgentsList')
        .then((result) => {
            conn.close();
            //console.log("polling agents count " + result.recordset.length );

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

exports.getPollingAgentsList = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);
    conn
      .connect()
      .then(() => {
        const sql = new msSql.Request(conn);
        sql
          .query(
            "select ps.pls_id, ps.pls_nameUrdu as pls_name, pls_type, vt.vtr_id, vt.vtr_cnic, vtr_nameText as vtr_nameUrdu, vtr_fatherText as vtr_fatherUrdu, vtr_addressText as vtr_addressUrdu, vtr_mobile, vtr_mobile2, vtr_mobile3, "+
            "case when vtr_gender = 'M' then N'مرد' when vtr_gender = 'F' then N'عورت' else N'دیگر' end as vtr_genderUrdu, "+
            "case when vtr_nameText is NULL OR vtr_nameText = '' then cast('' as xml).value('xs:base64Binary(sql:column(\"vtr_nameBlob\"))', 'varchar(max)') else NULL end as vtr_nameBlob, "+
            "case when vtr_fatherText is NULL OR vtr_fatherText = '' then cast('' as xml).value('xs:base64Binary(sql:column(\"vtr_fatherBlob\"))', 'varchar(max)') else NULL end as vtr_fatherBlob, "+
            "case when vtr_addressText is NULL OR vtr_addressText = '' then cast('' as xml).value('xs:base64Binary(sql:column(\"vtr_addressBlob\"))', 'varchar(max)') else NULL end as vtr_addressBlob "+
            "from dbo.tbl_pollingstations as ps "+
            "left join dbo.tbl_pollingagents as pag on ps.pls_id = pag.pls_id "+
            "left join dbo.tbl_voterdetails as vt on pag.pag_cnic = vt.vtr_cnic "+
            "left join dbo.tbl_voterdetailsblobs as vb on vt.vtr_cnic = vb.vtr_cnic "+
            "where ps.pls_id = '"+ req.params.pollingstationid +"' and pag.cn_id = '"+ req.userData.canId +"'"
          )
          .then((result) => {
            conn.close();
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

exports.updatePollingAgents = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    //console.log("update polling agents " + req.body.plsId);
    //console.log(util.inspect(req.body, {showHidden: false, depth: null, colors: true}));

    let _cnicp1 = req.body.cnicp1;
    let _cnicp2 = req.body.cnicp2;
    let _cnicp3 = req.body.cnicp3;

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        //delete all existing polling agents for plsId, then insert all if not null or empty -- best if SP
        sql.query("DELETE FROM dbo.tbl_pollingagents WHERE pls_id = '"+req.body.plsId+"' AND cn_id = '"+req.userData.canId+"'")
        .then((resultSet) => {

            if(!_cnicp1 && !_cnicp2 && !_cnicp3){
                res.status(200).json({
                    type: "success",
                    message: "Operation Successfull",
                });
                return;
            }

            if(!_cnicp2 && _cnicp3) {
                _cnicp2 = _cnicp3; _cnicp3 = '';
            }

            if(!_cnicp1 && _cnicp2) {
                _cnicp1 = _cnicp2; _cnicp2 = '';
            }

            //console.log("-"+_cnicp1+"-"+_cnicp2+"-"+_cnicp3+"-");

            let queri = "INSERT INTO dbo.tbl_pollingagents (pls_id, pag_cnic, cn_id, pag_updateTime) VALUES ";
            if(_cnicp1 != '') queri += " ('"+req.body.plsId+"', '"+_cnicp1+"' , '"+req.userData.canId+"', SYSDATETIME())";
            if(_cnicp2 != '') queri += ",('"+req.body.plsId+"', '"+_cnicp2+"' , '"+req.userData.canId+"', SYSDATETIME())";
            if(_cnicp3 != '') queri += ",('"+req.body.plsId+"', '"+_cnicp3+"' , '"+req.userData.canId+"', SYSDATETIME())";

            sql.query(queri)
            .then((resultSet) => {
                conn.close();

                //console.log(util.inspect(resultSet.rowsAffected, {showHidden: false, depth: null, colors: true}));

                res.status(200).json({
                    type: "success",
                    message: "Operation Successfull",
                });
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
        .catch((err) => {
            console.log(err);
            conn.close();
            res.status(500).json({
              type: "error",
              message: "Execution Failed",
            });
        });




        //let queri = '';
        /*if(req.body.inchargeCnic.length < 13){
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
            console.log(util.inspect(resultSet.rowsAffected, {showHidden: false, depth: null, colors: true}));
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
        });*/
    })
    .catch(function (err) {
        console.log(err);
        res.status(500).json({
          type: "error",
          message: "No Storage Connection",
        });
    });
}
