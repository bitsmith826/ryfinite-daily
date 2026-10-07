# ⚡ Ryfinite Multi-Account Daily Check-in

Otomatisasi check-in harian dan monitoring metrik akun Ryfinite untuk banyak akun sekaligus (multi-account) dengan antarmuka terminal yang rapi, ringkas, dan berwarna.

> [!WARNING]
> ### ⚠️ Peringatan & Disclaimer (Hanya untuk Tujuan Edukasi)
> Proyek ini dibuat semata-mata untuk **tujuan edukasi dan pembelajaran** mengenai interaksi REST API menggunakan native Fetch API di Node.js.
> - Penggunaan skrip ini sepenuhnya merupakan tanggung jawab pengguna masing-masing (*Use at your own risk*).
> - Pengembang/penulis tidak bertanggung jawab atas segala bentuk kerugian, pemblokiran akun, penalti, atau pelanggaran ketentuan layanan (*Terms of Service*) dari platform terkait akibat penggunaan skrip ini.

## Keamanan (Privacy & Security)

File berisi cookie asli Anda (**`cookies.txt`**) sudah otomatis terdaftar di [.gitignore](file:///.gitignore), sehingga **TIDAK AKAN PERNAH terunggah ke GitHub**. Anda aman mengunggah repo ini ke GitHub (baik public maupun private).

## Cara Penggunaan

1. **Clone repository ini**:
   ```bash
   git clone <URL_REPO_ANDA>
   cd ryfinite-daily
   ```

2. **Buat file cookies**:
   Salin file template [cookies.example.txt](file:///cookies.example.txt) menjadi `cookies.txt`:
   ```bash
   cp cookies.example.txt cookies.txt
   ```

3. **Masukkan cookie akun**:
   Buka `cookies.txt` dan tempel cookie akun Ryfinite Anda (1 akun per baris):
   ```text
   # Akun 1
   _ga=GA1.1...; auth_token=eyJhbGci...; csrf_token=3caa03c...;

   # Akun 2
   _ga=GA1.1...; auth_token=eyJhbGci...; csrf_token=a1b2c3d...;
   ```
   *(CSRF token akan otomatis diekstrak langsung dari string cookie)*

4. **(Opsional) Konfigurasi Notifikasi Telegram**:
   Jika ingin mendapatkan peringatan saat token akun hampir habis:
   - Salin file `.env.example` menjadi `.env`:
     ```bash
     cp .env.example .env
     ```
   - Isi `TELEGRAM_BOT_TOKEN` (dari [@BotFather](https://t.me/BotFather)) dan `TELEGRAM_CHAT_ID` (dari [@userinfobot](https://t.me/userinfobot)).
   - Default peringatan: dikirim jika token tersisa **≤ 3 hari**.

5. **Jalankan program**:
   ```bash
   npm start
   ```

## Fitur Utama

- **Zero Dependency**: Berjalan langsung menggunakan runtime native Node.js (v18+).
- **Auto-Retry & Network Resilience**: Otomatis mencoba ulang jika terjadi gangguan jaringan sesaat.
- **Deteksi Masa Aktif Token**: Otomatis membaca payload JWT `auth_token` untuk memberitahu sisa masa aktif sesi.
- **Notifikasi Telegram**: Peringatan otomatis ke Telegram jika token akun mendekati tanggal kedaluwarsa.
- **Tampilan Modern**: Format kartu terminal rapi dengan ringkasan metrik akun di akhir eksekusi.
