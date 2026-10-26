const path = require('path');
const fs = require('fs');
const https = require('https');
const { app } = require('electron');
const extract = require('extract-zip');

const GITHUB_REPO = 'duythuanqb-ops/working-english';
const RELEASE_TAG = 'v1.0.0';

function getExamsDir() {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    const devPath = path.join(__dirname, '../media/exams');
    if (fs.existsSync(devPath)) return devPath;
  }
  // 1. Check user data folder (downloaded from GitHub release)
  const userDataExams = path.join(app.getPath('userData'), 'exams');
  if (fs.existsSync(userDataExams)) {
    return userDataExams;
  }
  // 2. Check bundled resources (if offline bundle)
  const resExams = path.join(process.resourcesPath, 'exams');
  if (fs.existsSync(resExams)) {
    return resExams;
  }
  return userDataExams;
}

function checkExamMediaStatus() {
  const examsDir = getExamsDir();
  const hasFallbacks = fs.existsSync(path.join(examsDir, 'fallbacks'));
  const hasToeic = fs.existsSync(path.join(examsDir, 'toeic-lr-c1-t1'));
  const hasIelts = fs.existsSync(path.join(examsDir, 'ielts-ac-c1-t1'));
  return {
    examsDir,
    hasFallbacks,
    hasToeic,
    hasIelts,
    isReady: hasToeic && hasIelts
  };
}

function downloadFile(url, destPath, onProgress) {
  return new Promise((resolve, reject) => {
    function requestWithRedirect(currentUrl, redirectCount = 0) {
      if (redirectCount > 5) {
        return reject(new Error('Too many redirects'));
      }
      const req = https.get(currentUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return requestWithRedirect(res.headers.location, redirectCount + 1);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Download failed with status ${res.statusCode}`));
        }
        const total = parseInt(res.headers['content-length'] || '0', 10);
        let loaded = 0;
        const fileStream = fs.createWriteStream(destPath);

        res.on('data', (chunk) => {
          loaded += chunk.length;
          if (onProgress && total > 0) {
            onProgress({
              loaded,
              total,
              percent: Math.round((loaded / total) * 100)
            });
          }
        });

        res.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close(() => resolve());
        });

        fileStream.on('error', (err) => {
          fs.unlink(destPath, () => {});
          reject(err);
        });
      });

      req.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }

    requestWithRedirect(url);
  });
}

async function downloadAndExtractMedia(type, onProgress) {
  const targetDir = path.join(app.getPath('userData'), 'exams');
  fs.mkdirSync(targetDir, { recursive: true });

  const tempZip = path.join(app.getPath('userData'), `${type}-temp.zip`);
  const url = `https://github.com/${GITHUB_REPO}/releases/download/${RELEASE_TAG}/${type}-media.zip`;

  // 1. Download
  if (onProgress) onProgress({ type, stage: 'downloading', percent: 0 });
  await downloadFile(url, tempZip, (p) => {
    if (onProgress) onProgress({ type, stage: 'downloading', ...p });
  });

  // 2. Extract
  if (onProgress) onProgress({ type, stage: 'extracting', percent: 100 });
  await extract(tempZip, { dir: targetDir });

  // 3. Clean up temp zip
  try {
    fs.unlinkSync(tempZip);
  } catch {}

  const status = checkExamMediaStatus();
  if (onProgress) onProgress({ type, stage: 'completed', percent: 100, status });
  return status;
}

module.exports = {
  getExamsDir,
  checkExamMediaStatus,
  downloadAndExtractMedia
};
