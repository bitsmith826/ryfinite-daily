// Modul tema & tampilan terminal modern, ringkas, dan rapi

export const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',

  // Warna teks
  cyan: '\x1b[36m',
  brightCyan: '\x1b[96m',
  magenta: '\x1b[35m',
  brightMagenta: '\x1b[95m',
  green: '\x1b[32m',
  brightGreen: '\x1b[92m',
  yellow: '\x1b[33m',
  brightYellow: '\x1b[93m',
  red: '\x1b[31m',
  brightRed: '\x1b[91m',
  white: '\x1b[37m',
  brightWhite: '\x1b[97m',
  gray: '\x1b[90m',

  // Background
  bgGreen: '\x1b[42m\x1b[30m',
  bgRed: '\x1b[41m\x1b[97m',
  bgYellow: '\x1b[43m\x1b[30m',
};

export function printBanner(totalAccounts = 1) {
  console.log(`
 ${c.bold}${c.brightMagenta}⚡ RYFINITE MULTI-ACCOUNT DAILY CHECK-IN${c.reset}
 ${c.brightCyan}${'─'.repeat(57)}${c.reset}
 ${c.gray}Memproses ${c.brightWhite}${totalAccounts}${c.gray} akun dari ${c.brightWhite}cookies.txt${c.reset}
 ${c.brightCyan}${'─'.repeat(57)}${c.reset}`);
}

export function printAccountCard({ index, total, email, id, gems, streak, longestStreak, tierName, tierLevel, dailyRfn, checkinStatus, checkinMsg, expiryInfo, isSuccess }) {
  const numTag = `[Akun #${index}/${total}]`;
  const userIdentifier = email || id || 'Akun Ryfinite';
  
  console.log(`\n${c.brightCyan}┌─ ${c.bold}${c.brightWhite}${numTag}${c.reset} ${c.brightMagenta}${userIdentifier}${c.reset}`);
  
  if (!isSuccess) {
    console.log(`${c.brightCyan}│${c.reset}  ${c.brightRed}✖ Status    : Sesi / Cookie Kadaluwarsa atau Error!${c.reset}`);
    console.log(`${c.brightCyan}│${c.reset}  ${c.gray}  Pesan     : ${checkinMsg || 'Gagal terhubung'}${c.reset}`);
    console.log(`${c.brightCyan}└─────────────────────────────────────────────────────────${c.reset}`);
    return;
  }

  const checkinBadge = checkinStatus === 'OK' 
    ? `${c.brightGreen}✔ ${checkinMsg}${c.reset}`
    : `${c.brightYellow}ℹ ${checkinMsg}${c.reset}`;

  console.log(`${c.brightCyan}│${c.reset}  ${c.gray}• Gems        :${c.reset} ${c.bold}${c.brightYellow}💎 ${formatNumber(gems)}${c.reset}`);
  console.log(`${c.brightCyan}│${c.reset}  ${c.gray}• Streak      :${c.reset} ${c.brightRed}🔥 ${streak} hari${c.reset} ${c.gray}(Rekor: ${longestStreak} hari)${c.reset}`);
  
  if (tierName) {
    console.log(`${c.brightCyan}│${c.reset}  ${c.gray}• Mining Tier :${c.reset} ${c.brightCyan}⚡ ${tierName} (Tier ${tierLevel})${c.reset} ${c.gray}~ ${formatNumber(dailyRfn)} RFN/hari${c.reset}`);
  }

  if (expiryInfo) {
    console.log(`${c.brightCyan}│${c.reset}  ${c.gray}• Masa Aktif  :${c.reset} ${c.brightWhite}⏳ ${expiryInfo}${c.reset}`);
  }

  console.log(`${c.brightCyan}│${c.reset}  ${c.gray}• Check-in    :${c.reset} ${checkinBadge}`);
  console.log(`${c.brightCyan}└─────────────────────────────────────────────────────────${c.reset}`);
}

export function printSummary({ total, success, failed, totalGems }) {
  console.log(`\n${c.brightCyan}${'═'.repeat(59)}${c.reset}`);
  console.log(` ${c.bold}${c.brightWhite}RINGKASAN AKHIR:${c.reset}`);
  console.log(`  • Berhasil : ${c.brightGreen}${success}/${total} akun${c.reset}`);
  if (failed > 0) {
    console.log(`  • Gagal    : ${c.brightRed}${failed} akun${c.reset}`);
  }
  console.log(`  • Akumulasi: ${c.bold}${c.brightYellow}💎 ${formatNumber(totalGems)} Gems${c.reset}`);
  console.log(`${c.brightCyan}${'═'.repeat(59)}${c.reset}\n`);
}

export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString('id-ID');
}
