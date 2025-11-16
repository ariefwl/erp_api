import express from 'express';
import { poolPromise } from '../db.js';
import { formatPeriode, formatTanggalShort } from '../helpers/formatHelper.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const period = req.query.period || '202401';
        const pool = await poolPromise;
        const result = await pool.request().input('period', period).query(`SELECT 
            w.NoTr, 
            w.DateTr, 
            w.ItemCode, 
            i.InvName, 
            w.Unit, 
            w.Qty, 
            w.Up, 
            w.Amount, 
            f.FacilitiesName
            FROM BC_Data.dbo.Waste w 
            LEFT JOIN BC_Data.dbo.facilities f 
               ON w.FacilitiesID = f.FacilitiesID 
            LEFT JOIN JIData.dbo.Inventory i 
               ON w.ItemCode = i.PartNo 
            WHERE w.Period = @period`);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ 
            error: 'database error', 
            details: error.message 
        });
    }
});

export default router;  