const msSql = require("mssql");
const util = require('util');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const iauth = require("../config/auth.js");
const config = require("../config/db.config.js");


exports.signIn = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    //console.log("--- " + JSON.stringify(req.body, null, 6));

    let fetchedUser;
    conn.connect().then(() => {

        const sql = new msSql.Request(conn);
        sql.query(
            "select aur_id, aur_userName, aur_password, aur_fullName, aur_cnic, aur_email, aur_mobile, aur_whatsApp, " +
            "cn.cn_id, cn_name, cn_image, cn_party, cn_symbol, cn_constituencytype, cn_constituencyname, cn_details, cn_details_area "+
            "from tbl_appusers as us " +
            "left join tbl_candidates as cn on us.cn_id = cn.cn_id "+
            "where aur_isManager = 1 and aur_isActive = 1 and aur_userName ='" + req.body.username + "';"
        )
        .then((resultSet) => {
            if (resultSet.recordset == null || resultSet.recordset.length === 0 ) {
                conn.close();
                res.status(404).json({
                    message: "User not found",
                });
                return;
            }
            fetchedUser = resultSet.recordset[0];

            ///comparing bcrypting////
            /*return bcrypt.compare(
              req.body.password,
              fetchedUser.aur_password
            ); */

            //console.log("+++" + req.body.password + "==" + fetchedUser.aur_password);

            if(req.body.password == fetchedUser.aur_password) return true;
            else return false;
        })
        .then((result) => {

            conn.close();
            if (!result) {
              res.status(404).json({
                message: "Invalid password",
              });
              return;
            }

            //const accessToken = jwt.sign({ username: fetchedUser.aur_userName, userid: fetchedUser.aur_id }, "meri-app-ka-secret-hae-ye", {expiresIn: "1h"});

            const user = {
                id: fetchedUser.aur_id,
                username: fetchedUser.aur_userName,
                name: fetchedUser.aur_fullName,
                email: fetchedUser.aur_email,
                mobile: fetchedUser.aur_mobile,
                whatsapp: fetchedUser.aur_whatsApp,
                cnic: fetchedUser.aur_cnic,
                avatar: "assets/images/avatars/" + fetchedUser.cn_image,
                candidateid: fetchedUser.cn_id,
                candidate: fetchedUser.cn_name,
                candidatedetail: fetchedUser.cn_details,
                candidatedetailarea: fetchedUser.cn_details_area,
                party: fetchedUser.cn_party,//pti, pmln, ppp, juif, azaad
                symbol: fetchedUser.cn_symbol,//bat, tiger, arrow, book, {{anything}}
                level: fetchedUser.cn_constituencytype,//na, pa, uc, dc, tc
                constituency: fetchedUser.cn_constituencyname,
                status: 'online'
            };

            //console.log("--- " + JSON.stringify(user, null, 6));
            res.status(200).json({
                user       : user,
                accessToken: iauth.generateJWTToken(fetchedUser.aur_id, fetchedUser.aur_userName, fetchedUser.cn_id),
                tokenType  : 'bearer'
            });

            ////sending back response////
			/*res.status(200).json({
                accessToken: accessToken, //iauth.generateJWTToken(), //accessToken,
                expiresIn: 3600,
                userId: fetchedUser.aur_id,
                userName: fetchedUser.aur_userName,
                fullName: fetchedUser.aur_fullName,
                email: "",
                avatar: "",
                candidateName: fetchedUser.aur_userName,
                party: "",
                symbol: "",
                level: "",
                constituency: ""
            });*/
        })
        .catch((err) => {
            console.log(err);
            conn.close();
            res.status(404).json({
              message: "Execution Failed",
            });
        });
    })
    .catch(function (err) {
        console.log(err);
        res.status(404).json({
          message: "No Storage Connection",
        });
    });
}

exports.signUp = (req, res, next) => {
    //const conn = new msSql.ConnectionPool(config.dbConfig);

}

exports.forgetPassword = (req, res, next) => {
  //const conn = new msSql.ConnectionPool(config.dbConfig);

}

exports.resetPassword = (req, res, next) => {
  //const conn = new msSql.ConnectionPool(config.dbConfig);

}

