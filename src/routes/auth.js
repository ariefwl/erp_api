import express from 'express';
import { poolPromise } from '../db.js';

const router = express.Router();

// LOGIN
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("username", username)
            .input("password", password)
            .query(`
                SELECT TOP 1 UserId, UserName, Pass, Type
                FROM ERPUser
                WHERE UserId = @username AND Pass = @password
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Username atau password salah"
            });
        }

        const user = result.recordset[0];

        res.json({
            success: true,
            user: {
                id: user.UserId,
                name: user.UserName || user.UserId,
                type: user.Type
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

export default router;
