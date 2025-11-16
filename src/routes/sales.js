import express from 'express';
import { poolPromise } from '../db.js';
import { formatPeriode, formatTanggalShort } from '../helpers/formatHelper.js'; 

const router = express.Router();

// Get sales
router.get('/', async (req, res) => {
    try {
        const period = req.query.period || '202401';
        const pool = await poolPromise;
        const result = await pool.request().input('period', period).query(`SELECT 
            s.IDNo, 
            s.DocType, 
            s.PEBNo, 
            s.PEBDate, 
            s.DONo, 
            s.DODate, 
            s.CustomerName, 
            s.Origin, 
            s.ItemCode, 
            i.InvName, 
            s.Qty, 
            s.Unit, 
            s.Currency, 
            s.Up, 
            s.Amount, 
            s.Period
            FROM BC_Data.dbo.Sales s 
            LEFT JOIN JIData.dbo.Inventory i 
                ON s.ItemCode = i.PartNo 
            WHERE s.period = @period`);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ 
            error: 'database error', 
            details: error.message 
        });
    }
});

export default router;