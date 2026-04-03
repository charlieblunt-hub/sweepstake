const HISTORY_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUfEX2OQArn_QYaSDpOnTa528zmvicVZqZ283QUnNaLfp7YTz3tyQ3IEHM9-vup5tP78Q-V7aaUQ5j/pub?gid=651734399&single=true&output=csv";

exports.handler = async function(event, context) {
  try {
    const response = await fetch(HISTORY_URL);
    if (!response.ok) throw new Error('History fetch failed: ' + response.status);
    const csv = await response.text();

    const lines = csv.trim().split(/\r?\n|\r/);
    if (lines.length < 2) throw new Error('No history data');

    // First row is headers: timestamp, round, Name1, Name2, ...
    const headers = lines[0].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    const participants = headers.slice(2); // skip timestamp and round

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      if (!cols[0]) continue;
      const row = { timestamp: cols[0], round: parseInt(cols[1]) || 1, totals: {} };
      participants.forEach((name, j) => {
        row.totals[name] = parseInt(cols[j + 2]) || 0;
      });
      rows.push(row);
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({ participants, rows })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message })
    };
  }
};
