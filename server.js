require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors({
    origin: 'https://web.itu.edu.tr' // Sadece ITU domain'inden gelen isteklere izin ver
}));
app.use(express.json());

const { SHEET_ID, API_KEY } = process.env;

app.post('/api/grades', async (req, res) => {
    const { studentNumber } = req.body;
    if (!studentNumber) {
        return res.status(400).json({ error: 'Öğrenci numarası gerekli' });
    }

    try {
        const [quizData, reportData, examData] = await Promise.all([
            axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Kısa Sınavlar!A:K?key=${API_KEY}`),
            axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Raporlar!A:K?key=${API_KEY}`),
            axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sınavlar!A:D?key=${API_KEY}`)
        ]);

        res.json({
            quizzes: quizData.data.values,
            reports: reportData.data.values,
            exams: examData.data.values
        });
    } catch (error) {
        res.status(500).json({ error: 'Google Sheets verisi alınamadı' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend ${PORT} portunda çalışıyor`));