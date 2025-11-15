import express from 'express';
import { poolPromise } from '../db.js';
import PDFDocument from 'pdfkit';
import { formatPeriode, formatTanggalShort } from '../helpers/formatHelper.js';

const router = express.Router();

// Get purchase
router.get('/', async (req, res) => {
    try {
        const period = req.query.period || '202410';
        const pool = await poolPromise;
        const result = await pool.request().input('period', period).query(`SELECT 
                P.IDNo,
                P.DocType, 
                P.PIBNo, 
                P.PIBDate, 
                P.SerialNo, 
                P.GRNo, 
                P.GRDate, 
                P.ItemCode,
                i.HSCode, 
                i.InvName, 
                P.Qty, 
                P.Unit, 
                P.Currency, 
                P.Up, 
                P.Amount, 
                P.SubContract, 
                P.Origin, 
                P.Period, 
                P.Rate, 
                P.ConUp, 
                P.ConAmount,
                f.FacilitiesName,
                (
                    SELECT TOP 1 prd.OrderNo 
                    FROM [JIData].dbo.PurRecDet AS prd
                    INNER JOIN [JIData].dbo.PurRec AS pr ON pr.IDNo = prd.IDNo
                    WHERE pr.GRNo = P.GRNo
                    ORDER BY prd.IDNo
                ) AS OrderNo,
                (
                    SELECT TOP 1 prd.InvNo 
                    FROM [JIData].dbo.PurRecDet AS prd
                    INNER JOIN [JIData].dbo.PurRec AS pr ON pr.IDNo = prd.IDNo
                    WHERE pr.GRNo = P.GRNo
                    ORDER BY prd.IDNo
                ) AS InvNo
            FROM [BC_Data].dbo.Purchase AS P
            INNER JOIN [BC_Data].dbo.Facilities AS f 
                ON P.FacilitiesID = f.FacilitiesID
            INNER JOIN [JIData].dbo.Inventory i 
                ON P.ItemCode = i.PartNo 
            WHERE P.Period = @period`);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: 'database error', details: error.message });
    }
})

