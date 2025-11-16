import express from 'express';
import { poolPromise } from '../db.js';
import { formatPeriode, formatTanggalShort } from '../helpers/formatHelper.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const period = req.query.period || '202401';
        const pool = await poolPromise;
        const result = await pool.request().input('period', period).query(`SELECT 
            fg.ItemCode, 
            i.InvName, 
            fg.Unit, 
            fg.[Begin], 
            fg.[In], 
            fg.[Out], 
            fg.Ending, 
            fg.WarehouseName, 
            fg.TotalQty
            FROM BC_Data.dbo.FGMutation fg 
            LEFT JOIN JIData.dbo.Inventory i 
                ON fg.ItemCode = i.PartNo 
            WHERE  Period = '202401'`);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ 
            error: 'database error', 
            details: error.message 
        });
    }
});

export default router;