🛍️ TokoKu - Full Stack E-Commerce Solution

TokoKu adalah platform e-commerce modern yang dibangun menggunakan ekosistem JavaScript. Aplikasi ini mencakup seluruh alur belanja mulai dari manajemen produk, keranjang belanja, hingga pembayaran otomatis menggunakan Midtrans Payment Gateway.

✨ Fitur Utama

👤 User / Pembeli

Otentikasi Aman: Registrasi dan login menggunakan JWT (JSON Web Token).

Manajemen Profil: Mengubah data diri dan melihat riwayat pesanan.

Katalog Produk: Pencarian, filter kategori, dan detail produk berbasis slug (SEO friendly).

Sistem Keranjang: Tambah, kurang, dan hapus item secara real-time.

Checkout & Pembayaran: Integrasi dengan Midtrans Snap (Transfer Bank, E-Wallet, Kartu Kredit).

Notifikasi Status: Pembaruan status pembayaran otomatis via Webhook.

🛡️ Admin Dashboard

Manajemen Produk: CRUD (Create, Read, Update, Delete) produk dan kategori.

Upload Gambar: Integrasi Multer untuk penyimpanan gambar produk.

Manajemen Pesanan: Memantau semua transaksi masuk dan mengubah status pengiriman.

Manajemen User: Melihat daftar pengguna yang terdaftar.

🏗️ Tech Stack

Frontend:

React.js 18 (Vite)

Tailwind CSS (Styling)

Headless UI / Lucide React (Icons & Components)

Axios (API Fetching)

Backend:

Node.js & Express.js

MySQL (Database)

Sequelize / MySQL2 (ORM/Driver)

JWT & Bcryptjs (Security)

Midtrans-client (Payment)

📁 Struktur Folder

ecommerce/
├── backend/
│   ├── config/         # Konfigurasi Database & Midtrans
│   ├── controllers/    # Logika bisnis API
│   ├── middleware/     # Auth & Upload middleware
│   ├── models/         # Skema database (Sequelize/SQL)
│   ├── routes/         # Definisi endpoint API
│   └── uploads/        # Penyimpanan gambar produk
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Halaman aplikasi
│   │   ├── hooks/      # Custom React hooks
│   │   └── context/    # State management (Auth/Cart)
└── database/           # File SQL schema


🚀 Panduan Instalasi

1. Prasyarat

Node.js (v16 ke atas)

MySQL Server (XAMPP/Docker/Native)

Akun Midtrans Sandbox

2. Konfigurasi Database

Buat database baru bernama tokoku_db.

Import schema:

mysql -u root -p tokoku_db < database/schema.sql


3. Setup Backend

cd backend
npm install
cp .env.example .env


Isi .env backend dengan detail berikut:

PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=tokoku_db
JWT_SECRET=rahasia_negara_anda
MIDTRANS_SERVER_KEY=SB-Mid-server-...
MIDTRANS_CLIENT_KEY=SB-Mid-client-...
MIDTRANS_IS_PRODUCTION=false


Jalankan server: npm run dev

4. Setup Frontend

cd frontend
npm install
cp .env.example .env


Isi .env frontend:

VITE_API_URL=http://localhost:5000/api
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-...


Jalankan aplikasi: npm run dev

🌐 Dokumentasi API (Ringkas)

Fitur

Method

Endpoint

Akses

Auth

POST

/api/auth/login

Publik

Product

GET

/api/products

Publik

Product

POST

/api/products

Admin

Cart

GET

/api/cart

User

Order

POST

/api/orders

User

Webhook

POST

/api/orders/webhook

Midtrans

🔐 Akun Pengujian (Default)

Admin:

Email: admin@tokoku.com

Password: admin123 (Gunakan script bcrypt untuk generate hash di database)

User:

Email: user@gmail.com

Password: password123

🛠️ Pengembangan Selanjutnya

[ ] Integrasi Cloudinary untuk penyimpanan gambar.

[ ] Fitur Wishlist.

[ ] Review & Rating Produk.

[ ] PWA (Progressive Web App) support.

📄 Lisensi

Distributed under the MIT License. See LICENSE for more information.

Dibuat dengan ❤️ oleh [Nama Anda]