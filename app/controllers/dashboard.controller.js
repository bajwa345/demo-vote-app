const msSql = require("mssql");
const util = require('util');
const config = require("../config/db.config.js");

exports.getDashboardData = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        sql.input('icanid', msSql.VarChar(6), req.userData.canId);

        //console.log("get dashboard data");
        sql.execute('GetDashboardData')
        .then((result) => {
            conn.close();
            //console.log(util.inspect(result.recordsets[1], {showHidden: false, depth: null, colors: true}));

            res.status(201).json({
                message: "Data is Attached",
                stats: result.recordsets[0][0],
                reachabilityStats: {
                    overview: {
                        'phone-stats': {
                            'voters'  : result.recordsets[1][0]['total_voters_phoned_this_week'],
                            'families': result.recordsets[1][0]['total_families_phoned_this_week']
                        },
                        'locs-stats': {
                            'voters'  : result.recordsets[1][0]['total_voters_located_this_week'],
                            'families': result.recordsets[1][0]['total_families_located_this_week']
                        }
                    },
                    labels  : result.recordsets[1][0]['labels_this_week']?.split(','),
                    series  : {
                        'phone-stats': [
                            {
                                name: 'Newly Inserted',
                                type: 'line',
                                data: result.recordsets[1][0]['series_phones_inserts_this_week']?.split(',')
                            },
                            {
                                name: 'Records Updated',
                                type: 'column',
                                data: result.recordsets[1][0]['series_phones_updates_this_week']?.split(',')
                            }
                        ],
                        'locs-stats': [
                            {
                                name: 'Newly Inserted',
                                type: 'line',
                                data: result.recordsets[1][0]['series_locas_inserts_this_week']?.split(',')
                            },
                            {
                                name: 'Records Updated',
                                type: 'column',
                                data: result.recordsets[1][0]['series_locas_updates_this_week']?.split(',')
                            }
                        ]
                    }
                },
                complainDetails: {
                    columns: ['report_time', 'type', 'complainent', 'mobile', 'status', 'actions'],
                    rows   : result.recordsets[2]
                }
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

