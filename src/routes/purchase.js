import express from 'express';
import { poolPromise } from '../db.js';

const router = express.Router();

// Get purchase
router.get('/', async (req, res) => {
    try {
        const period = req.query.period || '202410';
        const pool = await poolPromise;
        const result = await pool.request().input('Period', period).query(`SELECT P.IDNo,P.DocType,P.PIBNo,P.PIBDate,P.GRNo,P.GRDate,P.ItemCode,I.InvName,P.Qty,P.Period FROM [BC_Data].dbo.Purchase as P LEFT JOIN [JIData].dbo.Inventory as I ON P.ItemCode = I.PartNo WHERE Period = @period`);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: 'database error', details: error.message });
    }
})

export default router;