import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper formatting for currency
const formatIDR = (val: number) => {
  return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
};

// Shared Gemini AI Client instance
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API Endpoint for Lifeboard AI Monthly Review
app.post('/api/gemini/monthly-review', async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({ error: 'Missing insight data' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on server' });
    }

    const prompt = `Anda adalah analis finansial independen profesional untuk aplikasi Lifeboard.
Berikut adalah data ringkasan finansial pengguna bulan ${data.monthLabel}:
- Total Pendapatan: ${formatIDR(data.totalIncome)}
- Total Pengeluaran: ${formatIDR(data.totalExpense)}
- Total Saldo Akhir (Net): ${formatIDR(data.netCashflow)} (Rasio Simpanan: ${data.savingsRate}%)
- Skor Evaluasi: ${data.financialHealthGrade}
- Kategori Pengeluaran Terbesar: ${data.topExpenseCategories?.map((c: any) => `${c.name} (${c.percentage}%)`).join(', ') || 'Tidak ada'}
- Hari Pengeluaran Tertinggi: ${data.peakDayName} (${formatIDR(data.peakDayAmount)})
- Status Anggaran: ${data.budgetStatusSummary} (${data.overBudgetsCount} pos over budget, rata-rata sisa: ${data.averageRemainingBudgetPct}%)
- Biaya Admin Transfer: ${formatIDR(data.totalAdminFees)}
- Tabungan Bersih: ${formatIDR(data.netSavingAddition)}
- Wishlist Terbeli: ${data.wishlistPurchasedCount} barang (${formatIDR(data.wishlistPurchasedTotal)})
- Penyelesaian Agenda: ${data.activityCompletionRate}% (${data.activitiesCompletedCount} selesai, ${data.activitiesPendingCount} tertunda)

Tugas Anda:
1. Rangkai "executiveSummary": Berikan 1 paragraf (3-4 kalimat) evaluasi performa keuangan yang mendalam, berwibawa, realistis, dan objektif dalam Bahasa Indonesia. Hindari kalimat klise atau berlebihan/lebay.
2. Rangkai "strategicRecommendations": Berikan array 2-3 butir rekomendasi taktis konkret yang aplikatif untuk bulan berikutnya berdasarkan data aktual di atas.

Kembalikan WAJIB berupa JSON murni dengan struktur:
{
  "executiveSummary": "...",
  "strategicRecommendations": ["...", "...", "..."]
}`;

    const candidateModels = [
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
      'gemini-3.8-flash',
      'gemini-2.5-flash'
    ];

    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response && response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed && typeof parsed.executiveSummary === 'string' && Array.isArray(parsed.strategicRecommendations)) {
            return res.json({
              executiveSummary: parsed.executiveSummary.trim(),
              strategicRecommendations: parsed.strategicRecommendations.filter((r: any) => typeof r === 'string'),
            });
          }
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} fallback notice:`, err?.message || err);
      }
    }

    console.error('All Gemini AI candidate models failed:', lastError);
    return res.status(500).json({ error: lastError?.message || 'Gagal merangkai ulasan AI' });
  } catch (error: any) {
    console.error('Error in monthly review handler:', error);
    return res.status(500).json({ error: error?.message || 'Gagal merangkai ulasan AI' });
  }
});

// Mount Vite in dev or serve static build in prod
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Lifeboard Server running on port ${port}`);
  });
}

start();
