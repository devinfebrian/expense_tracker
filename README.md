# expense_tracker

To install dependencies:

```bash
npm install
```

## Cara Upload Perubahan ke GitHub

Setiap kali kamu selesai mengedit kode dan ingin menyimpan perubahan itu ke GitHub, ikuti 3 langkah ini secara berurutan.

### 1. `git add .`
Menandai semua file yang berubah agar siap disimpan (staged).

```bash
git add .
```
> Kalau cuma mau menambahkan file tertentu saja, ganti `.` dengan nama filenya, misal `git add index.ts`.

### 2. `git commit -m "pesan singkat"`
Menyimpan perubahan tersebut secara permanen di riwayat git lokal, dengan pesan yang menjelaskan apa yang kamu ubah.

```bash
git commit -m "Tambah fitur input pengeluaran harian"
```
> Tulis pesan yang jelas dan singkat, misalnya "Fix bug total tidak muncul" atau "Update tampilan halaman utama".

### 3. `git push`
Mengirim semua commit yang sudah dibuat ke repository di GitHub, supaya bisa dilihat orang lain / tersimpan online.

```bash
git push
```
> Kalau ini pertama kali push branch tersebut, biasanya perlu:
> ```bash
> git push -u origin <branch sendiri> contoh dev-rivan
>
> ```
> Setelah itu, cukup `git push` saja untuk push berikutnya.

### Ringkasan Alur Kerja Sehari-hari
```bash
git add .
git commit -m "Deskripsi perubahan yang kamu buat"
git push
```

### Tips Tambahan
- Jalankan `git status` kapan saja untuk melihat file mana yang berubah dan belum di-commit.
- Jalankan `git log --oneline` untuk melihat riwayat commit secara ringkas.
- Kalau muncul error saat `git push` (misalnya "rejected"), biasanya karena ada perubahan baru di GitHub yang belum ada di komputer kamu. Coba jalankan `git pull` dulu, baru `git push` lagi.
