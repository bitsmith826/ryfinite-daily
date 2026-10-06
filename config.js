// Konfigurasi Header & Base URL Ryfinite
// PENTING: Cookie akun Anda disimpan di cookies.txt (jangan di sini agar aman saat di-upload ke GitHub)

export const CONFIG = {
  BASE_URL: 'https://api.ryfinite.com',

  // Fallback kosong (token akun dibaca dari cookies.txt)
  COOKIE: '',
  CSRF_TOKEN: '',

  HEADERS: {
    'accept': '*/*',
    'accept-language': 'en,en-US;q=0.9,id;q=0.8',
    'dnt': '1',
    'origin': 'https://ryfinite.com',
    'priority': 'u=1, i',
    'referer': 'https://ryfinite.com/',
    'sec-ch-ua': '"Chromium";v="154", "Google Chrome";v="154", "Not A(Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',
  }
};
