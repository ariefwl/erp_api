import express from 'express';
import { poolPromise } from '../db.js';
import { formatPeriode, formatTanggalShort } from '../helpers/formatHelper.js';

const router = express.Router();

// Get material use
router.get('/', async (req, res) => {
    try {
        const period = req.query.period || '202401';
        const pool = await poolPromise;
        const result = await pool.request().input('period', period).query(`SELECT 
            m.IDNo, 
            m.MUNo, 
            m.MUDate, 
            m.ItemCode, 
            i.InvName, 
            m.Unit, 
            m.Qty, 
            m.SubConQty, 
            m.SubContract, 
            f.FacilitiesName, 
            m.WasteQty
            FROM [BC_Data].dbo.MaterialUsed m 
            LEFT JOIN [JIData].dbo.Inventory i 
                ON m.ItemCode = i.PartNo 
            LEFT JOIN [BC_Data].dbo.facilities f 
                ON m.FacilitiesID = f.FacilitiesID  
            WHERE m.period = @period`);
        res.json(result.recordset);       
    } catch (error) {
        res.status(500).json({ error: "database error", details: error.message });
    }
});

export default router;