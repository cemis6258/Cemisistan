const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
// HTML dosyanızın bulunduğu 'public' klasörünü dışarı açar
app.use(express.static(path.join(__dirname, 'public')));

// İlk Kurulum Verileri
const initialData = {
    vatandaslar: {
        "5383462": { isim: "I.Çemiş Tarık", rol: "İmparator" },
        "4562342": { isim: "Eyüp Eymen Bağcı", rol: "Vatandaş" },
        "6843258": { isim: "Kutlu Tamay", rol: "Vatandaş" },
        "2231542": { isim: "Deniz Kağan Erkmen", rol: "Vatandaş"}

    },
    vergiOrani: "10",
    hazineMiktari: "1000000000",
    fermanlar: ["Deniz Kağan Ahıra"],
    dilekceler: []
};

// Veri okuma ve yazma yardımcı fonksiyonları
function readData() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (e) {
        return initialData;
    }
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// === API ENDPOINT'LERİ ===

// Tüm verileri çekme
app.get('/api/data', (req, res) => {
    res.json(readData());
});

// Vergi Oranı Güncelleme
app.post('/api/tax', (req, res) => {
    const data = readData();
    data.vergiOrani = req.body.vergiOrani;
    saveData(data);
    res.json({ success: true, data });
});

// Hazine Güncelleme
app.post('/api/treasury', (req, res) => {
    const data = readData();
    data.hazineMiktari = req.body.hazineMiktari;
    saveData(data);
    res.json({ success: true, data });
});

// Yeni Vatandaş Ekleme
app.post('/api/citizen/add', (req, res) => {
    const { kod, isim } = req.body;
    const data = readData();
    if (data.vatandaslar[kod]) {
        return res.status(400).json({ error: "Bu kod zaten başka bir vatandaşa ait!" });
    }
    data.vatandaslar[kod] = { isim: isim, rol: "Vatandaş" };
    saveData(data);
    res.json({ success: true, data });
});

// Vatandaş Silme
app.post('/api/citizen/remove', (req, res) => {
    const { kod } = req.body;
    const data = readData();
    if (data.vatandaslar[kod] && data.vatandaslar[kod].rol !== "İmparator") {
        delete data.vatandaslar[kod];
        saveData(data);
        return res.json({ success: true, data });
    }
    res.status(400).json({ error: "İmparator silinemez veya vatandaş bulunamadı!" });
});

// Ferman Yayınlama
app.post('/api/decree', (req, res) => {
    const { metin } = req.body;
    const data = readData();
    data.fermanlar.push(metin);
    saveData(data);
    res.json({ success: true, data });
});

// Dilekçe Gönderme
app.post('/api/petition', (req, res) => {
    const { kod, gonderen, metin } = req.body;
    const data = readData();
    data.dilekceler.push({ kod, gonderen, metin });
    saveData(data);
    res.json({ success: true, data });
});

app.listen(PORT, () => {
    console.log(`E-Devlet Sunucusu ${PORT} portunda canlıda!`);
});
