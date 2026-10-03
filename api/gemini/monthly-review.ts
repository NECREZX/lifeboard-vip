import { GoogleGenAI } from '@google/genai';

const formatIDR = (val: number) => {
  return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({ error: 'Missing insight data' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not configured on Vercel' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

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
            return res.status(200).json({
              executiveSummary: parsed.executiveSummary.trim(),
              strategicRecommendations: parsed.strategicRecommendations.filter((r: any) => typeof r === 'string'),
            });
          }
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Vercel function model ${modelName} error (trying fallback):`, err?.message || err);
      }
    }

    console.error('All Gemini AI models failed in Vercel function:', lastError);
    return res.status(500).json({ error: lastError?.message || 'Gagal memanggil Gemini API' });
  } catch (error: any) {
    console.error('Vercel Gemini API error:', error);
    return res.status(500).json({ error: error?.message || 'Gagal memanggil Gemini API' });
  }
}
