const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUfEX2OQArn_QYaSDpOnTa528zmvicVZqZ283QUnNaLfp7YTz3tyQ3IEHM9-vup5tP78Q-V7aaUQ5j/pub?gid=400672772&single=true&output=csv";

exports.handler = async function(event, context) {
  try {
    const response = await fetch(SHEET_URL);
    if (!response.ok) throw new Error('Sheet fetch failed: ' + response.status);
    const csv = await response.text();

    console.log('CSV length:', csv.length);
    console.log('First 300 chars:', csv.substring(0, 300));

    const lines = csv.trim().split('\n');
    console.log('Total lines:', lines.length);

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      if (cols.length < 5 || !cols[2]) continue;
      rows.push({
        pos: parseInt(cols[0]) || 999,
        posDisplay: cols[1] || String(parseInt(cols[0]) || 999),
        name: cols[2],
        score: cols[3] || 'E',
        thru: cols[4] || '-'
      });
    }

    console.log('Rows parsed:', rows.length);

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
    console.error('Error:', e.message);
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
