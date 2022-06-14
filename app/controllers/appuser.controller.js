const msSql = require("mssql");
const util = require('util');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/db.config.js");


exports.listAppUsers = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    let fromRow = parseInt(req.body.fromRow) || 1;
    let toRow = parseInt(req.body.toRow) || 25;

    let sortColumn = req.body.sortColumn == null || req.body.sortColumn == '' ? '' : req.body.sortColumn;
    let sortOrder = req.body.sortOrder == null || req.body.sortOrder == '' ? 'desc' : req.body.sortOrder;

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        sql.input('icanid', msSql.VarChar(6), req.userData.canId);
        if(req.body.ipaconstituency && req.body.ipaconstituency != ''){
            sql.input('ipaconstituency', msSql.VarChar(4), req.body.ipaconstituency);
        }
        if(req.body.iucconstituency && req.body.iucconstituency != ''){
            sql.input('iucconstituency', msSql.VarChar(4), req.body.iucconstituency);
        }
        if(req.body.ipollinglocationid && req.body.ipollinglocationid != ''){
            sql.input('ipollinglocationid', msSql.VarChar(6), req.body.ipollinglocationid);
        }
        if(req.body.ielectoralareaid && req.body.ielectoralareaid != ''){
            sql.input('ielectoralareaid', msSql.VarChar(6), req.body.ielectoralareaid);
        }
        if(req.body.icnic){
            sql.input('icnic', msSql.VarChar(15), req.body.icnic);
        }
        if(req.body.imobile){
            sql.input('imobile', msSql.VarChar(15), req.body.imobile);
        }
        if(req.body.iaccesslevel && req.body.iaccesslevel != ''){
            sql.input('iaccesslevel', msSql.VarChar(1), req.body.iaccesslevel);
        }
        if(req.body.iuserstatus && req.body.iuserstatus != ''){
            sql.input('iuserstatus', msSql.VarChar(1), req.body.iuserstatus);
        }

        sql.input('StartRowNum', msSql.Int, fromRow);
        sql.input('EndRowNum', msSql.Int, toRow);
        sql.input('sortColumn', msSql.VarChar(63), sortColumn);
        sql.input('sortOrder', msSql.VarChar(5), sortOrder);
        sql.input('searchStr', msSql.VarChar(127), req.body.search);

        //console.log("list app users");
        sql.execute('GetAppUsersList')
        .then((result) => {
            conn.close();
            //console.log("app users count " + result.recordset.length );

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
}

exports.newAppUser = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        let _elaId = req.body.elaId && req.body.elaId > 0 ? req.body.elaId : 'NULL';
        let _plcId = req.body.plcId && req.body.plcId > 0 ? req.body.plcId : 'NULL';
        let _whatsApp = req.body.whatsAppNumber && req.body.whatsAppNumber > 0 ? req.body.whatsAppNumber : 'NULL';

        bcrypt.hash(req.body.password, 10).then((hash) => {
        sql.query(
              "INSERT INTO tbl_appusers([aur_userName], [aur_password], [aur_isManager], [aur_accessLevel], [plc_id], [ela_id], [aur_fullName], [aur_isActive], [aur_cnic], [aur_mobile], [aur_whatsApp], [cn_id], [aur_signUpTime]) values ('" +
                req.body.userName +"','" +
                req.body.password + "','" + //hash
                "0', '" +
                req.body.accesslevel + "'," +
                _plcId + "," +
                _elaId + ",'" +
                req.body.fullName +"','" +
                "1', '" +
                req.body.cnicNumber +"','" +
                req.body.userName +"'," +
                _whatsApp +",'" +
                req.userData.canId + "', SYSDATETIME())"
            )
            .then((resultSet) => {
                //console.log(util.inspect(resultSet.rowsAffected, {showHidden: false, depth: null, colors: true}));
                conn.close();

                if (resultSet.rowsAffected.length === 0 || (resultSet.rowsAffected.length > 0 && resultSet.rowsAffected[0] === 0)) {
                    res.status(500).json({
                        type: "error",
                        message: "Operation Failed",
                    });
                }
                else {
                    //send sms message for app link and credentials

                    res.status(200).json({
                        type: "success",
                        message: "Operation Successfull",
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
        });
    })
    .catch(function (err) {
        console.log(err);
        res.status(500).json({
            message: "No Storage Connection",
        });
    });
}

exports.updateAppUser = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        let _elaId = req.body.elaId && req.body.elaId != '' && req.body.elaId > 0 ? req.body.elaId : 'NULL';
        let _plcId = req.body.plcId && req.body.plcId != '' && req.body.plcId > 0 ? req.body.plcId : 'NULL';
        let _whatsApp = req.body.whatsAppNumber && req.body.whatsAppNumber != '' && req.body.whatsAppNumber > 0 ? req.body.whatsAppNumber : 'NULL';

        //console.log(util.inspect(req.body, {showHidden: false, depth: null, colors: true}));

        sql.query(
          "UPDATE tbl_appusers SET " +
            "aur_cnic = '"+ req.body.cnicNumber +"', " +
            "aur_fullName = '"+ req.body.fullName +"', " +
            "aur_whatsApp = '"+ _whatsApp +"', " +
            "aur_isActive = "+ (req.body.isActive ? '1' : '0') +", " +
            "aur_accessLevel = '"+ req.body.accesslevel +"', " +
            "plc_id = "+ _plcId +", " +
            "ela_id = "+ _elaId +" " +
            "WHERE aur_id = '"+ req.body.userId +"'"
        )
        .then((resultSet) => {
            conn.close();

            //console.log(util.inspect(resultSet.rowsAffected, {showHidden: false, depth: null, colors: true}));

            if (resultSet.rowsAffected.length === 0 || (resultSet.rowsAffected.length > 0 && resultSet.rowsAffected[0] === 0)) {
                res.status(500).json({
                    type: "error",
                        message: "Operation Failed",
                });
            }
            else {
                //send sms message for app link and credentials

                res.status(200).json({
                    type: "success",
                    message: "Operation Successfull",
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
}

exports.resetAppUserPassword = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        bcrypt.hash(req.body.password, 10).then((hash) => {
            sql.query(
                "UPDATE tbl_appusers SET aur_password = '"+ req.body.password +"' WHERE aur_id = '"+ req.body.userId +"'"
            )
            .then((resultSet) => {
                conn.close();

                //console.log(util.inspect(resultSet.rowsAffected, {showHidden: false, depth: null, colors: true}));

                if (resultSet.rowsAffected.length === 0 || (resultSet.rowsAffected.length > 0 && resultSet.rowsAffected[0] === 0)) {
                    res.status(500).json({
                        type: "error",
                        message: "Operation Failed",
                    });
                }
                else {
                    //send sms message for password update

                    res.status(200).json({
                        type: "success",
                        message: "Operation Successfull",
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
        });
    })
    .catch(function (err) {
        console.log(err);
        res.status(500).json({
            message: "No Storage Connection",
        });
    });
}

exports.registerUser = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);
}
