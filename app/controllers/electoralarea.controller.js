const msSql = require("mssql");
const util = require('util');
const config = require("../config/db.config.js");

exports.listAllElectoralAreas = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);
    conn
      .connect()
      .then(() => {
        const sql = new msSql.Request(conn);
        sql
          .query(
            "select ela_id as id, ela_nameUrdu as name "+
            "from dbo.tbl_electoralareas "
            //"where uc_id = '"+ req.params.pollingstationid +"' and pag.cn_id = '"+ req.userData.canId +"'"
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

exports.getElectoralAreaDetails = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);
    let recItem;
    conn
    .connect()
    .then(() => {
      const sql = new msSql.Request(conn);
      sql
      .query(
            "select uc.uc_id as id, uc_name as name, uc_votersCount as totalVoters, uc_familiesCount as totalFamilies, uc_maleVotersCount as totalMaleVoters, uc_femaleVotersCount as totalFemaleVoters, uci_inchargeCnic as inchargeCnic, "+
            "case when uci_inchargeName is NULL OR uci_inchargeName = '' then vtr_nameText else uci_inchargeName end as inchargeNameText, "+
            "case when uci_inchargeMobile is NULL OR uci_inchargeMobile = '' then vtr_mobile else uci_inchargeMobile end as inchargeMobile, "+
            "case when vtr_nameText is NULL OR vtr_nameText = '' then cast('' as xml).value('xs:base64Binary(sql:column(\"vtr_nameBlob\"))', 'varchar(max)') else NULL end as vtr_nameBlob "+
            "from dbo.tbl_constituencyuc as uc "+
            "left join dbo.tbl_constituencyucincharges as uci on uci.uc_id = uc.uc_id and uci.cn_id = '"+ req.userData.canId +"'"+
            "left join tbl_voterdetails as vt on vt.vtr_cnic = uci.uci_inchargeCnic "+
            "left join tbl_voterdetailsblobs as vb on vb.vtr_cnic = uci.uci_inchargeCnic "+
            "where uc.uc_id = '"+ req.params.electoralareaid +"'"
       )
      .then((resutl) => {
        if(resutl.recordset.length > 0){

            recItem = resutl.recordset[0];
            /////
            sql.query(
                "select pls_id, pls_name, pls_type from dbo.tbl_pollingstations where uc_id = '"+ recItem.id +"'"
           )
          .then((resuti) => {
                conn.close();
                recItem.pollingStations = resuti.recordset;

                res.status(201).json({
                    message: "Data is attached",
                    item: recItem,
                });
          })
          .catch(function (err) {
            console.log(err);
            conn.close();
            res.status(501).json({
              message: "Execution Failed",
            });
          });
            ////
            /*res.status(201).json({
                message: "Data is attached",
                item: resutl.recordset[0],
            });*/
        }
        else {
            conn.close();
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
