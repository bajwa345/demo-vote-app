const msSql = require("mssql");
const util = require('util');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/db.config.js");
const {reduce}=require("lodash");


exports.appSignIn = (req, res, next) => {
    //res.setHeader('Access-Control-Allow-Origin', '*');
    //res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH');
    //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    //res.setHeader('Access-Control-Allow-Credentials', true);

    const conn = new msSql.ConnectionPool(config.dbConfig);
    console.log("login user " + req.body.username);

    let fetchedUser;
    conn.connect().then(() => {
        const sql = new msSql.Request(conn);
        sql.query(
            "select * from tbl_appusers as u inner join tbl_candidates as c on u.cn_id = c.cn_id where aur_isManager = 0 and aur_isActive = 1 and aur_userName ='" +
            req.body.username + "';"
        )
        .then((resultSet) => {

            if (resultSet.recordset.length === 0 ) {
                conn.close();
                res.status(401).json({
                    message: "User not found",
                });
                return;
            }
            ////for token usage////
            fetchedUser = resultSet.recordset[0];

            ///comparing bcrypting////
            /*return bcrypt.compare(
              req.body.password,
              fetchedUser.aur_password
            ); */

            if(req.body.password == fetchedUser.aur_password) return true;
            else return false;
        })
        .then((result) => {

            if (!result) {
                conn.close();
                res.status(401).json({
                    message: "Invalid password",
                });
                return;
            }

            const accessToken = jwt.sign({ username: fetchedUser.aur_userName, userid: fetchedUser.aur_id }, "meri-app-ka-secret-hae-ye", {expiresIn: "1h"});

            conn.close();

            ////sending back response////
			res.status(200).json({
                accessToken: accessToken,
                expiresIn: 3600,
                userId: fetchedUser.aur_id,
                userName: fetchedUser.aur_userName,
                userFullname: fetchedUser.aur_fullName,
                password: fetchedUser.aur_password,
                userRole: fetchedUser.aur_role, //manager, supervisor, worker
                userCnic: fetchedUser.aur_cnic,
                candidateName: "مخدوم زین قریشی",//fetchedUser.cn_name,
                candidateParty: fetchedUser.cn_party, //pti, pmln, ppp, juif, azaad
                candidateSymbol: fetchedUser.cn_symbol, //bat, tiger, arrow, book, {{anything}}
                candidateDetail: fetchedUser.cn_details,
                candidateArea: fetchedUser.cn_details_area,
                appDeathTime: fetchedUser.cn_licenseExpiry,
                totalVotes : 483914,
                totalFamilies : 101823,
                totalBlockCodes : 423,
                totalPollingStations : 360,
                totalCheckedVotes : 210510,
                totalReachableVotes : 90110
            });
        })
        .catch((err) => {
            console.log(err);
            conn.close();
            res.status(500).json({
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

async function getUserIdFromUsername(username){

    return new Promise((resolve, reject)=>{
        const conn = new msSql.ConnectionPool(config.dbConfig);

        conn.connect().then(pool => {
            pool.query(
                "select * from tbl_appusers where aur_isManager = 0 and aur_isActive = 1 and aur_userName ='" + username + "';"
            )
            .then((resultSet) => {
                conn.close();

                if (resultSet.recordset.length > 0) resolve(resultSet.recordset[0].aur_id);
                else resolve(null);
            })
            .catch((err) => {
                console.log(err);
                conn.close();
                resolve(null);
            });
        })
        .catch(function (err) {
            console.log(err);
            resolve(null);
        });
    });
}

async function getCandidateFromAppcode(appcode) {

    return new Promise((resolve, reject)=>{
        const conn = new msSql.ConnectionPool(config.dbConfig);

        conn.connect().then(pool => {
            pool.query(
                "select * from tbl_candidates where cn_isActive = '1' and cn_licenseCode ='"+ appcode +"';"
            )
            .then((resultSet) => {
                conn.close();
                //console.log(util.inspect(resultSet, {showHidden: false, depth: null, colors: true}));

                if (resultSet.recordset.length > 0) resolve(resultSet.recordset[0]);
                else return resolve(null);
            })
            .catch((err) => {
                console.log(err);
                conn.close();
                resolve(null);
            });
        })
        .catch(function (err) {
            console.log(err);
            resolve(null);
        });
    });
}

exports.appSignUp = async (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);
    //console.log("sign up user " + req.body.username);

    let cnId;
    getCandidateIdFromAppcode(req.body.appcode).then( (_cnId) => {
        if(_cnId == null){
            //console.log("error - license expired");
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.status(401).json({
                message: "License is expired or not found",
            });
            return;
        }
        else cnId = _cnId;
    }).then(() => {

        getUserFromUsername(req.body.username).then( (_user) => {
            if(_user != null){
                //console.log("error - user already exists");
                res.setHeader('Access-Control-Allow-Origin', '*')
                res.status(401).json({
                    message: "App User already exists",
                });
                return;
            }
        }).then(() => {

            conn.connect().then(pool => {
                pool.query(
                    "INSERT INTO tbl_appusers ([aur_userName],[aur_password],[aur_isManager],[aur_fullName],[aur_isActive],[aur_cnic],[aur_mobile],[aur_whatsApp],[cn_id]) VALUES "+
                    "('" + req.body.username +"', '" + req.body.password +"', '0', '" + req.body.fullname +"', 0, '" + req.body.cnic +"', '" + req.body.mobile +"', '" + req.body.whatsappnumber +"', '" + cnId +"')"
                )
                .then((resultSet) => {
                    console.log(util.inspect(resultSet.rowsAffected, {showHidden: false, depth: null, colors: true}));

					if (resultSet.rowsAffected.length === 0 || (resultSet.rowsAffected.length > 0 && resultSet.rowsAffected[0] === 0)) {
						//console.log("error");
                        conn.close();
                        res.status(401).json({
                            message: "Signup Operation failed",
                        });
                    }
                    else{
                        //console.log("success");
                        conn.close();
                        res.status(200).json({
                            type: "success",
                            message: "App User added Successfully"
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                    conn.close();
                    res.status(500).json({
                    message: "Execution Failed",
                    });
                });
            })
            .catch(function (err) {
                //console.log(err);
                res.status(500).json({
                message: "No Storage Connection",
                });
            });
        });
    });
}

exports.appChangePassword = (req, res, next) => {
    //res.setHeader('Access-Control-Allow-Origin', '*');
    //res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH');
    //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    //res.setHeader('Access-Control-Allow-Credentials', true);

    const conn = new msSql.ConnectionPool(config.dbConfig);
    console.log("password changed " + req.body.username);

    let fetchedUser;
    conn.connect().then(() => {
        const sql = new msSql.Request(conn);
        sql.query(
            "select * from tbl_appusers where aur_isManager = 0 and aur_isActive = 1 and aur_userName ='" +
            req.body.username + "';"
        )
        .then((resultSet) => {

            if (resultSet.recordset.length === 0 ) {
                conn.close();
                res.status(401).json({
                    message: "User not found",
                });
                return;
            }
            ////for token usage////
            fetchedUser = resultSet.recordset[0];

            ///comparing bcrypting////
            /*return bcrypt.compare(
              req.body.password,
              fetchedUser.aur_password
            ); */

            if(req.body.password == fetchedUser.aur_password) return true;
            else return false;
        })
        .then((result) => {

            if (!result) {
                conn.close();
                res.status(401).json({
                    message: "Invalid password",
                });
                return;
            }

            sql.query(
                "update tbl_appusers set aur_password = "+ req.body.newpassword +" where aur_isManager = 0 and aur_isActive = 1 and aur_userName ='" +
                req.body.username +
                "';"
            )
            .then((resultSet) => {
                if (resultSet.rowsAffected.length === 0 || (resultSet.rowsAffected.length > 0 && resultSet.rowsAffected[0] === 0)) {
                res.status(401).json({
                        message: "Update Operation failed",
                    });
                }
                else{
                    console.log("success");
                    conn.close();
                    res.status(200).json({
                        type: "success",
                        message: "Password Updated Successfully"
                    });
                }
            })
            .catch((err) => {
              console.log(err);
              conn.close();
              res.status(401).json({
                message: "Operation failed",
              });
            });
        })
        .catch((err) => {
            console.log(err);
            conn.close();
            res.status(500).json({
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

exports.appForgetPassword = (req, res, next) => {
    //res.setHeader('Access-Control-Allow-Origin', '*');
    //res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH');
    //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    //res.setHeader('Access-Control-Allow-Credentials', true);

    const conn = new msSql.ConnectionPool(config.dbConfig);
    console.log("password forget " + req.body.username);

    let fetchedUser;
    conn.connect().then(() => {
        const sql = new msSql.Request(conn);
        sql.query(
            "select u.* from tbl_appusers as u inner join tbl_candidates as c on u.cn_id = c.cn_id where cn_licenseCode = '" + req.body.appcode + "' and cn_isActive = 1 and aur_isManager = 0 and aur_isActive = 1 and aur_userName ='" + req.body.username + "' and aur_cnic ='" + req.body.cnic + "'"
        )
        .then((resultSet) => {

            if (resultSet.recordset.length === 0 ) {
                conn.close();
                res.status(401).json({
                    message: "User not found",
                });
                return;
            }
            return true;
        })
        .then((result) => {

            sql.query(
                "update tbl_appusers set aur_password = "+ req.body.newpassword +" where aur_isManager = 0 and aur_isActive = 1 and aur_userName ='" +
                req.body.username +
                "';"
            )
            .then((resultSet) => {
                //console.log("success");
                conn.close();
                res.status(200).json({
                    type: "success",
                    message: "Password Updated Successfully"
                });
            })
            .catch((err) => {
              console.log(err);
              conn.close();
              res.status(401).json({
                message: "Operation failed",
              });
            });
        })
        .catch((err) => {
            console.log(err);
            conn.close();
            res.status(500).json({
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

exports.updateVoterPhones = (req, res, next) => {

    const conn = new msSql.ConnectionPool(config.dbConfig);
    console.log("update voter phones " + req.body.cnic);

    let fetchedUser;
    conn.connect().then(() => {
        const sql = new msSql.Request(conn);
        sql.query(
            "update tbl_voterdetails set vtr_mobile = '"+ req.body.phonenumber1 +"', vtr_mobile2 = '"+ req.body.phonenumber2 +"', vtr_whatsApp = '"+ req.body.whatsappnumber +"', vtr_mobileUpdateBy = '"+ req.body.userid +"', vtr_mobileUpdateTime = SYSDATETIME() where vtr_cnic = '"+ req.body.cnic +"';"
        )
        .then((resultSet) => {
            console.log(util.inspect(resultSet.rowsAffected, {showHidden: false, depth: null, colors: true}));
            conn.close();

            if (resultSet.rowsAffected.length === 0 || (resultSet.rowsAffected.length > 0 && resultSet.rowsAffected[0] === 0)) {
                res.status(401).json({
                    message: "Voter not found",
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

exports.updateVoterLocation = (req, res, next) => {

    const conn = new msSql.ConnectionPool(config.dbConfig);
    console.log("update voter locations " + req.body.cnic);

    let fetchedUser;
    conn.connect().then(() => {
        const sql = new msSql.Request(conn);
        sql.query(
            "update tbl_voterdetails set vtr_locLat = '"+ req.body.lati +"', vtr_locLong = '"+ req.body.longi +"', vtr_locUpdateBy = '"+ req.body.userid +"', vtr_locUpdateTime = SYSDATETIME() where vtr_cnic = '"+ req.body.cnic +"';"
        )
        .then((resultSet) => {
            console.log(util.inspect(resultSet.rowsAffected, {showHidden: false, depth: null, colors: true}));
            conn.close();

            if (resultSet.rowsAffected.length === 0 || (resultSet.rowsAffected.length > 0 && resultSet.rowsAffected[0] === 0)) {
                res.status(401).json({
                    message: "Voter not found",
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

exports.reportComplaint = (req, res, next) => {

    const conn = new msSql.ConnectionPool(config.dbConfig);
    console.log("report complaint by user " + req.body.user_id);

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);
        sql.query(
            "insert into tbl_reportedcomplaints (rpd_tag, rpd_details, usr_id, rpd_locLat, rpd_locLong, rpd_time, rpd_status) values ('"+ req.body.problem_tag +"', '"+ req.body.problem_details +"', '"+ req.body.user_id +"', '"+ req.body.lati +"', '"+ req.body.longi +"', SYSDATETIME(), 'new');"
        )
        .then((resultSet) => {
            console.log(util.inspect(resultSet.rowsAffected, {showHidden: false, depth: null, colors: true}));
            conn.close();

            if (resultSet.rowsAffected.length === 0 || (resultSet.rowsAffected.length > 0 && resultSet.rowsAffected[0] === 0)) {
                res.status(401).json({
                    message: "Operation Failed",
                });
            }
            else{
                console.log("success");
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

exports.downloadFamilyVotersDataByCnic = (req, res, next) => {
    //res.setHeader('Access-Control-Allow-Origin', '*');
    //res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH');
    //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    //res.setHeader('Access-Control-Allow-Credentials', true);

    const conn = new msSql.ConnectionPool(config.dbConfig);
    console.log("download family voters data api called " + req.params.cnic);
    let cnic = req.params.cnic;

  conn.connect()
  .then(() => {
    const sql = new msSql.Request(conn);

    //console.log("icnic --- " + cnic);
    if(cnic){
        sql.input('icnic', msSql.VarChar(15), cnic.replace(/-/g, '').replace(/ /g, ''));
    }

    sql.execute('API_GetVotersFamilyDataByCnic')
      .then((result) => {

        conn.close();

        console.log(result.recordset != null && result.recordset.length > 0 ? result.recordset[0].totalrows : 0);
        res.status(200).json({
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

exports.downloadBlockcodeVotersData = (req, res, next) => {
    //res.setHeader('Access-Control-Allow-Origin', '*');
    //res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH');
    //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    //res.setHeader('Access-Control-Allow-Credentials', true);

    const conn = new msSql.ConnectionPool(config.dbConfig);
    console.log("download blockcode voters data api called " + req.params.blockcode);
    let blockCode = req.params.blockcode;

  conn.connect()
  .then(() => {
    const sql = new msSql.Request(conn);

    //console.log("iblockcode --- " + blockCode);
    if(blockCode){
        sql.input('iblockcode', msSql.VarChar(15), blockCode);
    }

    sql.execute('API_GetBlockCodeVotersData')
      .then((result) => {

        conn.close();

        console.log(result.recordset != null && result.recordset.length > 0 ? result.recordset[0].totalrows : 0);
        res.status(200).json({
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

exports.downloadBlockcodeListData = (req, res, next) => {

    const conn = new msSql.ConnectionPool(config.dbConfig);
    console.log("download blockcode list api called " + req.params.userid);
    let userId = req.params.userid;

  conn.connect()
  .then(() => {
    const sql = new msSql.Request(conn);

    //console.log("userId --- " + userId);
    if(userId){
      sql.input('iuserid', msSql.VarChar(15), userId);
    }

  sql.execute('API_GetBlockCodeListData')
    .then((result) => {
      conn.close();

      console.log(result.recordset != null && result.recordset.length > 0 ? result.recordset[0].totalrows : 0);
      res.status(200).json({
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

exports.downloadPollingStationListData = (req, res, next) => {

    const conn = new msSql.ConnectionPool(config.dbConfig);
    console.log("download polling station list api called " + req.params.userid);
    let userId = req.params.userid;

  conn.connect()
  .then(() => {
    const sql = new msSql.Request(conn);

    //console.log("userId --- " + userId);
    if(userId){
      sql.input('iuserid', msSql.VarChar(15), userId);
    }

  sql.execute('API_GetPollingStationListData')
    .then((result) => {
      conn.close();

      console.log(result.recordset != null && result.recordset.length > 0 ? result.recordset[0].totalrows : 0);
      res.status(200).json({
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
