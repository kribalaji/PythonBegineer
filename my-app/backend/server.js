const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/resume', (req, res) => {
  const { mobileNumber, resumeData, qrCodeDataUrl } = req.body;
  if (!mobileNumber || !resumeData) {
    return res.status(400).json({ message: 'Missing mobile number or resume data' });
  }
  // Save to a file named by mobile number (for demo)
  const folder = path.join(__dirname, 'resumes');
  if (!fs.existsSync(folder)) fs.mkdirSync(folder);
  fs.writeFileSync(
    path.join(folder, `${mobileNumber}.json`),
    JSON.stringify({ resumeData, qrCodeDataUrl }, null, 2)
  );
  res.json({ success: true });
});

app.get('/api/resume/:mobileNumber', (req, res) => {
  const mobileNumber = req.params.mobileNumber;
  const filePath = path.join(__dirname, 'resumes', `${mobileNumber}.json`);
  console.log("Looking for file:", filePath);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Resume not found' });
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  res.json(JSON.parse(data));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));