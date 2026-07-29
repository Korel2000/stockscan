export default async function handler(req, res) {
  const apiKey = process.env.BENZINGA_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'API key is missing in environment variables' });
  }

  try {
    // שליפת נתונים מ-Benzinga API
    const response = await fetch(`https://api.benzinga.com/api/v2/news?token=${apiKey}&pageSize=10`);
    
    if (!response.ok) {
      throw new Error(`Benzinga API error: ${response.statusText}`);
    }

    const data = await response.json();

    // מחזיר את הנתונים בחזרה לאפליקציה
    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Scan API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
