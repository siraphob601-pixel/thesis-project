const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // <--- เพิ่มบรรทัดนี้สำคัญมาก!
app.use(express.static('public'));

// ตั้งค่า Database
const db = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'thesis_db',
  password: 'savechaam601',        // <--- ⚠️ แก้รหัสผ่าน pgAdmin ของคุณตรงนี้!
  port: 5432,
});
// ----------------------------------------------------
// API สำหรับเข้าสู่ระบบ (Login)
// ----------------------------------------------------
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // ค้นหา User จากฐานข้อมูล
    const query = 'SELECT * FROM users WHERE username = $1 AND password = $2';
    const result = await db.query(query, [username, password]);

    if (result.rows.length > 0) {
      // เจอตัว! ส่งข้อมูลผู้ใช้กลับไป
      res.json({
        success: true,
        user: result.rows[0]
      });
    } else {
      // ไม่เจอ หรือรหัสผิด
      res.status(401).json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
// API ดึงข้อมูล (ใช้ gid แทน id_plot)
app.get('/api/plots', async (req, res) => {
  try {
    const query = `
      SELECT 
        gid,        -- ใช้ gid เป็นรหัส
        off_nt,     -- ชื่อหน่วยงาน
        remark, 
        area_pln,
        ST_AsGeoJSON(geom) as geojson 
      FROM planting_plots
    `;
    const result = await db.query(query);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
});

app.listen(port, () => {
  console.log(`✅ Server พร้อมทำงานแล้วที่ http://localhost:${port}`);
});