exports.refreshAccessToken = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    //console.log("--- " + JSON.stringify(req.body, null, 6));

    let fetchedUser;
    conn.connect().then(() => {

        const sql = new msSql.Request(conn);
        sql.query(
            "select aur_id, aur_userName, aur_password, aur_fullName, aur_cnic, aur_email, aur_mobile, aur_whatsApp, " +
            "cn.cn_id, cn_name, cn_image, cn_party, cn_symbol, cn_constituencytype, cn_constituencyname, cn_details, cn_details_area "+
            "from tbl_appusers as us " +
            "left join tbl_candidates as cn on us.cn_id = cn.cn_id "+
            "where aur_isManager = 1 and aur_isActive = 1 and aur_id ='" + req.userData.userId + "';"
        )
        .then((resultSet) => {

            if (resultSet.recordset == null || resultSet.recordset.length === 0 ) {
                conn.close();
                res.status(404).json({
                  message: "User not found",
                });
                return;
            }
            fetchedUser = resultSet.recordset[0];
            return true;
        })
        .then((result) => {

            conn.close();

            const user = {
                id: fetchedUser.aur_id,
                username: fetchedUser.aur_userName,
                name: fetchedUser.aur_fullName,
                email: fetchedUser.aur_email,
                mobile: fetchedUser.aur_mobile,
                whatsapp: fetchedUser.aur_whatsApp,
                cnic: fetchedUser.aur_cnic,
                avatar: "assets/images/avatars/" + fetchedUser.cn_image,
                candidateid: fetchedUser.cn_id,
                candidate: fetchedUser.cn_name,
                candidatedetail: fetchedUser.cn_details,
                candidatedetailarea: fetchedUser.cn_details_area,
                party: fetchedUser.cn_party,//pti, pmln, ppp, juif, azaad
                symbol: fetchedUser.cn_symbol,//bat, tiger, arrow, book, {{anything}}
                level: fetchedUser.cn_constituencytype,//na, pa, uc, dc, tc
                constituency: fetchedUser.cn_constituencyname,
                status: 'online'
            };

            res.status(200).json({
                user       : user,
                accessToken: iauth.generateJWTToken(fetchedUser.aur_id, fetchedUser.aur_userName, 2),
                tokenType  : 'bearer'
            });
        })
        .catch((err) => {
            console.log(err);
            conn.close();
            res.status(404).json({
              message: "Execution Failed",
            });
        });
    })
    .catch(function (err) {
        console.log(err);
        res.status(404).json({
          message: "No Storage Connection",
        });
    });
}

exports.getLoggedInUser = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    let fetchedUser;
    conn.connect().then(() => {

        const sql = new msSql.Request(conn);
        sql.query(
            "select aur_id, aur_userName, aur_password, aur_fullName, aur_cnic, aur_email, aur_mobile, aur_whatsApp, " +
            "cn.cn_id, cn_name, cn_image, cn_party, cn_symbol, cn_constituencytype, cn_constituencyname, cn_details, cn_details_area "+
            "from tbl_appusers as us " +
            "left join tbl_candidates as cn on us.cn_id = cn.cn_id "+
            "where aur_isManager = 1 and aur_isActive = 1 and aur_id ='" + req.userData.userId + "';"
        )
        .then((resultSet) => {

            if (resultSet.recordset == null || resultSet.recordset.length === 0 ) {
                conn.close();
                res.status(404).json({
                  message: "User not found",
                });
                return;
            }
            fetchedUser = resultSet.recordset[0];
            return true;
        })
        .then((result) => {

            conn.close();
            res.status(200).json({
                id: fetchedUser.aur_id,
                username: fetchedUser.aur_userName,
                name: fetchedUser.aur_fullName,
                email: fetchedUser.aur_email,
                mobile: fetchedUser.aur_mobile,
                whatsapp: fetchedUser.aur_whatsApp,
                cnic: fetchedUser.aur_cnic,
                avatar: "assets/images/avatars/" + fetchedUser.cn_image,
                candidateid: fetchedUser.cn_id,
                candidate: fetchedUser.cn_name,
                candidatedetail: fetchedUser.cn_details,
                candidatedetailarea: fetchedUser.cn_details_area,
                party: fetchedUser.cn_party,//pti, pmln, ppp, juif, azaad
                symbol: fetchedUser.cn_symbol,//bat, tiger, arrow, book, {{anything}}
                level: fetchedUser.cn_constituencytype,//na, pa, uc, dc, tc
                constituency: fetchedUser.cn_constituencyname,
                status: 'online'
            });
        })
        .catch((err) => {
            console.log(err);
            conn.close();
            res.status(404).json({
              message: "Execution Failed",
            });
        });
    })
    .catch(function (err) {
        console.log(err);
        res.status(404).json({
          message: "No Storage Connection",
        });
    });
}
