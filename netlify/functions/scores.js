const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUfEX2OQArn_QYaSDpOnTa528zmvicVZqZ283QUnNaLfp7YTz3tyQ3IEHM9-vup5tP78Q-V7aaUQ5j/pub?gid=400672772&single=true&output=csv";

exports.handler = async function(event, context) {
  try {
    const response = await fetch(SHEET_URL);
    if (!response.ok) throw new Error('Sheet fetch failed: ' + response.status);
    const csv = await response.text();

    // Handle both \n and \r\n and double-space line endings from Google Sheets
    const lines = csv.trim().split(/\r?\n|\r/);

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      if (cols.length < 3 || !cols[2]) continue;
      const pos = parseInt(cols[0]) || 999;
      rows.push({
        pos,
        posDisplay: cols[1] || String(pos),
        name: cols[2],
        score: cols[3] || 'E',
        thru: cols[4] || '-'
      });
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(rows)
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({ error: e.message })
    };
  }
};
