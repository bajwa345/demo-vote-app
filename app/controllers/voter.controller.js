const msSql = require("mssql");
const util = require('util');
const config = require("../config/db.config.js");
const fs = require('fs');
const PDFDocument = require('pdfkit');
const sizeOf = require('buffer-image-size');


exports.listVoters = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    let fromRow = parseInt(req.body.fromRow) || 1;
    let toRow = parseInt(req.body.toRow) || 25;

    let sortColumn = req.body.sortColumn == null || req.body.sortColumn == '' ? '' : req.body.sortColumn;
    let sortOrder = req.body.sortOrder == null || req.body.sortOrder == '' ? 'desc' : req.body.sortOrder;

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        //console.log(util.inspect(req.body, {showHidden: false, depth: null, colors: true}));

        sql.input('icanid', msSql.VarChar(6), req.userData.canId);
        if(req.body.ipollingstationid && req.body.ipollingstationid != ''){
            sql.input('ipollingstationid', msSql.VarChar(6), req.body.ipollingstationid);
        }
        if(req.body.iblockcode && req.body.iblockcode != ''){
            sql.input('iblockcode', msSql.VarChar(15), req.body.iblockcode);
        }
        if(req.body.icnic){
            sql.input('icnic', msSql.VarChar(15), req.body.icnic);
        }
        if(req.body.igender && req.body.igender != ''){
            sql.input('igender', msSql.VarChar(4), req.body.igender);
        }
        if(req.body.imobile){
            sql.input('imobile', msSql.VarChar(15), req.body.imobile);
        }
        if(req.body.isilsila){
            sql.input('isilsila', msSql.VarChar(4), req.body.isilsila);
        }
        if(req.body.igarana){
            sql.input('igarana', msSql.VarChar(4), req.body.igarana);
        }
        if(req.body.isearchtype && req.body.isearchtype != ''){
            sql.input('isearchtype', msSql.Int, req.body.isearchtype);
        }

        sql.input('StartRowNum', msSql.Int, fromRow);
        sql.input('EndRowNum', msSql.Int, toRow);
        sql.input('sortColumn', msSql.VarChar(63), sortColumn);
        sql.input('sortOrder', msSql.VarChar(5), sortOrder);
        sql.input('searchStr', msSql.VarChar(127), req.body.search);

        //console.log("list voters");
        sql.execute('GetVotersList')
        .then((result) => {
            conn.close();
            //console.log("voters count " + result.recordset.length );

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

exports.getVoterNameImage = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    conn
    .connect()
    .then(() => {
        const sql = new msSql.Request(conn);
        //console.log("---" + req.params.icnic);
        sql
        .query(
            "select cast('' as xml).value('xs:base64Binary(sql:column(\"vtr_nameBlob\"))', 'varchar(max)') as vtr_nameBlob from dbo.tbl_voterdetailsblobs where vtr_cnic = '"+ req.params.icnic +"';"
        )
        .then((resutl) => {
            conn.close();
            if(resutl.recordset.length > 0){
                res.status(201).json({
                    message: "Data is Attached",
                    item: resutl.recordset[0].vtr_addressBlob,
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

exports.getVoterBasicDetails = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    conn
    .connect()
    .then(() => {
        const sql = new msSql.Request(conn);
        //console.log("---" + req.params.icnic);
        sql
        .query(
            "select vt.vtr_id, vt.vtr_cnic, vtr_nameText as vtr_nameUrdu, vtr_fatherText as vtr_fatherUrdu, vtr_addressText as vtr_addressUrdu, vtr_mobile, vtr_mobile2, vtr_mobile3, "+
            "case when vtr_gender = 'M' then N'مرد' when vtr_gender = 'F' then N'عورت' else N'دیگر' end as vtr_genderUrdu, "+
            "cast('' as xml).value('xs:base64Binary(sql:column(\"vtr_nameBlob\"))', 'varchar(max)') as vtr_nameBlob, "+
            "cast('' as xml).value('xs:base64Binary(sql:column(\"vtr_fatherBlob\"))', 'varchar(max)') as vtr_fatherBlob, "+
            "cast('' as xml).value('xs:base64Binary(sql:column(\"vtr_addressBlob\"))', 'varchar(max)') as vtr_addressBlob "+
            "from dbo.tbl_voterdetails as vt left join dbo.tbl_voterdetailsblobs as vb on vt.vtr_cnic = vb.vtr_cnic where vt.vtr_cnic = '"+ req.params.icnic +"';"
        )
        .then((resutl) => {
            conn.close();
            if(resutl.recordset.length > 0){
                res.status(201).json({
                    message: "Data is Attached",
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

exports.getVoterAddressImage = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    conn
    .connect()
    .then(() => {
        const sql = new msSql.Request(conn);
        //console.log("---" + req.params.icnic);
        sql
        .query(
            "select cast('' as xml).value('xs:base64Binary(sql:column(\"vtr_addressBlob\"))', 'varchar(max)') as vtr_addressBlob from dbo.tbl_voterdetailsblobs where vtr_cnic = '"+ req.params.icnic +"';"
        )
        .then((resutl) => {
            conn.close();
            if(resutl.recordset.length > 0){
                res.status(201).json({
                    message: "Data is Attached",
                    item: resutl.recordset[0].vtr_addressBlob,
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

exports.updateVoterDetails = (req, res, next) => {

    const conn = new msSql.ConnectionPool(config.dbConfig);

    //console.log("update voter details " + req.body.cnic);
    //console.log(util.inspect(req.body, {showHidden: false, depth: null, colors: true}));

    conn.connect().then(() => {
        const sql = new msSql.Request(conn);
        sql.query(
            "update tbl_voterdetails set vtr_mobile = '"+ req.body.phonenumber1 +"', vtr_mobile2 = '"+ req.body.phonenumber2 +"', vtr_whatsApp = '"+ req.body.whatsappnumber +"', vtr_mobileUpdateBy = '"+ req.userData.userId +"', vtr_mobileUpdateTime = SYSDATETIME() where vtr_cnic = '"+ req.body.cnic +"';"
        )
        .then((resultSet) => {
            conn.close();
            //console.log(util.inspect(resultSet.rowsAffected, {showHidden: false, depth: null, colors: true}));

            if (resultSet.rowsAffected.length === 0 || (resultSet.rowsAffected.length > 0 && resultSet.rowsAffected[0] === 0)) {
                res.status(200).json({
                    type: "error",
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

exports.downloadVoterParchiPdf = (req, res, next) => {
    const conn = new msSql.ConnectionPool(config.dbConfig);

    //console.log("download voter parchi pdf");
    conn.connect().then(() => {
        const sql = new msSql.Request(conn);

        //console.log(util.inspect(req.body, {showHidden: false, depth: null, colors: true}));

        sql.input('icanid', msSql.VarChar(6), req.userData.canId);
        if(req.body.iblockcode && req.body.iblockcode != ''){
            sql.input('iblockcode', msSql.VarChar(15), req.body.iblockcode);
        }
        if(req.body.icnic){
            sql.input('icnic', msSql.VarChar(15), req.body.icnic);
        }

        sql.execute('GetVoterParchisList')
        .then((result) => {
            conn.close();

            //console.log(util.inspect(result.recordsets, {showHidden: false, depth: null, colors: true}));

            let doc = new PDFDocument({ margin: 0, bufferPages: true });
            doc.info['Title'] = 'Voter Parchi' + (req.body.iblockcode != null && req.body.iblockcode != '')? ' ' + req.body.iblockcode : ' ' + req.body.icnic;
            doc.info['Author'] = 'Voogle';

            printParchiSlips(doc, req.body.iblockcode, req.body.icnic, result.recordsets);
            //doc.pipe(fs.createWriteStream('files/voterparchi.pdf'));

            // to open in browser tab
            /*const stream = doc.pipe(res);
            stream.on('finish', () => {
                res.end();
            });*/

            const stream = res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Transfer-Encoding': 'chunked',
                'Content-disposition': 'attachment;filename=voterparchi'+ (req.body.iblockcode != null && req.body.iblockcode != '')? '_' + req.body.iblockcode : '_' + req.body.icnic +'.pdf',
            });
            doc.on('data', (chunk) => stream.write(chunk));
            doc.on('end', () => stream.end());


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

function printParchiSlips(doc, blockcode, cnic, recordsets) {

    doc.registerFont('Jameel Noori Nastaleeq', 'assets/fonts/jameel_noori_nastaleeq_regular.ttf');

    let candi = recordsets[2][0];
    let items = recordsets[0];
    let divh  = (doc.page.height/5) - 30;
    let rowh = divh/5;
    let xr = doc.page.width - (doc.page.margins.left + doc.page.margins.right + 15);

    let i = 0, y = 0;

    if(blockcode != null && blockcode != ''){
        i = 1;
        let blc = recordsets[1][0];

        doc.font('Jameel Noori Nastaleeq').fontSize(24)
        .text(blockcode + 'ووٹر پرچی - بلاک کوڈ '.split(' ').reverse().join(' ').replace('-', ' - '), 15, y + 23 + (rowh*0), { align: 'center', width: xr -15 })

        doc.font('Jameel Noori Nastaleeq').fontSize(13)
        .text('ٹوٹل ووٹر کی تعداد'.split(' ').reverse().join(' '), xr-12-140, y+72+(rowh*0), { align: 'right', width: 140 })
        .text('مرد ووٹر کی تعداد'.split(' ').reverse().join(' '), xr-((xr-24)/3)-140, y+72+(rowh*0), { align: 'right', width: 140 })
        .text('خواتین ووٹر کی تعداد'.split(' ').reverse().join(' '), xr-12-140, y+68+(rowh*1), { align: 'right', width: 140 })
        //.text('خاندان کی تعداد'.split(' ').reverse().join(' '), xr-((xr-24)/3)-140, y+68+(rowh*1), { align: 'right', width: 140 })
        //.text('پولنگ لوکیشن'.split(' ').reverse().join(' '), xr-12-140, y+64+(rowh*2), { align: 'right', width: 140 })
        .text('انتخابی علاقہ'.split(' ').reverse().join(' '), xr-12-140, y+64+(rowh*2), { align: 'right', width: 140 })
        //.text('تحصیل/ تعلقہ'.split(' ').reverse().join(' '), xr-((xr-24)/3)-140, y+64+(rowh*2), { align: 'right', width: 140 });

        doc.font('Helvetica').fontSize(12)
        .text(blc.blc_votersCount, xr-190, y+76+(rowh*0), { align: 'right', width: 106 })
        .text(blc.blc_maleVotersCount, xr-(xr/3)-162, y+76+(rowh*0), { align: 'right', width: 106 })
        .text(blc.blc_femaleVotersCount, xr-190, y+72+(rowh*1), { align: 'right', width: 106 });
        //.text(blc.blc_familiesCount, xr-(xr/3)-162, y+72+(rowh*1), { align: 'right', width: 106 });

        doc.font('Jameel Noori Nastaleeq').fontSize(13)
        .text(blc.electoralArea != null ? blc.electoralArea.split(' ').reverse().join(' ').replace(")", "( ").replace("(", " )") : '', xr-84-1100, y+64+(rowh*2), { align: 'right', width: 1100 });
        //.text(blc.blc_tehsil != null ? blc.blc_tehsil.split(' ').reverse().join(' ') : '', xr-84-150, y+64+(rowh*2), { align: 'right', width: 150 })
        //.text(blc.blc_district != null ? blc.blc_district.split(' ').reverse().join(' ') : '', xr-((xr-24)/3)-64-150, y+64+(rowh*2), { align: 'right', width: 150 })

        doc.font('Helvetica').fontSize(10).text('Printed on : ' + new Date().toLocaleString(), 15, y+6+divh, { align: 'left', width: 180 });

        doc.save().moveTo(15, y + divh + 30).lineTo(xr, y + divh + 30).lineCap('round').dash(5, { space: 9 }).stroke();
        doc.restore().moveDown();
    }
    else {
        doc.font('Helvetica').fontSize(7).fillColor('#444444')
        .text('CNIC # ' + cnic, 15, 6, { align: 'left', width: 100 }).fillColor('#000000')
    }

    for(var c in items)
    {
        y = (i * (divh + 30));

        if(items[c-1] != null && items[c].vtr_girana != items[c-1].vtr_girana) {
            doc.save()
            .moveTo(15, y)
            .lineTo(xr, y)
            .lineCap('round')
            .dash(5, { space: 9 }).fill('red').stroke();
            doc.restore().moveDown();
        }

        doc.save()
        .rect(xr - 89, y + 16, 88, divh - 2)
        .rect(xr - 309, y + 16, 88, divh - 2 - (rowh*2))
        .fill('#F4F4F4').restore();

        doc.lineJoin('round').rect(15, y + 15, xr - 15, divh).stroke();

        doc.moveTo(xr - 90, y + 15).lineTo(xr - 90, y + 15 + divh).stroke();
        doc.moveTo(xr - 220, y + 15).lineTo(xr - 220, y + 15 + divh - (rowh*2)).stroke();
        doc.moveTo(xr - 310, y + 15).lineTo(xr - 310, y + 15 + divh - (rowh*2)).stroke();
        doc.moveTo(xr - 440, y + 15).lineTo(xr - 440, y + 15 + divh).stroke();

        doc.moveTo(xr - 440, y + 15 + rowh).lineTo(xr, y + 15 + rowh).stroke();
        doc.moveTo(xr - 440, y + 15 + (rowh*2)).lineTo(xr, y + 15 + (rowh*2)).stroke();
        doc.moveTo(xr - 440, y + 15 + (rowh*3)).lineTo(xr, y + 15 + (rowh*3)).stroke();
        doc.moveTo(xr - 440, y + 15 + (rowh*4)).lineTo(xr, y + 15 + (rowh*4)).stroke();

        doc.font('Jameel Noori Nastaleeq').fontSize(13)
        .text('نام', xr-12-100, y + 20 + (rowh*0), { align: 'right', width: 100 })
        .text('والد/ شوہر کا نام'.split(' ').reverse().join(' '), xr-12-320, y + 20 + (rowh*0), { align: 'right', width: 100 })
        .text('بلاک کوڈ نمبر'.split(' ').reverse().join(' '), xr-12-100, y + 20 + (rowh*1), { align: 'right', width: 100 })
        .text('شناختی کارڈ نمبر'.split(' ').reverse().join(' '), xr-12-320, y + 20 + (rowh*1), { align: 'right', width: 100 })
        .text('گھرانہ نمبر'.split(' ').reverse().join(' '), xr-12-100, y + 20 + (rowh*2), { align: 'right', width: 100 })
        .text('سلسلہ نمبر'.split(' ').reverse().join(' '), xr-12-320, y + 20 + (rowh*2), { align: 'right', width: 100 })
        .text('گھر کا پتہ'.split(' ').reverse().join(' '), xr-12-100, y + 20 + (rowh*3), { align: 'right', width: 100 })
        .text('پولنگ اسٹیشن'.split(' ').reverse().join(' '), xr-12-100, y + 20 + (rowh*4), { align: 'right', width: 100 });

        if(items[c].vtr_cnic.length == 13) items[c].vtr_cnic = items[c].vtr_cnic.substr(0,5) + '-' + items[c].vtr_cnic.substr(5,7) + '-' + items[c].vtr_cnic.substr(12);

        doc.font('Helvetica').fontSize(12)
        .text(items[c].vtr_blockCode, xr-210, y + 24 + (rowh*1), { align: 'right', width: 106 })
        .text(items[c].vtr_cnic, xr-430, y + 24 + (rowh*1), { align: 'right', width: 106 })
        .text(items[c].vtr_girana, xr-210, y + 24 + (rowh*2), { align: 'right', width: 106 })
        .text(items[c].vtr_silsila, xr-430, y + 24 + (rowh*2), { align: 'right', width: 106 });

        var nimg = Buffer.from(items[c].vtr_nameBlob.replace('data:image/png;base64,',''), 'base64');
        var wdimensions = nimg != null ? sizeOf(nimg).width : 0;

        if(items[c].vtr_nameBlob != null) doc.image(nimg, xr+10-(wdimensions), y + 13, { align: 'right', height: 26 });
        else doc.font('Jameel Noori Nastaleeq').fontSize(13).text(items[c].vtr_nameUrdu.split(' ').reverse().join(' '), xr-8-217, y + 21, { align: 'right', width: 108 })

        if(items[c].vtr_fatherBlob != null) doc.image(Buffer.from(items[c].vtr_fatherBlob.replace('data:image/png;base64,',''), 'base64'), xr-20-440, y + 13, { align: 'right', height: 26 });
        else doc.font('Jameel Noori Nastaleeq').fontSize(13).text(items[c].vtr_fatherUrdu.split(' ').reverse().join(' '), xr-8-438, y + 21, { align: 'right', width: 108 })

        if(items[c].vtr_addressBlob != null) doc.image(Buffer.from(items[c].vtr_addressBlob.replace('data:image/png;base64,',''), 'base64'), xr-30-440+140, y + 15 + (rowh*3), { align: 'right', height: 24 });
        else doc.font('Jameel Noori Nastaleeq').fontSize(13).text(items[c].vtr_addressUrdu.split(' ').reverse().join(' '), xr-18+40, y + 21 + (rowh*3), { align: 'right', width: 334 })

        doc.font('Jameel Noori Nastaleeq').fontSize(12)
        .text(items[c].vtr_pollingStation.split(' ').reverse().join(' ').replace(")", "( ").replace("(", " )"), xr+4-440, y + 20 + (rowh*4), { align: 'right', width: 334 })

        let ltext = '';
        if(candi.es_name == 'bat' ) ltext = 'بلے پر مہر لگائیں';
        else ltext = candi.es_nameUrdu + ' پر مہر لگائیں';

        doc.image('assets/images/party-symbols/'+ candi.es_imageHr, 32, y + 28 , { width: (xr - 27 - 460) })
		.fillColor('#444444')
        .font('Jameel Noori Nastaleeq')
		.fontSize(17)
		.text(ltext.split(' ').reverse().join(' '), 20, y + divh - 24 , { align: 'center', width: (xr - 15 - 450) })
		.fillColor('#555555')
        .font('Helvetica')
		.fontSize(8)
        .text('www.voogleapp.com', 20, y + divh + 2 , { align: 'center', width: (xr - 15 - 450) })
        .fillColor('#000000')
        .moveDown();

        i++;
        if(i==5) {
            doc.addPage();
            i=0; y=0;
        }
        else {
            doc.save().moveTo(15, y + divh + 30).lineTo(xr, y + divh + 30).lineCap('round').dash(5, { space: 9 }).stroke();
            doc.restore().moveDown();
        }
    }

    const range = doc.bufferedPageRange();
    for (i = range.start, end = range.start + range.count, range.start <= end; i < end; i++) {
        doc.switchToPage(i);
        doc.font('Helvetica').fillColor('#444444').fontSize(6).text('Page '+ (i+1) +' of '+ range.count, 0, doc.page.height - 10, { align: 'center' }).fillColor('#000000');
    }
    doc.flushPages();

	doc.end();
}


/*exports.voterDetail = (req, res, next) => {
const conn = new msSql.ConnectionPool(config.dbConfig);
conn
  .connect()
  .then(() => {
    const sql = new msSql.Request(conn);
    sql
      .query(
        "select firNumber,firDate,requestDate,crime,iOname,iObelt,station,cdrCount,imieCount "
        +"from dbo.[dr-request] where iObelt = '"+req.params.cnic+"'"
      )
      .then((resutl) => {
        conn.close();
        res.status(201).json({
          message: "Data is attached",
          item: resutl.recordset,
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
};*/
