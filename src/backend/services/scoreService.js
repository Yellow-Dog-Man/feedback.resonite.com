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