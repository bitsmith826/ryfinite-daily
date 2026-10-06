import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from './config.js';
import { c, printBanner, printAccountCard, printSummary } from './ui.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COOKIES_FILE = path.join(__dirname, 'cookies.txt');

// Helper sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Membaca list cookie dari cookies.txt
 */
function loadCookies() {
  if (fs.existsSync(COOKIES_FILE)) {
    const raw = fs.readFileSync(COOKIES_FILE, 'utf-8');
    const lines = raw
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#'));

    if (lines.length > 0) return lines;
  }

  // Fallback jika ada di config
  if (CONFIG.COOKIE) {
    return [CONFIG.COOKIE];
  }

  return [];
}

/**
 * Ekstrak csrf_token dari cookie string
 */
function extractCsrfToken(cookie) {
  const match = cookie.match(/csrf_token=([^;\s]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return CONFIG.CSRF_TOKEN;
}

/**
 * Helper request API dengan auto-retry jika terjadi gangguan jaringan sesaat
 */
async function request(endpoint, cookie, options = {}, retries = 2) {
  const url = `${CONFIG.BASE_URL}${endpoint}`;
  const headers = {
    ...CONFIG.HEADERS,
    Cookie: cookie,
    ...(options.headers || {})
  };

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const contentType = response.headers.get('content-type') || '';
      let result;
      if (contentType.includes('application/json')) {
        result = await response.json();
      } else {
        result = await response.text();
      }

      return {
        status: response.status,
        ok: response.ok,
        data: result
      };
    } catch (error) {
      if (attempt <= retries) {
        // Tunggu sebentar lalu coba lagi jika jaringan sempat terputus
        await sleep(1000);
        continue;
      }
      return {
        status: null,
        ok: false,
        error: error.message
      };
    }
  }
}

/**
 * Hitung sisa masa aktif token dari payload JWT auth_token
 */
function getExpiryInfo(cookie) {
  try {
    const match = cookie.match(/auth_token=([^;\s]+)/);
    if (!match) return null;
    const parts = match[1].split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    if (!payload.exp) return null;

    const expDate = new Date(payload.exp * 1000);
    const diffDays = Math.ceil((expDate - Date.now()) / (1000 * 60 * 60 * 24));
    const formattedDate = expDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    if (diffDays <= 0) {
      return `Kadaluarsa (${formattedDate})`;
    }
    return `${formattedDate} (${diffDays} hari lagi)`;
  } catch {
    return null;
  }
}

/**
 * Proses 1 akun: ambil profil, level mining, dan lakukan check-in
 */
async function processAccount(cookie, index, total) {
  const csrfToken = extractCsrfToken(cookie);
  const expiryInfo = getExpiryInfo(cookie);

  // 1. Ambil Profil User
  const meRes = await request('/api/user/me', cookie, { method: 'GET' });
  if (!meRes.ok) {
    let failMsg = '';
    if (meRes.status === 401) {
      failMsg = 'Sesi / Cookie Kadaluwarsa (HTTP 401)';
    } else if (meRes.status === 429) {
      failMsg = 'Terlalu banyak request / Rate Limit (HTTP 429)';
    } else if (meRes.status === null) {
      failMsg = `Gangguan Koneksi Jaringan (${meRes.error || 'Timeout'})`;
    } else {
      failMsg = `Gagal mengambil data user (HTTP ${meRes.status})`;
    }

    printAccountCard({
      index,
      total,
      isSuccess: false,
      checkinMsg: failMsg
    });
    return { success: false, gems: 0 };
  }

  const user = meRes.data?.user || {};
  const profile = user.profile || {};
  const email = user.email || user.id;

  // 2. Ambil Info Mining Pool
  const mineRes = await request('/api/mine', cookie, { method: 'GET' });
  const level = mineRes.ok ? (mineRes.data?.level || {}) : {};

  // 3. Lakukan Check-in Harian
  const checkinRes = await request('/api/user/checkin', cookie, {
    method: 'POST',
    headers: {
      'content-length': '0',
      'x-csrf-token': csrfToken
    }
  });

  let checkinStatus = 'OK';
  let checkinMsg = '';

  if (checkinRes.ok) {
    const cData = checkinRes.data || {};
    if (cData.gemAwarded) {
      checkinMsg = `Sukses klaim (+${cData.gemAmount} 💎)`;
    } else {
      checkinMsg = `Sukses (Sudah diambil hari ini +0 💎)`;
    }
  } else {
    checkinStatus = 'FAIL';
    checkinMsg = `Gagal check-in (HTTP ${checkinRes.status})`;
  }

  const finalGems = profile.gems || 0;
  const currentStreak = profile.currentStreak || 0;
  const longestStreak = profile.longestStreak || 0;

  printAccountCard({
    index,
    total,
    email,
    id: user.id,
    gems: finalGems,
    streak: currentStreak,
    longestStreak,
    tierName: level.name,
    tierLevel: level.tier,
    dailyRfn: level.dailyRewardRfn,
    checkinStatus,
    checkinMsg,
    expiryInfo,
    isSuccess: true
  });

  return { success: true, gems: finalGems };
}

/**
 * Runner Utama
 */
async function main() {
  console.clear();
  const cookies = loadCookies();

  if (cookies.length === 0) {
    printBanner(0);
    console.log(`\n ${c.brightRed}✖ File cookies.txt tidak ditemukan atau masih kosong!${c.reset}`);
    console.log(` ${c.gray}Silakan salin ${c.brightCyan}cookies.example.txt${c.gray} menjadi ${c.brightWhite}cookies.txt${c.gray} lalu isi cookie akun Anda.${c.reset}\n`);
    return;
  }

  printBanner(cookies.length);

  let successCount = 0;
  let failedCount = 0;
  let totalGemsAccumulated = 0;

  for (let i = 0; i < cookies.length; i++) {
    const result = await processAccount(cookies[i], i + 1, cookies.length);
    if (result.success) {
      successCount++;
      totalGemsAccumulated += result.gems;
    } else {
      failedCount++;
    }

    // Beri jeda 1 detik antar akun jika ada lebih dari 1 akun
    if (i < cookies.length - 1) {
      await sleep(1000);
    }
  }

  printSummary({
    total: cookies.length,
    success: successCount,
    failed: failedCount,
    totalGems: totalGemsAccumulated
  });
}

main();