router.get('/export-pdf', async (req, res) => {
  try {
    const period = req.query.period || '202401';
    const pool = await poolPromise;

    const result = await pool.request()
      .input('period', period)
      .query(`
        SELECT 
                P.IDNo,
                P.DocType, 
                P.PIBNo, 
                P.PIBDate, 
                P.SerialNo, 
                P.GRNo, 
                P.GRDate, 
                P.ItemCode,
                i.HSCode, 
                i.InvName, 
                P.Qty, 
                P.Unit, 
                P.Currency, 
                P.Up, 
                P.Amount, 
                P.SubContract, 
                P.Origin, 
                P.Period, 
                P.Rate, 
                P.ConUp, 
                P.ConAmount,
                f.FacilitiesName,
                (
                    SELECT TOP 1 prd.OrderNo 
                    FROM [JIData].dbo.PurRecDet AS prd
                    INNER JOIN [JIData].dbo.PurRec AS pr ON pr.IDNo = prd.IDNo
                    WHERE pr.GRNo = P.GRNo
                    ORDER BY prd.IDNo
                ) AS OrderNo,
                (
                    SELECT TOP 1 prd.InvNo 
                    FROM [JIData].dbo.PurRecDet AS prd
                    INNER JOIN [JIData].dbo.PurRec AS pr ON pr.IDNo = prd.IDNo
                    WHERE pr.GRNo = P.GRNo
                    ORDER BY prd.IDNo
                ) AS InvNo
            FROM [BC_Data].dbo.Purchase AS P
            INNER JOIN [BC_Data].dbo.Facilities AS f 
                ON P.FacilitiesID = f.FacilitiesID
            INNER JOIN [JIData].dbo.Inventory i 
                ON P.ItemCode = i.PartNo 
            WHERE P.Period = @period
      `);

    const data = result.recordset;

    // HEADER
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=purchase_${period}.pdf`);

    // const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({
      margin: 40,
      size: 'A4',
      layout: 'landscape'      // <-- MODE LANDSCAPE
    });

    doc.pipe(res);

    // === FUNCTION: HEADER PER PAGE ===
    function drawHeader() {
      doc.fontSize(12).font('Helvetica-Bold').text(`LAPORAN PEMASUKAN BAHAN BAKU`, {
        align: 'center'
      });
      doc.moveDown(0.5);

      doc.fontSize(10).font('Helvetica-Bold').text(`PERIODE : ${formatPeriode(period)}`, {
        align: 'center'
      });
      doc.moveDown(0.5);

      doc.fontSize(10).font('Helvetica').text(
        `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`,
        { align: 'right' }
      );

      doc.moveDown(1);

      // HEADER TABEL
      const headers = [
        // "No", "Tgl. Rekam", "Jns. Dok.","PIB No", "PIB Date", "No. Seri Brg.", "No BTB", "Tgl. BTB", "Kode Barang", "HS Code", "Nama Barang", "Satuan", "Qty", "Mata Uang", "Nilai Barang", "Sub Kontrak", "Negara Asal", "Harga Satuan", "Rate", "Harga Satuan Konversi", "Nilai Barang Konversi", "No. PO", "Fasilitas", "No. Invoice"
        "No", "Jns. Dok.","PIB No", "PIB Date", "No. Seri Brg.", "No BTB", "Tgl. BTB", "Kd. Barang", "HS Code", "Nama Barang", "Satuan", "Qty", "Mata Uang", "Nilai Barang"
      ];

      // const widths = [30, 30, 20, 80, 70, 80, 150, 60, 50, 70, 90, 50, 60, 120, 60, 50, 50, 50, 50, 50, 50, 70, 90, 120];
      const widths = [20, 30, 35, 40, 20, 50, 50, 40, 40, 120, 30, 30, 50, 50];

      let x = doc.page.margins.left;
      let y = doc.y;

      doc.fontSize(8).font('Helvetica-Bold');

      headers.forEach((header, i) => {
        doc.text(header, x, y, { width: widths[i], align: 'left' });
        x += widths[i];
      });

      // garis bawah header
      doc.moveTo(40, y + 15)
         .lineTo(800, y + 15)
         .stroke();

      doc.moveDown(0.8);
    }

    // === MULAI CETAK ===
    drawHeader();

    const rowHeight = 20;
    const maxY = doc.page.height - doc.page.margins.bottom - rowHeight;

    let rowY = doc.y;

    data.forEach((row, index) => {
      if (rowY > maxY) {
        doc.addPage();
        drawHeader();
        rowY = doc.y;
      }

      const widths = [20, 30, 35, 40, 20, 50, 50, 40, 40, 120, 30, 30, 50, 50];
      let x = doc.page.margins.left;

      const rowData = [
        index + 1,
        row.DocType || '-',
        row.PIBNo || '-',
        formatTanggalShort(row.PIBDate) || '-',
        row.SerialNo || '-',
        row.GRNo || '-',
        formatTanggalShort(row.GRDate) || '-',
        row.ItemCode || '-',
        row.HSCode || '-',
        row.InvName || '-',
        row.Unit || '-',
        (row.Qty || 0).toLocaleString('id-ID'),
        row.Currency || '-',
        (row.Amount || 0).toLocaleString('id-ID', { minimumFractionDigits: 2 })
      ];

      doc.fontSize(8).font('Helvetica');

      rowData.forEach((col, i) => {
        doc.text(col, x, rowY, { width: widths[i] });
        x += widths[i];
      });

      // garis horizontal tiap row
      doc.moveTo(40, rowY + rowHeight - 5)
         .lineTo(800, rowY + rowHeight - 5)
         .strokeColor('#aaaaaa')
         .stroke();

      rowY += rowHeight;
    });

    doc.end();
  } catch (err) {
    console.error("Export PDF error:", err);
    res.status(500).json({ error: "Gagal membuat PDF" });
  }
});


export default router;