const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const express = require('express');
const app = express();
const port = 3000;
const folderPath = process.env.FOLDER_PATH;

app.use(express.static('public'));
app.use(express.json());

function findTestFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(findTestFiles(file));
    } else if (file.endsWith('.test.js') || file.endsWith('.test.jsx') || file.endsWith('.test.tsx')) {
      results.push(file);
    }
  });
  return results;
}

app.get('/api/tests', (req, res) => {
  const testFiles = findTestFiles(folderPath);
  res.json(testFiles);
});

app.post('/api/run-test', (req, res) => {
  const { testFile } = req.body;
  exec(`npx react-scripts test ${testFile} --watchAll=false --reporters=default --reporters=jest-junit`, (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: error.message, stdout, stderr });
    } else {
      res.json({ stdout, stderr });
    }
  });
});

app.listen(port, () => {
  console.log(`Test runner app listening at http://localhost:${port}`);
});