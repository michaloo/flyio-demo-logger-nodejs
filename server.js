const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');

const host = '0.0.0.0';
const port = 3000;
const logsPath = process.env.LOGS_PATH;


try {
  fs.mkdirSync(logsPath);
} catch (e) {}

const server = http.createServer(async function (req, res) {
  if (req.url !== '/') {
    return res.end();
  }

  const { seq, logsContent } = readLogs();
  const updatedLogsContent = writeLog({ seq, logsContent });
  res.end(
`Fly.io machine region: ${process.env.FLY_REGION}

Logs content:

${updatedLogsContent}`
  );
});

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});


function readLogs() {
  let seq = 1;
  const logsContent = fs.readFileSync(path.join(logsPath, 'logs.jsonl'), { flag: 'a+' }).toString();
  try {
    const firstLog = JSON.parse(
      logsContent
        .trim("\n")
        .split("\n")
        .pop()
    );
    seq = firstLog.seq + 1;
  } catch (e) {}
  return { seq, logsContent };
}

function writeLog({ seq, logsContent }) {
  const log = JSON.stringify({
      seq,
      region: process.env.FLY_REGION
    }) + "\n";
  fs.writeFileSync(
    path.join(logsPath, 'logs.jsonl'),
    log,
    { flag: 'a' }
  );
  logsContent += log;
  return logsContent;
}
