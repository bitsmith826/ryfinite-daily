// Modul pengiriman notifikasi Telegram Bot

import { CONFIG } from './config.js';
import { c } from './ui.js';

/**
 * Mengirim pesan teks ke Telegram
 */
export async function sendTelegramMessage(text) {
  const { BOT_TOKEN, CHAT_ID } = CONFIG.TELEGRAM;

  if (!BOT_TOKEN || !CHAT_ID) {
    // Lewati jika belum dikonfigurasi
    return { success: false, reason: 'NOT_CONFIGURED' };
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const result = await response.json();
    if (!result.ok) {
      console.log(` ${c.brightRed}✖ Gagal mengirim notif Telegram: ${result.description}${c.reset}`);
      return { success: false, reason: result.description };
    }

    return { success: true };
  } catch (error) {
    console.log(` ${c.brightRed}✖ Gagal koneksi Telegram: ${error.message}${c.reset}`);
    return { success: false, reason: error.message };
  }
}

/**
 * Mengirim alert jika ada token akun yang hampir habis masa aktifnya
 */
export async function notifyExpiringTokens(expiringAccounts) {
  if (!expiringAccounts || expiringAccounts.length === 0) return;

  const { BOT_TOKEN, CHAT_ID, EXPIRY_ALERT_DAYS } = CONFIG.TELEGRAM;
  if (!BOT_TOKEN || !CHAT_ID) {
    console.log(`\n ${c.brightYellow}ℹ Peringatan: Ada ${expiringAccounts.length} akun dengan token hampir habis (≤ ${EXPIRY_ALERT_DAYS} hari).${c.reset}`);
    console.log(`   ${c.gray}Untuk mengaktifkan notif ke HP, isi TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID di .env${c.reset}`);
    return;
  }

  let message = `⚠️ <b>PERINGATAN TOKEN RYFINITE HAMPIR HABIS!</b>\n\n`;
  message += `Ditemukan <b>${expiringAccounts.length} akun</b> dengan sisa masa aktif ≤ ${EXPIRY_ALERT_DAYS} hari:\n\n`;

  for (const acc of expiringAccounts) {
    const sisa = acc.diffDays <= 0 
      ? `🔴 <b>Sudah Kadaluwarsa!</b>` 
      : `⏳ <b>${acc.diffDays} hari lagi</b>`;
    message += `• <b>${acc.email}</b>\n`;
    message += `  ${sisa} (Exp: ${acc.expDateFormatted})\n\n`;
  }

  message += `💡 <i>Harap segera login ulang dan perbarui cookie di cookies.txt agar check-in harian tidak terhenti.</i>`;

  console.log(`\n ${c.brightCyan}📲 Mengirim notifikasi peringatan ke Telegram...${c.reset}`);
  const res = await sendTelegramMessage(message);
  if (res.success) {
    console.log(` ${c.brightGreen}✔ Notifikasi peringatan berhasil dikirim ke Telegram!${c.reset}`);
  }
}
