import express from 'express';
import { poolPromise } from '../db.js';
import { formatPeriode, formatTanggalShort } from '../helpers/formatHelper.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const period = req.query.period || '202401';
        const pool = await poolPromise;
        const result = await pool.request().input('period', period).query(`SELECT 
            mm.ItemCode, 
            i.InvName, 
            mm.Unit, 
            mm.[Begin], 
            mm.[In], 
            mm.[Out], 
            mm.Ending, 
            mm.WarehouseName, 
            mm.TotalQty, 
            f.FacilitiesName 
            FROM BC_Data.dbo.MaterialMutation mm 
            LEFT JOIN JIData.dbo.Inventory i 
               ON mm.ItemCode = i.PartNo 
            LEFT JOIN BC_Data.dbo.facilities f 
               ON mm.FacilitiesID = f.FacilitiesID 
            WHERE mm.Period = @period`);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ 
            error: 'database error', 
            details: error.message 
        });
    }
});

export default router;