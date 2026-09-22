
// Schema
/*
- double1/double[0] => Score
- index1/index[0] => date
*/

export function saveScore(c, bool) {
    const score = boolToScore(bool);
    const date = new Date().toISOString();
    c.env.SCORE.writeDataPoint({
        "doubles": [score],
        "indexes": [date]
    });
}

function boolToScore(b) {
  if (b === true) return 1;
  if (b === false) return -1;
  return 0;
}
const SCORE_QUERY = `
        SELECT 
            SUM(_sample_interval) AS total_events,
            SUM(_sample_interval * double1) / SUM(_sample_interval) AS average_score
        FROM SCORE`;
// '1' DAY
//WHERE timestamp > NOW() - INTERVAL '1' DAY
export async function getScore(c, interval) {
    let query = SCORE_QUERY;
    if (interval !== undefined) {
        query = query + ` WHERE timestamp > NOW() - INTERVAL ${interval}`;
    }
    const API = `https://api.cloudflare.com/client/v4/accounts/${c.env.ACCOUNT_ID}/analytics_engine/sql`;
    
    const response = await fetch(API, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${c.env.API_TOKEN}`,
            "Content-Type": "text/plain"
        },
        body: query
    });

    if (!response.ok) {
        throw new Error(`Failed to query analytics engine: ${await response.text()}`);
    }

    const result = await response.json();

    return {
        score: result.data.average_score ?? 0,
        totalEvents: result.data.total_events ?? 0
    }
}
