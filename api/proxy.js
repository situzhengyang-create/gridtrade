
export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const response = await fetch(decodeURIComponent(url as string));
    const text = await response.text();
    
    // Check if it's JSONP (contains a callback function call)
    if (text.includes('(') && text.includes(')')) {
      // Very simple extraction: remove callback wrapper
      const jsonString = text.replace(/^[^{]*\(/, '').replace(/\);?$/, '');
      try {
        const data = JSON.parse(jsonString);
        return res.json(data);
      } catch (e) {
        // Not JSON, return as text if needed
        return res.send(text);
      }
    }
    
    // Treat as JSON
    try {
      const data = JSON.parse(text);
      return res.json(data);
    } catch(e) {
      return res.send(text);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
}
