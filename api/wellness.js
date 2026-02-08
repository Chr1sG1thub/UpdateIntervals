// api/wellness.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://chr1sg1thub.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  console.log (req.method);

  // Handle the Preflight (OPTIONS) request immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { date, ...wellnessData } = req.body;  // e.g., { date: '2026-02-08', weight: 75.5, restingHR: 55 }
  if (!date) {
    return res.status(400).json({ error: 'date (YYYY-MM-DD) required' });
  }

  const apiKey = process.env.INTERVALS_API_KEY;       // From intervals.icu /settings > Developer Settings
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing Vercel API Key' });
  }
const auth = btoa('API_KEY:' + apiKey);  // username: "API_KEY", password: your_key

  const url = `https://intervals.icu/api/v1/athlete/0/wellness/${date}`;
  const payload = { id: date, ...wellnessData };

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,  // Or Basic btoa('API_KEY:' + apiKey) [web:1][web:10]
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
