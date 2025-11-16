import express from 'express';
import { poolPromise } from '../db.js';
import { formatPeriode, formatTanggalShort } from '../helpers/formatHelper.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const period = req.query.period || '202401';
        const pool = await poolPromise;
        const result = await pool.request().input('period', period).query(`SELECT 
            f.IDNo, 
            f.FGNo, 
            f.FGDate, 
            f.ItemCode, 
            i.InvName , 
            f.Unit, 
            f.Qty, 
            f.SubContract, 
            f.SubConQty, 
            f.WarehouseName
            FROM BC_Data.dbo.FinishedGoods f 
            LEFT JOIN JIData.dbo.Inventory i 
                ON f.ItemCode = i.PartNo 
            WHERE f.period = @period`);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ 
            error: 'database error', 
            details: error.message 
        });
    }
});

export default router;