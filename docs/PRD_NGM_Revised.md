# PRD --- Nusantara Gemar Membaca (NGM)

**Status:** Draft PRD MVP\
**Platform:** Web responsive\
**Primary user:** Remaja SMP--SMA\
**Secondary user:** Mahasiswa/dewasa, publik umum, guru/pendidik\
**Bahasa:** Bahasa Indonesia\
**Last Updated** 10/10/2026 (revisi integrasi Interactive 2D Story Exploration; versi sebelumnya 09/18/2026 20:15 WIB)

> **Definisi MVP selesai:** pengguna dapat memilih/menemukan cerita,
> membaca secara interaktif, melihat visual AI dari adegan cerita, serta
> mengeksplorasi informasi budaya yang terkait.
>
> **Tambahan (revisi Interactive 2D):** untuk **cerita pilihan** yang
> sudah memiliki aset, scene, dan konfigurasi interaksi 2D lengkap,
> pengguna juga dapat menjelajahi scene cerita dalam mode **Interactive 2D
> Story Exploration** (avatar pemandu yang bergerak horizontal, interaksi
> dengan karakter/objek setelah mendekat, dialog/narasi dengan tombol
> "Lanjut", serta informasi lingkungan dan budaya). Cerita yang belum
> siap tetap diselesaikan melalui **reader standar**. Mode 2D adalah
> kemampuan tambahan pada reader NGM, bukan pengganti reader dan bukan
> game penuh.

> **Catatan revisi (10/10/2026):** dokumen ini diperbarui untuk
> mengintegrasikan fitur Interactive 2D Story Exploration ke seluruh
> bagian yang relevan. Penambahan dapat dikenali melalui ID berawalan
> `FR-2D-`, `AC-2D-`, `FR-CMS2D-`, serta subbagian yang menyebut
> "Interactive 2D". Seluruh requirement lain tidak diubah. Keputusan
> produk final untuk fitur ini dirangkum pada bagian 6.3.1; hal yang
> belum diputuskan dicatat pada bagian 11 (Open Questions).

------------------------------------------------------------------------

## 1. Problem Statement

### Masalah utama

Cerita rakyat Indonesia memiliki nilai sejarah, budaya, bahasa, tradisi,
dan pendidikan, tetapi pengalaman digital untuk mengaksesnya sering
berhenti pada **teks cerita**. Bagi pengguna remaja yang terbiasa dengan
media visual dan interaktif, format tersebut belum tentu cukup menarik
untuk mendorong eksplorasi lebih jauh.

Masalah yang hendak diselesaikan NGM:

1.  **Cerita rakyat sulit ditemukan secara terstruktur.**\
    Pengguna membutuhkan cara untuk menemukan cerita berdasarkan daerah,
    kategori, atau tema tanpa harus mengetahui judul cerita terlebih
    dahulu.

2.  **Konteks budaya terpisah dari cerita.**\
    Informasi tentang daerah asal, tokoh, tradisi, bahasa, dan nilai
    budaya sering tidak menjadi bagian integral dari pengalaman membaca.

3.  **Pengalaman membaca kurang visual dan interaktif.**\
    Teks tidak selalu membantu pengguna membayangkan adegan, karakter,
    tempat, atau suasana cerita.

4.  **Eksplorasi budaya tidak memiliki jalur yang jelas.**\
    Setelah membaca satu cerita, pengguna belum tentu memiliki mekanisme
    untuk berpindah dari cerita tersebut ke cerita atau budaya lain dari
    Indonesia.

5.  **Materi digital budaya membutuhkan kurasi dan provenance yang
    jelas.**\
    Visual AI berpotensi memperkenalkan detail budaya yang keliru
    apabila digunakan sebagai sumber fakta. Karena itu, konten faktual
    harus berasal dari sumber yang dikurasi, sementara AI berfungsi
    sebagai alat visualisasi.

6.  **Pengalaman membaca scene yang statis belum memberi rasa
    menjelajahi dunia cerita.**\
    Untuk cerita pilihan, penyajian berbasis teks dan ilustrasi belum
    memungkinkan pengguna berpindah, mendekati, dan berinteraksi dengan
    tokoh, tempat, serta objek budaya dalam cerita. Pengalaman
    eksploratif 2D diharapkan dapat memperkaya cara pengguna menemukan
    konteks budaya cerita (hipotesis yang perlu divalidasi, lihat di
    bawah).

### Siapa yang dirugikan?

  -----------------------------------------------------------------------
  User                                Dampak
  ----------------------------------- -----------------------------------
  Remaja SMP--SMA                     Kesulitan menemukan pengalaman
                                      belajar cerita rakyat yang menarik,
                                      visual, dan mudah dieksplorasi

  Mahasiswa/dewasa                    Membutuhkan cara cepat untuk
                                      memahami konteks budaya tanpa
                                      membaca sumber yang tersebar

  Publik umum                         Akses terhadap cerita dan
                                      pengetahuan budaya Nusantara
                                      menjadi kurang terstruktur

  Guru/pendidik                       Memiliki tambahan pekerjaan untuk
                                      mencari, mengkurasi, dan
                                      menghubungkan materi cerita dengan
                                      konteks budaya

  Pemilik/penjaga pengetahuan budaya  Representasi budaya berisiko
                                      terlepas dari konteks apabila hanya
                                      disajikan sebagai cerita populer
                                      tanpa metadata dan sumber
  -----------------------------------------------------------------------

### Product hypothesis

> Jika cerita rakyat disajikan sebagai pengalaman **visual
> storytelling + eksplorasi budaya**, maka pengguna akan lebih mudah
> menemukan, memahami, dan mengeksplorasi cerita serta konteks budaya
> Indonesia dibandingkan pengalaman membaca teks saja.

Hipotesis ini perlu divalidasi melalui penggunaan MVP.

**Hipotesis tambahan (Interactive 2D):**

> Untuk cerita pilihan, jika pengguna dapat menjelajahi scene secara
> horizontal dan memicu peristiwa cerita serta informasi budaya dengan
> mendekati dan mengeklik/mengetuk karakter atau objek, maka
> keterlibatan pengguna dalam menyelesaikan cerita dan membuka konteks
> budaya dapat meningkat dibandingkan reader standar.

Hipotesis ini juga perlu divalidasi melalui vertical slice dan
penggunaan MVP (lihat bagian 10 dan 9). Belum ada target numerik yang
ditetapkan.

------------------------------------------------------------------------

# 2. Target Users dan Persona

## Primary --- Remaja SMP--SMA

### Persona: "Raka"

-   **Usia:** 13--18 tahun
-   **Konteks:** pelajar SMP/SMA
-   **Digital behavior:** terbiasa menggunakan smartphone, browser,
    media sosial, dan konten visual
-   **Motivasi:**
    -   ingin menemukan cerita yang menarik
    -   tertarik pada visual
    -   ingin memahami budaya tanpa terasa seperti membaca ensiklopedia
    -   dapat menggunakan NGM untuk tugas sekolah
-   **Pain points:**
    -   cerita rakyat terasa seperti materi pelajaran
    -   sulit mengetahui cerita apa yang menarik
    -   konteks budaya tersebar
    -   teks panjang tanpa visual membuat engagement menurun
-   **Needs:**
    -   discovery yang mudah
    -   visual
    -   navigasi sederhana
    -   informasi budaya yang ringkas tetapi bermakna
    -   pengalaman mobile-friendly

## Secondary --- Mahasiswa/dewasa

### Persona: "Dina"

-   **Usia:** 18+
-   **Motivasi:** eksplorasi budaya, nostalgia, pembelajaran, riset
    ringan
-   **Behavior:** mencari berdasarkan daerah/topik tertentu
-   **Needs:** informasi lebih kontekstual, sumber yang jelas,
    eksplorasi lintas daerah.

## Secondary --- Guru/pendidik

### Persona: "Bu Sari"

-   Menggunakan NGM sebagai media pendukung pembelajaran.
-   Membutuhkan konten yang terkurasi.
-   Membutuhkan informasi sumber dan konteks budaya yang dapat
    dipertanggungjawabkan.
-   **Bukan target utama MVP**, sehingga fitur khusus classroom/lesson
    management belum menjadi scope.

------------------------------------------------------------------------

# 3. Goals dan Non-goals

## Goals MVP

1.  Membuat katalog cerita rakyat yang mudah dieksplorasi.
2.  Memungkinkan pengguna menemukan cerita berdasarkan **daerah dan
    metadata cerita**.
3.  Memberikan pengalaman membaca interaktif.
4.  Memvisualisasikan adegan penting menggunakan AI-generated imagery.
5.  Menghubungkan cerita dengan:
    -   daerah asal
    -   tokoh
    -   nilai budaya
    -   tradisi
    -   bahasa
    -   elemen budaya terkait.
6.  Menyediakan peta interaktif sebagai entry point eksplorasi.
7.  Menyediakan CMS/admin untuk mengelola konten.
8.  Menjaga pemisahan antara **fakta terkurasi** dan **konten visual
    generatif AI**.
9.  Membuat prototype end-to-end yang dapat diuji dengan pengguna nyata.
10. Menyediakan mode **Interactive 2D Story Exploration** sebagai
    kemampuan tambahan untuk **cerita pilihan** yang aset, scene, dan
    konfigurasi interaksinya sudah lengkap, tanpa mengubah reader
    standar yang tetap digunakan oleh cerita lain.
11. Menjaga agar cerita tetap dapat dibaca melalui reader standar
    apabila mode 2D belum siap atau mengalami kegagalan.
12. Merancang model data interaksi 2D yang opsional, kompatibel dengan
    model `Story` dan `Scene` yang ada, dan dapat dipindahkan ke CMS
    pada tahap berikutnya.

## Non-goals MVP

MVP **tidak** bertujuan untuk:

-   menjadi social network budaya;
-   menyediakan marketplace produk budaya;
-   menjadi platform generative video;
-   memungkinkan pengguna mengunggah cerita secara bebas;
-   menyediakan AI chatbot budaya;
-   memberikan rekomendasi personal berbasis AI;
-   membangun sistem gamification lengkap;
-   menggantikan sumber akademik/primer mengenai kebudayaan;
-   menyediakan bahasa daerah sebagai fitur utama.

Khusus mode Interactive 2D, MVP **tidak** bertujuan untuk (lihat juga
bagian 6.3.1):

-   mengubah NGM menjadi game penuh atau mewajibkan seluruh cerita
    memiliki mode 2D;
-   menyediakan sistem pertarungan atau kesehatan;
-   menyediakan inventaris, crafting, atau pengumpulan item;
-   menyediakan fisika platformer kompleks atau puzzle berbasis fisika;
-   menyediakan open world tanpa batas;
-   menyediakan dialog bercabang kompleks, multiple endings, atau sistem
    quest kompleks;
-   menyediakan multiplayer, leaderboard, atau kompetisi;
-   menyediakan gamification lengkap;
-   menyelesaikan CMS 2D penuh pada prototype awal (konfigurasi awal
    boleh berada di source code).

------------------------------------------------------------------------

# 4. User Stories

## Discovery

-   **Sebagai remaja, saya ingin melihat katalog cerita rakyat supaya
    saya dapat menemukan cerita yang menarik untuk dibaca.**
-   **Sebagai pengguna, saya ingin mencari cerita berdasarkan judul atau
    kata kunci supaya saya dapat menemukan cerita tertentu dengan
    cepat.**
-   **Sebagai pengguna, saya ingin memfilter cerita berdasarkan daerah
    supaya saya dapat mengeksplorasi budaya dari wilayah tertentu.**
-   **Sebagai pengguna, saya ingin memilih suatu daerah dari peta supaya
    saya dapat menemukan cerita yang berasal dari daerah tersebut.**

## Reading

-   **Sebagai pengguna, saya ingin membaca cerita dalam format
    interaktif supaya pengalaman membaca tidak terasa seperti membaca
    halaman teks biasa.**
-   **Sebagai pengguna, saya ingin melihat ilustrasi untuk adegan
    penting supaya saya dapat membayangkan kejadian dalam cerita.**
-   **Sebagai pengguna, saya ingin mengetahui tokoh yang muncul dalam
    cerita supaya saya memahami peran setiap karakter.**

## Cultural exploration

-   **Sebagai pengguna, saya ingin melihat asal daerah cerita supaya
    saya memahami hubungan cerita dengan wilayah Indonesia.**
-   **Sebagai pengguna, saya ingin melihat nilai budaya yang terkandung
    dalam cerita supaya saya memahami pesan budaya di balik cerita.**
-   **Sebagai pengguna, saya ingin melihat tradisi yang berkaitan dengan
    cerita supaya saya dapat mengeksplorasi budaya secara lebih luas.**
-   **Sebagai pengguna, saya ingin mengetahui istilah atau unsur bahasa
    yang relevan supaya saya memahami konteks lokal cerita.**

## Interactive 2D Story Exploration

*(Berlaku untuk cerita pilihan yang mendukung mode 2D.)*

**Pergerakan dan eksplorasi horizontal**

-   **Sebagai pengguna, saya ingin menggerakkan avatar pemandu ke kiri
    dan ke kanan supaya saya dapat menjelajahi lingkungan cerita.**
-   **Sebagai pengguna, saya ingin kamera mengikuti avatar ketika area
    scene lebih lebar daripada layar supaya saya dapat melihat seluruh
    lingkungan tanpa kehilangan avatar.**
-   **Sebagai pengguna, saya ingin avatar berhenti di batas area scene
    supaya saya tidak tersesat di luar lingkungan cerita.**

**Penemuan dan aktivasi target interaksi**

-   **Sebagai pengguna, saya ingin mengetahui karakter atau objek mana
    yang dapat diajak berinteraksi supaya saya tidak bingung mencari
    apa yang harus dilakukan.**
-   **Sebagai pengguna, saya ingin mendekati lalu mengeklik/mengetuk
    karakter atau objek supaya saya dapat memicu peristiwa cerita.**
-   **Sebagai pengguna, saya ingin mendapat petunjuk untuk mendekat
    apabila target terlalu jauh supaya saya tahu mengapa interaksi
    belum terjadi.**

**Dialog dan narasi yang dipicu pengguna**

-   **Sebagai pengguna, saya ingin dialog atau narasi tampil ketika saya
    berinteraksi dengan target supaya saya memahami peristiwa cerita
    pada saat yang tepat.**
-   **Sebagai pengguna, saya ingin gerakan avatar berhenti sementara
    saat dialog tampil dan dapat melanjutkan dengan tombol "Lanjut"
    supaya saya dapat membaca tanpa terganggu.**

**Perpindahan linear antar-scene**

-   **Sebagai pengguna, saya ingin cerita berpindah ke scene
    berikutnya setelah peristiwa utama selesai supaya alur cerita
    tetap runtut.**
-   **Sebagai pengguna, saya ingin mengetahui posisi saya dalam cerita
    (misalnya `Scene 3 dari 8`) supaya saya tahu seberapa jauh cerita
    telah berjalan.**

**Eksplorasi informasi lingkungan dan budaya**

-   **Sebagai pengguna, saya ingin mengetuk tempat, pakaian, tradisi,
    artefak, atau istilah budaya di lingkungan cerita (jika tersedia)
    supaya saya memahami konteks budaya di balik cerita.**
-   **Sebagai pengguna, saya ingin informasi budaya tersebut tidak
    mengubah urutan utama cerita supaya saya dapat menjelajah secara
    bebas tanpa kehilangan alur.**
-   **Sebagai pengguna, saya ingin melihat sumber dari informasi budaya
    yang ditampilkan supaya saya dapat menilai kredibilitasnya.**

**Kontrol desktop dan mobile**

-   **Sebagai pengguna desktop, saya ingin bergerak dengan tombol panah
    atau A/D dan mengaktifkan target dengan klik mouse.**
-   **Sebagai pengguna mobile, saya ingin tombol kiri/kanan dan kontrol
    sentuh untuk menggerakkan avatar, serta mengetuk target secara
    langsung, tanpa kontrol yang menutupi target penting atau teks
    dialog.**

**Reader fallback**

-   **Sebagai pengguna, saya ingin tetap dapat membaca cerita melalui
    reader standar apabila mode 2D belum tersedia atau mengalami
    masalah supaya saya tidak kehilangan akses terhadap teks cerita.**
-   **Sebagai pengguna, saya ingin cerita yang belum memiliki mode 2D
    tetap berfungsi seperti sebelumnya.**

**Pengelolaan konfigurasi interaktif (untuk pengembangan CMS berikutnya)**

-   **Sebagai developer/tim produk, saya ingin scene, target, dan event
    2D didefinisikan melalui konfigurasi data terstruktur (pada
    prototype awal boleh berada di source code) supaya konfigurasi
    dapat dipindahkan ke CMS tanpa menulis ulang logika reader.**
-   **Sebagai admin (pada tahap CMS berikutnya), saya ingin menentukan
    apakah sebuah cerita mendukung mode 2D, mengatur scene, aset,
    posisi target, radius interaksi, event, dan transisi, serta
    melakukan preview sebelum publikasi supaya kualitas cerita 2D
    terjaga.**

## Content administration

-   **Sebagai admin, saya ingin membuat dan mengedit cerita supaya
    katalog NGM dapat dikelola secara terstruktur.**
-   **Sebagai admin, saya ingin mengelola tokoh dan informasi budaya
    supaya informasi pendukung cerita tetap konsisten.**
-   **Sebagai admin, saya ingin memeriksa sumber konten supaya informasi
    yang dipublikasikan dapat ditelusuri.**
-   **Sebagai admin, saya ingin mengelola visual AI supaya hanya visual
    yang telah diperiksa yang tampil kepada pengguna.**
-   **Sebagai admin, saya ingin memeriksa aset pixel art dan konfigurasi
    interaksi 2D sebelum publikasi supaya hanya cerita 2D yang lengkap,
    valid, dan sesuai konteks budaya yang tampil kepada pengguna.**

------------------------------------------------------------------------

# 5. Daftar Fitur

## MVP

### Core experience

1.  **Story Catalog**
2.  **Interactive Story Reader**
    -   Reader standar (seluruh cerita)
    -   **Interactive 2D Story Exploration** (kemampuan tambahan, hanya
        untuk cerita pilihan yang sudah siap; cerita lain tetap
        menggunakan reader standar)
3.  **AI-generated Visual Scenes**
4.  **Interactive Origin Map**
5.  **Character Profiles**
6.  **Cultural Context**
    -   nilai budaya
    -   tradisi
    -   bahasa/istilah
7.  **Search & Filter**
8.  **Admin/CMS**
9.  **Content source/provenance metadata**

### Should-have dalam MVP apabila kapasitas memungkinkan

10. **Audio/narasi**

> Audio tetap diposisikan sebagai Should-have, bukan blocker untuk
> definisi MVP selesai. MVP dapat dinyatakan selesai tanpa audio apabila
> seluruh core experience telah berfungsi.

## V2

1.  Bookmark
2.  Reading progress
3.  Audio/narasi jika belum masuk MVP
4.  Kuis/interaksi edukatif
5.  Bahasa tambahan
6.  Penyempurnaan eksplorasi lintas cerita
7.  Admin analytics
8.  Konten edukasi untuk guru
9.  Editor CMS penuh untuk konfigurasi scene Interactive 2D (posisi,
    event, radius, preview) apabila belum selesai dalam MVP (lihat Open
    Question 48)
10. Perluasan jumlah cerita yang mendukung mode 2D

## Nanti

1.  AI Story Assistant
2.  AI recommendation
3.  Kontribusi cerita dari pengguna
4.  Gamification/badge
5.  Video/animasi AI
6.  Social/community features
7.  Marketplace budaya
8.  Perluasan mode 2D di luar scope MVP (misalnya dialog bercabang,
    multiple endings, atau sistem quest) -- hanya akan dievaluasi
    setelah validasi MVP; belum ada komitmen

> **Catatan scope Interactive 2D di MVP:** hanya gerakan horizontal
> sederhana, kamera mengikuti saat diperlukan, avatar pemandu,
> interaksi karakter/objek setelah mendekat, pemicu dialog/narasi,
> tombol "Lanjut", informasi lingkungan dan budaya, transisi linear
> antar-scene, serta kontrol desktop dan mobile. Sistem pertarungan,
> inventaris, fisika platformer, open world, dialog bercabang, multiple
> endings, multiplayer/leaderboard, gamification lengkap, dan CMS 2D
> penuh pada prototype awal **tidak** termasuk MVP.

------------------------------------------------------------------------

# 6. Functional Requirements Detail --- MVP

## 6.1 Story Catalog

### Tujuan

Menjadi halaman discovery utama untuk menemukan cerita.

### Requirements

**FR-CAT-01** Sistem harus menampilkan daftar cerita yang berstatus
`published`.

**FR-CAT-02** Setiap story card minimal menampilkan:

-   judul;
-   thumbnail;
-   daerah asal;
-   deskripsi singkat;
-   metadata kategori/tag.

**FR-CAT-03** Pengguna dapat membuka detail cerita dari story card.

**FR-CAT-04** Sistem harus mendukung pagination atau infinite scroll.

**FR-CAT-05** Sistem tidak boleh menampilkan draft/unpublished story
kepada pengguna publik.

### Acceptance criteria

-   Story `draft` tidak muncul di katalog publik.
-   Story `published` muncul tanpa membutuhkan login.
-   Klik story card membuka story reader/detail yang sesuai.

------------------------------------------------------------------------

## 6.2 Search & Filter

### Search

**FR-SRCH-01** Pengguna dapat mencari berdasarkan judul cerita.

**FR-SRCH-02** Search juga dapat mencocokkan keyword yang telah
dikonfigurasi admin.

**FR-SRCH-03** Sistem menampilkan empty state jika tidak ada hasil.

### Filter

Minimal:

-   daerah/provinsi;
-   kategori/tema;
-   metadata budaya yang tersedia.

**FR-SRCH-04** Filter dapat digunakan bersamaan dengan search.

**FR-SRCH-05** Pengguna dapat menghapus seluruh filter.

### Acceptance criteria

Contoh:

> Search = "Malin" + filter = "Sumatera Barat"

Sistem hanya menampilkan cerita yang memenuhi kombinasi kriteria
tersebut.

------------------------------------------------------------------------

## 6.3 Interactive Story Reader

### Tujuan

Mengubah cerita menjadi pengalaman membaca berbasis **scene**.

Reader mendukung **dua mode pembacaan**:

| Mode | Untuk cerita | Keterangan |
|---|---|---|
| **Reader standar** | Seluruh cerita (default) | Narasi teks, visual scene, tokoh, dan anotasi budaya per scene. Bagian 6.3 (FR-READ-\*). |
| **Interactive 2D Story Exploration** | Hanya cerita pilihan yang sudah memiliki aset, scene, dan konfigurasi interaksi 2D lengkap | Kemampuan tambahan di dalam reader NGM: avatar pemandu bergerak horizontal, interaksi dengan target setelah mendekat, dialog/narasi, informasi budaya. Bagian 6.3.1--6.3.3 (FR-2D-\*). |

Mode 2D **bukan** pengganti sistem reader dan **bukan** produk game
penuh. Cerita yang belum siap tetap menggunakan reader standar.

### Struktur

Story terdiri dari:

``` text
Story
 ├── Scene 1
 ├── Scene 2
 ├── Scene 3
 └── ...
```

Setiap scene dapat memiliki:

-   teks narasi;
-   visual;
-   tokoh terkait;
-   metadata budaya terkait;
-   *(opsional, hanya cerita yang mendukung mode 2D)* konfigurasi scene
    interaktif 2D (lihat 6.3.1 dan bagian 7).

### Requirements --- Reader Standar

**FR-READ-01** Pengguna dapat memulai cerita dari scene pertama.

**FR-READ-02** Pengguna dapat berpindah antar-scene.

**FR-READ-03** Sistem menampilkan teks narasi dan visual scene secara
terintegrasi.

**FR-READ-04** Sistem harus menyediakan navigasi yang usable pada
mobile.

**FR-READ-05** Sistem harus menunjukkan posisi pengguna dalam cerita,
misalnya `Scene 3 dari 8`.

**FR-READ-06** Jika visual gagal dimuat, teks cerita tetap dapat dibaca.

**FR-READ-07** Story reader tidak membutuhkan login.

### Acceptance criteria --- Reader Standar

Pengguna dapat menyelesaikan satu cerita dari scene pertama hingga
terakhir tanpa authentication.

Persyaratan di atas tetap berlaku untuk **setiap** cerita, termasuk
cerita yang juga memiliki mode 2D (lihat FR-2D-FB-01).

### Catatan baseline prototype yang relevan dengan mode 2D

Prototype NGM yang sudah ada (React + TypeScript + Vite; berkas
`hotlink-ui-builder.zip`) digunakan sebagai referensi. Hasil pemeriksaan
kode yang relevan dengan integrasi mode 2D:

| Temuan pada prototype | Implikasi untuk mode 2D |
|---|---|
| Navigasi halaman berbasis state di `App.tsx` (`PageId`, termasuk `baca-cerita`), tanpa router; `ReaderPage` menerima `storyId`. | Mode 2D diintegrasikan **di dalam** pengalaman `ReaderPage`; tidak dibuat halaman game terpisah. |
| Model `Story` dan `Scene` didefinisikan di `src/types.ts`; data cerita di `src/data/stories.ts`; glosarium di `src/data/glossary.ts`; wilayah di `src/data/regions.ts` (pola: data dipisahkan dari komponen, penamaan `camelCase`). | Konfigurasi 2D mengikuti pola ini: field opsional pada model yang ada, data terpisah dari logika tampilan. |
| Terdapat 10 cerita pada data; hanya `roro-jonggrang` yang memiliki data scene (4 entri scene, sementara `sceneCount` dan `totalScenes` bernilai 8). Sembilan cerita lain memiliki `scenes: []`. | Kesiapan harus dinilai dari data scene aktual, dan jumlah scene pada metadata harus konsisten dengan data (masukan untuk kriteria kesiapan, Open Question 36). |
| `ReaderPage` saat ini menetapkan indeks scene awal ke scene ke-3 dan memakai scene milik cerita pertama bila suatu cerita tidak memiliki scene. | Perilaku tersebut tidak sesuai FR-READ-01 dan dapat menampilkan cerita yang salah; perlu dikoreksi pada implementasi reader standar agar fallback FR-2D-FB berperilaku benar. Ini bukan perubahan yang diminta oleh fitur 2D, hanya dicatat sebagai temuan. |
| Navigasi keyboard reader memakai tombol panah kiri/kanan untuk berpindah scene. | Konflik dengan kontrol avatar; pada mode 2D pintasan tersebut tidak boleh aktif (FR-2D-CTRL-02). |
| Setiap `Scene` memiliki satu `culturalAnnotation` (`title`, `description`, `source`, `sourceUrl?`); istilah budaya tersedia melalui `GlossaryModal` dan `GLOSSARY_TERMS` (kunci `term`). | Eksplorasi budaya 2D dapat memakai ulang bentuk data ini, tetapi satu scene 2D dapat membutuhkan lebih dari satu unit informasi budaya (lihat bagian 7). |
| `characters` pada `Scene` berupa daftar inline (`name`, `role`, `icon`) tanpa identifier. | Referensi target ke karakter membutuhkan cara identifikasi yang stabil (Open Question 46). |
| Visual scene hanya memiliki `imageUrl`/`imageAlt`; tidak ada field status generasi, lisensi, atau review. Lencana "Interpretasi Visual AI • Kurasi NGM" ditampilkan pada reader. | Status AI dan lisensi aset **tidak boleh diasumsikan** dari URL gambar; metadata provenance harus berasal dari data (lihat FR-2D-AST). Aset pixel art tidak otomatis dianggap AI-generated. |
| Identitas visual: warna warm paper, navy/indigo, terracotta (token pada `src/index.css`), tipografi Plus Jakarta Sans, kontrol ukuran teks dan Mode Hening pada reader. | Dipertahankan untuk seluruh UI di luar area scene (FR-2D-UX-03). |
| Tidak ditemukan penyimpanan data, pemanggilan API, backend, atau CMS pada `src/`. | Progres tidak tersimpan; CMS belum tersedia. Konfigurasi 2D awal berada di data/source code (keputusan 3.10). |
| Label UI memakai istilah "Adegan" untuk scene dan tombol "Lanjut ke Adegan N". | Istilah dalam PRD tetap "scene"; keseragaman label ("Adegan" vs "Scene") ditentukan pada desain UI. |

---

### 6.3.1 Interactive 2D Story Exploration

#### Ringkasan fitur

Satu cerita terdiri dari beberapa scene. Pada scene tertentu, pengguna
mengendalikan **avatar atau karakter pemandu** yang bergerak horizontal
ke kiri dan kanan dalam lingkungan 2D bergaya pixel art. Kamera
mengikuti avatar bila area scene lebih lebar daripada layar. Pengguna
mendekati karakter atau objek tertentu, lalu mengeklik/mengetuknya
untuk memicu peristiwa cerita. Saat peristiwa dipicu, gerakan avatar
berhenti sementara, dialog atau narasi tampil pada panel informasi, dan
pengguna menekan "Lanjut" untuk melanjutkan eksplorasi atau berpindah
ke scene berikutnya. Pengguna juga dapat menjelajahi informasi
lingkungan dan budaya (tempat, pakaian, tradisi, artefak, istilah
budaya) selama datanya tersedia dan telah dikurasi.

#### Keputusan produk final

Keputusan berikut sudah ditetapkan dan tidak diubah tanpa persetujuan
product owner. Detail yang tidak tercantum di sini **belum** diputuskan
dan dicatat di bagian 11.

| # | Area | Keputusan final |
|---|---|---|
| 1 | Cakupan cerita | Tidak semua cerita wajib memiliki mode 2D. Hanya cerita pilihan dengan aset, scene, dan konfigurasi interaksi lengkap yang dapat memakainya. Cerita lain tetap memakai reader standar. Mode 2D adalah tambahan, bukan pengganti reader. |
| 2 | Karakter pemain | Pengguna mengendalikan avatar/karakter pemandu. Avatar tidak otomatis menjadi tokoh utama cerita; tokoh cerita tetap entitas terpisah dari avatar. |
| 3 | Gerakan & kamera | Avatar bergerak horizontal kiri/kanan. Kamera dapat mengikuti avatar bila scene lebih lebar dari layar. Avatar tidak boleh melewati batas area scene. Fokus: eksplorasi horizontal sederhana, bukan platformer kompleks. |
| 4 | Pemicu interaksi | Pengguna harus mendekati target, lalu mengeklik/mengetuknya. Sistem memvalidasi jarak avatar-target; bila terlalu jauh, event tidak dipicu dan petunjuk untuk mendekat ditampilkan. Objek dekoratif yang tidak dikonfigurasi sebagai target tidak boleh memicu event. |
| 5 | Perilaku saat interaksi | Setelah target valid diaktifkan, gerakan avatar berhenti sementara; dialog/narasi relevan ditampilkan; pengguna menekan "Lanjut"; kontrol kembali ke pengguna atau cerita pindah ke scene berikutnya sesuai konfigurasi. |
| 6 | Alur cerita | Alur peristiwa utama linear. Interaksi tambahan membuka informasi lingkungan/budaya dan tidak mengubah urutan utama. Dialog bercabang kompleks, multiple endings, dan quest kompleks bukan bagian MVP. |
| 7 | Gaya visual | Mode interaktif memakai pixel art 2D; aset latar, avatar, karakter, dan objek interaktif dibuat khusus. Identitas visual utama NGM dipertahankan pada UI di luar area scene; seluruh situs tidak diubah menjadi pixel art. |
| 8 | Layout reader | Area scene menjadi fokus visual utama. Dialog, narasi, dan informasi budaya muncul melalui panel informasi yang mudah dibaca. Mode 2D tetap berada di dalam reader NGM. Katalog, peta, glosarium, halaman sumber, dan navigasi utama tetap menjadi bagian produk. |
| 9 | Kontrol | Desktop: panah atau A/D untuk bergerak, klik mouse untuk target. Mobile: tombol gerak kiri/kanan, kontrol berbasis sentuhan untuk menggerakkan avatar, target tetap dapat diketuk langsung; kontrol tidak boleh menutupi target penting atau menghalangi pembacaan dialog. |
| 10 | Implementasi & CMS | Prototype awal boleh mendefinisikan scene dan event melalui konfigurasi data di dalam kode. Model data dirancang agar dapat dikembangkan dan dipindahkan ke CMS. CMS 2D penuh tidak wajib pada prototype awal. Data interaksi tidak dicampur langsung ke logika tampilan tanpa struktur yang jelas. |
| 11 | Fallback | Selama mode 2D belum siap, cerita memakai reader standar. Jika aset atau interaksi 2D gagal, pengguna tetap memiliki akses ke teks cerita. Cerita standar yang sudah ada tidak boleh rusak atau diwajibkan memiliki konfigurasi 2D. |

#### Batasan scope MVP

**Termasuk MVP:** gerakan horizontal sederhana; kamera mengikuti saat
diperlukan; avatar pemandu; interaksi karakter/objek setelah mendekat;
pemicu dialog/narasi; tombol "Lanjut"; informasi lingkungan dan budaya;
transisi linear antar-scene; kontrol desktop dan mobile.

**Tidak termasuk MVP:** sistem pertarungan atau kesehatan; inventaris,
crafting, atau pengumpulan item; fisika platformer kompleks; open world
tanpa batas; puzzle berbasis fisika; dialog bercabang kompleks; banyak
ending; multiplayer, leaderboard, atau kompetisi; gamification lengkap;
CMS 2D penuh pada prototype awal.

#### A. Pemilihan mode berdasarkan kesiapan cerita (FR-2D-MODE)

**FR-2D-MODE-01** Setiap cerita menggunakan **reader standar** secara
default. Mode Interactive 2D hanya tersedia untuk cerita yang
dinyatakan siap untuk mode 2D.

**FR-2D-MODE-02** Sebuah cerita dinyatakan siap untuk mode 2D hanya
apabila status kesiapannya `ready` **dan** konfigurasinya lolos
validasi, minimal: aset latar dan sprite tersedia untuk setiap scene 2D,
urutan scene valid, setiap scene 2D memiliki target dan event yang valid,
serta transisi scene valid. Kriteria final kesiapan belum ditetapkan
(Open Question 36).

**FR-2D-MODE-03** Cerita yang tidak memiliki konfigurasi 2D, atau
berstatus belum siap, menggunakan reader standar **tanpa perubahan
perilaku** dan tanpa pesan kesalahan.

**FR-2D-MODE-04** Seluruh field konfigurasi 2D bersifat **opsional**
pada model data. Data `Story` dan `Scene` yang sudah ada harus tetap
valid dan dapat dirender tanpa modifikasi.

**FR-2D-MODE-05** Mode 2D dijalankan di dalam pengalaman reader NGM
(`ReaderPage`/komponen turunannya), bukan sebagai aplikasi atau halaman
game terpisah. Navigasi utama, katalog, peta, glosarium, dan halaman
sumber tetap tersedia.

**FR-2D-MODE-06** Pemilihan mode ditentukan sistem berdasarkan
kesiapan cerita. Apakah pengguna dapat berpindah secara manual antara
reader standar dan mode 2D, serta apakah story card menandai cerita 2D,
belum diputuskan (Open Question 39).

#### B. Konfigurasi dan rendering scene (FR-2D-SCN)

**FR-2D-SCN-01** Setiap scene 2D didefinisikan melalui konfigurasi data
terstruktur yang mencakup: referensi aset latar, lebar dunia, batas
gerak, posisi awal avatar, daftar target interaktif, daftar event, dan
scene berikutnya.

**FR-2D-SCN-02** Data konfigurasi 2D harus dipisahkan dari logika
tampilan (modul data/konfigurasi terpisah, mengikuti pola `src/data`
yang sudah ada), sehingga dapat dipindahkan ke CMS tanpa menulis ulang
logika reader.

**FR-2D-SCN-03** Sistem merender area scene 2D sebagai fokus visual
utama reader, berisi latar, target interaktif, dan avatar.

**FR-2D-SCN-04** Scene 2D tetap merupakan `Scene` yang sama dengan model
yang ada (nomor scene, judul bagian, narasi, tokoh, anotasi budaya),
sehingga hubungan antara narasi, tokoh, dan anotasi budaya tetap
terjaga.

**FR-2D-SCN-05** Posisi pengguna dalam cerita tetap ditampilkan
(FR-READ-05), berdasarkan jumlah scene yang benar-benar tersedia.

**FR-2D-SCN-06** Sistem memvalidasi konfigurasi scene saat dimuat
(referensi target-event, referensi scene berikutnya, aset, dan batas
gerak). Konfigurasi yang tidak valid ditangani sesuai FR-2D-FB.

#### C. Pergerakan avatar (FR-2D-MOVE)

**FR-2D-MOVE-01** Pengguna mengendalikan avatar/karakter pemandu.
Avatar adalah entitas terpisah dari tokoh cerita (lihat FR-CHAR-06).

**FR-2D-MOVE-02** Avatar bergerak secara horizontal ke kiri dan ke
kanan saja. MVP tidak mencakup lompat, gravitasi, atau fisika
platformer.

**FR-2D-MOVE-03** Avatar mulai dari posisi awal yang dikonfigurasi pada
setiap scene.

**FR-2D-MOVE-04** Avatar berhenti bergerak ketika input gerak dilepas
atau ketika sebuah event sedang aktif.

**FR-2D-MOVE-05** Kecepatan gerak avatar dikonfigurasi pada data avatar.
Nilai kecepatan dan animasi karakter yang diperlukan belum ditetapkan
(Open Question 30).

#### D. Kamera horizontal (FR-2D-CAM)

**FR-2D-CAM-01** Apabila lebar dunia scene lebih besar daripada lebar
area tampilan, kamera mengikuti pergerakan horizontal avatar sehingga
avatar tetap terlihat.

**FR-2D-CAM-02** Kamera tidak boleh menampilkan area di luar dunia scene
(kamera dibatasi pada tepi dunia).

**FR-2D-CAM-03** Apabila lebar dunia tidak lebih besar daripada area
tampilan, kamera tidak bergerak.

**FR-2D-CAM-04** Perilaku kamera harus tetap benar ketika ukuran
viewport berubah (misalnya perubahan ukuran jendela atau rotasi
perangkat). Gaya pergerakan kamera (halus atau langsung) ditentukan
pada desain lanjutan.

#### E. Batas area gerak (FR-2D-BND)

**FR-2D-BND-01** Avatar tidak boleh bergerak melewati batas kiri dan
kanan area scene yang dikonfigurasi.

**FR-2D-BND-02** Ketika avatar mencapai batas, avatar berhenti tanpa
error dan input arah menuju luar batas diabaikan.

**FR-2D-BND-03** Konfigurasi batas harus valid: batas minimum lebih
kecil daripada batas maksimum, berada di dalam lebar dunia, dan posisi
awal avatar berada di dalam batas.

**FR-2D-BND-04** Setiap target wajib harus dapat dijangkau, yaitu ada
posisi avatar di dalam batas gerak yang berada dalam radius interaksi
target. Konfigurasi yang melanggar ini dianggap tidak valid.

#### F. Target interaktif dan validasi jarak (FR-2D-TGT)

**FR-2D-TGT-01** Hanya entitas yang dikonfigurasi sebagai **target
interaktif** yang dapat memicu event. Objek dekoratif yang tidak
dikonfigurasi sebagai target tidak boleh memicu peristiwa cerita.

**FR-2D-TGT-02** Setiap target memiliki: scene, jenis target, referensi
entitas (karakter, objek, atau elemen lingkungan/budaya), posisi
horizontal, radius interaksi, petunjuk interaksi, event terkait, dan
konten budaya terkait (jika ada).

**FR-2D-TGT-03** Target diaktifkan dengan mengeklik (mouse) atau
mengetuk (sentuh) target secara langsung. Klik/ketuk pada area yang
bukan target tidak memiliki efek.

**FR-2D-TGT-04** Saat target diaktifkan, sistem memvalidasi jarak
horizontal antara avatar dan target terhadap radius interaksi target.

**FR-2D-TGT-05** Jika avatar berada di dalam radius interaksi, event
dipicu. Jika avatar terlalu jauh, event **tidak** dipicu dan sistem
menampilkan petunjuk untuk mendekat.

**FR-2D-TGT-06** Radius interaksi dikonfigurasi per target. Cara
menentukan nilai radius belum ditetapkan (Open Question 31).

#### G. Pemicu event (FR-2D-EVT)

**FR-2D-EVT-01** Setiap target terhubung dengan event yang dikonfigurasi,
dan setiap event mencatat target pemicunya.

**FR-2D-EVT-02** Event memiliki jenis (narasi utama, dialog, atau
informasi lingkungan/budaya) dan kondisi **wajib** atau **opsional**.

**FR-2D-EVT-03** Ketika event valid dipicu, input gerak dinonaktifkan
sementara dan avatar berhenti. Selama event aktif, target lain tidak
dapat diaktifkan sehingga tidak terjadi event ganda.

**FR-2D-EVT-04** Event wajib membentuk alur peristiwa utama yang linear.
Event opsional (informasi lingkungan/budaya) tidak boleh mengubah urutan
utama cerita.

**FR-2D-EVT-05** Apabila satu scene memiliki lebih dari satu event
wajib, urutannya mengikuti konfigurasi. Mekanisme dan batas jumlah event
wajib per scene belum ditetapkan (Open Question 28 dan 41).

**FR-2D-EVT-06** Penyelesaian sebuah event hanya dihitung satu kali
terhadap progres scene, meskipun target diaktifkan berulang kali
(lihat bagian 8). Perilaku menampilkan ulang event yang sudah selesai
belum ditetapkan (Open Question 41).

**FR-2D-EVT-07** Event dapat dikaitkan dengan konten budaya terkait
(lihat FR-2D-CULT).

**FR-2D-EVT-08** Kegagalan menampilkan atau menyelesaikan event
ditangani sesuai FR-2D-FB-03.

#### H. Dialog/narasi dan tombol "Lanjut" (FR-2D-DLG)

**FR-2D-DLG-01** Dialog atau narasi ditampilkan pada panel informasi
yang mudah dibaca, memuat teks dan (opsional) nama pembicara.

**FR-2D-DLG-02** Konten yang ditampilkan harus relevan dengan target
yang diaktifkan dan berasal dari konten cerita yang terkurasi.

**FR-2D-DLG-03** Panel menyediakan tombol berlabel **"Lanjut"**. Apabila
dialog terdiri atas beberapa bagian berurutan (tanpa percabangan),
"Lanjut" menampilkan bagian berikutnya; pada bagian terakhir, "Lanjut"
menutup/menyelesaikan dialog.

**FR-2D-DLG-04** Selama panel terbuka, gerakan avatar dan aktivasi
target lain dinonaktifkan.

**FR-2D-DLG-05** Setelah dialog diselesaikan dengan "Lanjut", sistem
menjalankan aksi setelah event sesuai konfigurasi: mengembalikan
kontrol kepada pengguna, atau berpindah ke scene berikutnya.

**FR-2D-DLG-06** MVP tidak menyediakan pilihan jawaban atau dialog
bercabang.

#### I. Informasi lingkungan dan budaya (FR-2D-CULT)

**FR-2D-CULT-01** Target bertipe lingkungan/budaya (misalnya tempat,
pakaian, tradisi, artefak, atau istilah budaya) hanya boleh dikonfigurasi
apabila datanya tersedia dan telah dikurasi. Sistem tidak boleh membuat
informasi budaya sintetis (konsisten dengan bagian 8).

**FR-2D-CULT-02** Aktivasi target budaya menampilkan informasi budaya
(judul, deskripsi, dan sumber) pada panel informasi. Setiap informasi
budaya harus memiliki sumber (FR-CULT-02) dan dibedakan secara visual
dari teks cerita (FR-CULT-03).

**FR-2D-CULT-03** Interaksi budaya bersifat opsional kecuali
dikonfigurasi sebagai wajib, dan tidak mengubah urutan utama cerita.

**FR-2D-CULT-04** Informasi budaya pada mode 2D dapat memakai ulang
`culturalAnnotation` scene, istilah glosarium yang ada, atau unit
informasi budaya baru, sehingga hubungan narasi-tokoh-anotasi budaya
yang sudah ada tidak hilang. Cara menampilkan anotasi scene dan
glosarium di dalam mode 2D ditentukan pada desain lanjutan (Open
Question 42).

**FR-2D-CULT-05** Akses ke glosarium dan halaman sumber dari navigasi
utama tetap tersedia selama mode 2D.

#### J. Transisi scene linear (FR-2D-TRN)

**FR-2D-TRN-01** Perpindahan antar-scene mengikuti urutan linear sesuai
konfigurasi scene berikutnya.

**FR-2D-TRN-02** Transisi ke scene berikutnya hanya terjadi setelah
semua event wajib scene tersebut selesai, melalui aksi setelah event
yang dikonfigurasi (FR-2D-DLG-05).

**FR-2D-TRN-03** Pada scene baru, avatar ditempatkan pada posisi awal
scene tersebut dan kamera diatur sesuai posisi avatar.

**FR-2D-TRN-04** Apabila scene berikutnya tidak ditemukan atau tidak
valid, pengguna tidak boleh terjebak (lihat FR-2D-FB-04).

**FR-2D-TRN-05** Perilaku navigasi mundur atau lompat antar-scene pada
mode 2D belum diputuskan (Open Question 40).

#### K. Kontrol desktop dan mobile (FR-2D-CTRL)

**FR-2D-CTRL-01** **Desktop:** pergerakan ke kiri dan kanan menggunakan
tombol panah atau A/D; target diaktifkan melalui klik mouse.

**FR-2D-CTRL-02** Pada mode 2D, pintasan keyboard reader standar yang
berpindah scene dengan tombol panah **tidak boleh aktif**. Tombol
gerak tidak boleh bereaksi ketika fokus berada pada kolom input (misalnya
pencarian), dan tidak boleh menyebabkan halaman bergulir selama scene
aktif.

**FR-2D-CTRL-03** **Mobile:** tersedia tombol gerak kiri dan kanan, serta
kontrol berbasis sentuhan untuk menggerakkan avatar. Target interaksi
tetap dapat diketuk secara langsung. Bentuk detail kontrol sentuh
belum ditetapkan (Open Question 32).

**FR-2D-CTRL-04** Kontrol mobile tidak boleh menutupi target penting
atau menghalangi pembacaan dialog. Saat panel dialog terbuka, kontrol
gerak tidak boleh mengganggu pembacaan.

**FR-2D-CTRL-05** Input kiri dan kanan yang ditekan bersamaan tidak
boleh menghasilkan perilaku yang tidak terdefinisi (avatar mengikuti
aturan yang deterministik).

#### L. Fallback dan kegagalan aset (FR-2D-FB)

**FR-2D-FB-01** Teks cerita lengkap setiap scene tetap tersedia melalui
reader standar untuk **setiap** cerita, termasuk cerita 2D. Scene 2D
tidak boleh menghilangkan akses ke teks cerita.

**FR-2D-FB-02** Apabila aset latar atau sprite penting gagal dimuat,
atau konfigurasi tidak valid, sistem beralih ke reader standar dan
menampilkan pesan singkat; teks cerita tetap dapat dibaca. Granularitas
fallback (per scene atau seluruh cerita) belum ditetapkan (Open
Question 44).

**FR-2D-FB-03** Kegagalan pada satu event atau panel tidak boleh
mengunci kontrol secara permanen. Pengguna dapat menutup panel dan
kembali ke eksplorasi atau beralih ke teks cerita.

**FR-2D-FB-04** Apabila scene berikutnya tidak ditemukan atau tidak
valid, pengguna tetap berada pada scene saat ini dengan pesan yang
jelas dan jalan keluar menuju reader standar atau katalog.

**FR-2D-FB-05** Cerita tanpa konfigurasi 2D tidak boleh menimbulkan
error dan tidak boleh diwajibkan memiliki field 2D.

**FR-2D-FB-06** Kegagalan 2D dicatat untuk keperluan metrik (lihat
bagian 9).

#### M. Kondisi penyelesaian scene dan cerita (FR-2D-CMP)

**FR-2D-CMP-01** Sebuah scene dinyatakan selesai ketika seluruh event
berkondisi wajib pada scene tersebut telah selesai dan aksi setelah
event dijalankan. Event opsional tidak diperlukan untuk penyelesaian.

**FR-2D-CMP-02** Konfigurasi scene harus memiliki jalur penyelesaian
yang valid: scene yang seluruh event wajibnya selesai harus dapat
berpindah ke scene berikutnya atau mengakhiri cerita.

**FR-2D-CMP-03** Cerita dinyatakan selesai ketika scene terakhir
selesai. Setelah itu pengguna diarahkan ke langkah eksplorasi lanjutan
yang sudah ada pada produk (misalnya katalog, peta, atau glosarium).
Bentuk final layar penutup ditentukan pada desain lanjutan.

**FR-2D-CMP-04** Penyelesaian scene dan cerita dicatat sesuai definisi
metrik (bagian 9).

**FR-2D-CMP-05** Penyimpanan progres mode 2D antar-sesi belum
diputuskan (Open Question 37 dan 38).

#### N. Aset 2D dan provenance (FR-2D-AST)

**FR-2D-AST-01** Aset pixel art (latar, avatar, karakter, objek
interaktif) dibuat khusus untuk mode 2D; ilustrasi scene reader standar
tidak menggantikan aset 2D.

**FR-2D-AST-02** Setiap aset 2D memiliki metadata sumber, metode
pembuatan, status lisensi/hak, dan status review, selaras dengan bagian
8 (Rights & provenance) dan FR-AI-06.

**FR-2D-AST-03** Aset tanpa status lisensi/hak yang jelas tidak boleh
dipublikasikan.

**FR-2D-AST-04** Status "dibuat dengan AI" atau status lisensi hanya
boleh dinyatakan apabila didukung data yang tersedia, dan tidak boleh
disimpulkan dari URL gambar.

**FR-2D-AST-05** Representasi budaya pada aset (misalnya busana,
arsitektur, artefak) harus ditinjau terhadap sumber terkurasi sebelum
cerita dinyatakan siap untuk mode 2D. Apabila AI digunakan dalam
produksi aset, FR-AI-07 berlaku (AI bukan sumber fakta budaya).
Penanggung jawab persetujuan belum ditetapkan (Open Question 35).

---

### 6.3.2 UI/UX Requirements --- Interactive 2D

**FR-2D-UX-01** Area scene menjadi fokus visual utama pada reader
interaktif. Ukuran dan rasio final area scene belum ditetapkan (Open
Question 45).

**FR-2D-UX-02** Lingkungan, avatar, karakter, dan objek interaktif dalam
area scene menggunakan gaya **pixel art 2D**. Aset ditampilkan tanpa
pelembutan yang merusak ketajamannya. Standar ukuran sprite dan
resolusi aset belum ditetapkan (Open Question 34).

**FR-2D-UX-03** UI di luar area scene (header, footer, tombol, panel,
tipografi, warna) mempertahankan identitas visual NGM: warm paper,
navy/indigo, terracotta, dan Plus Jakarta Sans. Situs tidak diubah
menjadi pixel art.

**FR-2D-UX-04** Dialog dan narasi tampil pada panel informasi yang mudah
dibaca (kontras dan ukuran teks memadai) dan sebagai teks yang nyata,
bukan sebagai bagian dari gambar aset. Posisi final panel pada desktop
dan mobile belum ditetapkan (Open Question 33).

**FR-2D-UX-05** Panel informasi budaya dibedakan secara visual dari
panel dialog cerita dan menampilkan judul, deskripsi, serta sumber.

**FR-2D-UX-06** Target interaktif harus dapat dibedakan secara visual
dari objek dekoratif. Petunjuk visual dan petunjuk "dekati target"
tidak boleh hanya bergantung pada warna. Bentuk indikator final
ditentukan pada desain lanjutan.

**FR-2D-UX-07** Pada desktop, target yang dapat diaktifkan memberikan
umpan balik saat kursor diarahkan (misalnya perubahan kursor atau
sorotan). Pada mobile, area ketuk target harus cukup mudah diketuk;
ukuran minimum belum ditetapkan.

**FR-2D-UX-08** Tombol arah pada mobile tersedia dan berukuran nyaman
untuk jempol. Ukuran dan posisi final tombol belum ditetapkan (Open
Question 32).

**FR-2D-UX-09** Pada scene yang lebih lebar daripada layar, avatar tetap
terlihat dan pengguna dapat mengenali bahwa area scene dapat dijelajahi
(petunjuk visual ditentukan pada desain lanjutan).

**FR-2D-UX-10** Keterbacaan teks pada panel dijaga di desktop dan
mobile. Dukungan kontrol keterbacaan yang sudah ada pada reader standar
(ukuran teks, Mode Hening) pada mode 2D dipertimbangkan; cakupan MVP
ditentukan pada desain lanjutan.

**FR-2D-UX-11** Tata letak mode 2D responsif pada ukuran layar desktop
dan mobile. Orientasi layar dan rasio area scene pada mobile belum
ditetapkan (Open Question 45).

**FR-2D-UX-12** Indikator posisi cerita (misalnya `Scene 3 dari 8`) dan
akses kembali ke katalog tetap tersedia.

**FR-2D-UX-13** Saat aset 2D sedang dimuat, sistem menampilkan status
memuat. Akses ke teks cerita tidak boleh bergantung pada selesainya
pemuatan aset 2D.

---

### 6.3.3 Acceptance Criteria --- Interactive 2D

**AC-2D-01 (Pemilihan mode)** Cerita berstatus siap 2D dengan konfigurasi
valid terbuka dalam mode 2D; cerita tanpa konfigurasi 2D atau berstatus
belum siap terbuka dalam reader standar.

**AC-2D-02 (Kompatibilitas data)** Data `Story` dan `Scene` yang sudah
ada, tanpa field 2D, tetap valid dan dirender oleh reader standar tanpa
perubahan data.

**AC-2D-03 (Gerak horizontal)** Menekan panah kiri/A menggerakkan avatar
ke kiri dan panah kanan/D ke kanan; avatar berhenti ketika tombol
dilepas. Tombol gerak dan kontrol sentuh pada mobile memberikan hasil
yang sama.

**AC-2D-04 (Batas gerak)** Avatar tidak dapat melewati batas kiri dan
kanan scene, dan upaya bergerak ke luar batas tidak menimbulkan error.

**AC-2D-05 (Kamera)** Pada scene yang lebih lebar daripada layar, kamera
mengikuti avatar, avatar tetap terlihat, dan area di luar dunia scene
tidak pernah tampil. Pada scene yang tidak lebih lebar daripada layar,
kamera tidak bergerak.

**AC-2D-06 (Validasi jarak)** Mengeklik/mengetuk target saat avatar di
luar radius interaksi tidak memicu event dan menampilkan petunjuk untuk
mendekat; saat avatar di dalam radius, event dipicu.

**AC-2D-07 (Objek dekoratif)** Mengeklik/mengetuk objek dekoratif yang
bukan target tidak memicu event dan tidak mengubah progres.

**AC-2D-08 (Pemicu dan jeda)** Setelah target valid diaktifkan, avatar
berhenti, input gerak diabaikan, dan panel dialog/narasi yang sesuai
dengan target tampil.

**AC-2D-09 (Tombol "Lanjut")** Menekan "Lanjut" menutup atau
melanjutkan dialog; setelah dialog terakhir, kontrol dikembalikan
kepada pengguna atau cerita berpindah ke scene berikutnya sesuai
konfigurasi.

**AC-2D-10 (Aktivasi berulang)** Mengeklik target berulang kali atau
mengaktifkan target lain saat event aktif tidak memicu event ganda dan
tidak menghitung progres dua kali.

**AC-2D-11 (Alur linear)** Pengguna dapat menyelesaikan cerita 2D dari
scene pertama sampai terakhir sesuai urutan; scene berikutnya tidak
dapat dicapai sebelum event wajib scene saat ini selesai.

**AC-2D-12 (Informasi budaya)** Target budaya menampilkan judul,
deskripsi, dan sumber; membuka atau tidak membuka informasi budaya tidak
mengubah urutan utama cerita; target budaya tidak dibuat apabila datanya
tidak tersedia.

**AC-2D-13 (Kontrol desktop dan mobile)** Seluruh alur utama dapat
diselesaikan hanya dengan kontrol desktop (keyboard dan mouse) dan
hanya dengan kontrol mobile (pada viewport kecil); kontrol mobile tidak
menutupi target wajib maupun panel dialog.

**AC-2D-14 (Konflik keyboard)** Pada mode 2D, tombol panah tidak
berpindah scene dan mengetik pada kolom pencarian tidak menggerakkan
avatar.

**AC-2D-15 (Fallback aset)** Jika aset latar atau sprite penting
gagal dimuat, pengguna tetap dapat membaca teks cerita melalui
reader standar dan tidak menemui layar kosong tanpa jalan keluar.

**AC-2D-16 (Kegagalan event/transisi)** Jika event gagal ditampilkan atau
scene berikutnya tidak valid, kontrol tidak terkunci permanen dan
pengguna mendapat pesan serta jalan keluar.

**AC-2D-17 (Regresi reader standar)** Cerita tanpa mode 2D lulus seluruh
acceptance criteria reader standar (FR-READ) setelah fitur 2D
ditambahkan.

**AC-2D-18 (Penyelesaian)** Menyelesaikan scene terakhir menandai cerita
selesai dan mencatat penyelesaian sesuai definisi metrik.

**AC-2D-19 (Aset dan provenance)** Aset 2D tanpa status lisensi/hak yang
jelas tidak lolos pemeriksaan publikasi; pada prototype awal
pemeriksaan ini dilakukan secara manual melalui checklist, sedangkan
pada tahap CMS dilakukan oleh sistem.

------------------------------------------------------------------------

## 6.4 AI-generated Visual Scenes

### Prinsip penting

AI **bukan source of truth budaya**.

Pipeline:

``` text
Curated Story
      ↓
Scene Definition
      ↓
Curated Cultural Context
      ↓
AI Prompt
      ↓
Image Generation
      ↓
Admin Review
      ↓
Published Visual
```

### Requirements

**FR-AI-01** Setiap scene dapat memiliki satu atau lebih visual.

**FR-AI-02** Prompt visual harus dapat dikaitkan dengan scene.

**FR-AI-03** Admin dapat melihat hasil visual sebelum publikasi.

**FR-AI-04** Admin dapat menolak visual.

**FR-AI-05** Visual yang ditolak tidak boleh muncul pada public reader.

**FR-AI-06** Sistem harus menyimpan metadata bahwa visual dibuat
menggunakan AI.

**FR-AI-07** AI-generated image tidak boleh menjadi satu-satunya sumber
fakta mengenai pakaian, tradisi, arsitektur, tokoh, atau unsur budaya.

### Acceptance criteria

Sebuah scene hanya dapat menggunakan visual dengan status:

`approved` → public.

### Relasi dengan aset pixel art mode 2D

Aset pixel art untuk mode Interactive 2D (latar, avatar, karakter,
objek) dibuat khusus untuk mode tersebut dan tidak otomatis dianggap
sebagai visual AI-generated. Status pembuatan, lisensi, dan review aset
2D mengikuti prinsip provenance yang sama dan diatur pada FR-2D-AST-01
sampai FR-2D-AST-05. Metode produksi aset pixel art belum diputuskan
(Open Question 43).

------------------------------------------------------------------------

## 6.5 Interactive Origin Map

### Tujuan

Memungkinkan pengguna mengeksplorasi cerita berdasarkan geografi.

### Requirements

**FR-MAP-01** Sistem menampilkan peta Indonesia.

**FR-MAP-02** Story yang memiliki koordinat/geographic metadata dapat
direpresentasikan pada peta.

**FR-MAP-03** Pengguna dapat memilih marker/region.

**FR-MAP-04** Sistem menampilkan cerita yang terkait dengan wilayah
tersebut.

**FR-MAP-05** Peta harus usable pada mobile.

**FR-MAP-06** Sistem tidak boleh mengarang lokasi apabila sumber cerita
hanya menyebut wilayah secara ambigu.

### Data minimum

``` text
region_name
province
latitude
longitude
location_precision
```

`location_precision` penting untuk membedakan:

-   exact location;
-   city;
-   province;
-   approximate;
-   unknown.

------------------------------------------------------------------------

## 6.6 Character Profiles

### Requirements

**FR-CHAR-01** Story dapat memiliki beberapa character.

**FR-CHAR-02** Character memiliki:

-   nama;
-   deskripsi;
-   peran dalam cerita;
-   visual/portrait jika tersedia.

**FR-CHAR-03** Character dapat dikaitkan dengan scene.

**FR-CHAR-04** Pengguna dapat membuka informasi character dari story
reader.

**FR-CHAR-05** Character tidak boleh dianggap sebagai fakta historis
apabila karakter tersebut merupakan tokoh folklor/legenda.

**FR-CHAR-06** *(Interactive 2D)* Avatar/karakter pemandu pada mode 2D
**bukan** `Character` cerita dan tidak otomatis menjadi tokoh utama.
Avatar tidak boleh ditampilkan sebagai tokoh folklor atau sebagai
sumber fakta budaya.

**FR-CHAR-07** *(Interactive 2D)* Tokoh cerita pada scene 2D dapat
menjadi target interaktif. Mengaktifkan target karakter dapat membuka
informasi karakter (FR-CHAR-04) dan/atau memicu event cerita sesuai
konfigurasi.

------------------------------------------------------------------------

## 6.7 Cultural Context

Setiap cerita dapat memiliki beberapa cultural context.

### Categories

``` text
Nilai Budaya
Tradisi
Bahasa/Istilah
Tempat
Pakaian
Makanan
Kesenian
Kepercayaan
Artefak
```

Tidak semua kategori wajib tersedia untuk setiap cerita.

### Requirements

**FR-CULT-01** Admin dapat menambahkan cultural information ke story.

**FR-CULT-02** Setiap cultural information harus memiliki sumber.

**FR-CULT-03** Informasi ditampilkan dalam section terpisah dari teks
cerita.

**FR-CULT-04** Pengguna dapat melihat hubungan antara cerita dan
cultural information.

**FR-CULT-05** Informasi budaya harus dapat diperbarui tanpa mengubah
teks cerita.

**FR-CULT-06** *(Interactive 2D)* Informasi budaya yang ditampilkan
melalui target interaktif 2D tunduk pada aturan yang sama dengan
FR-CULT-01 sampai FR-CULT-05: wajib bersumber, terpisah dari teks
cerita, dan hanya ditampilkan apabila datanya tersedia dan terkurasi.

**FR-CULT-07** *(Interactive 2D)* Satu scene 2D dapat memiliki lebih
dari satu unit informasi budaya (misalnya tempat, pakaian, tradisi,
artefak, atau istilah) yang terhubung dengan target yang berbeda.

### Source metadata

Minimal:

``` text
source_title
source_author
source_url / reference
publication_year
license / rights_status
verification_status
```

------------------------------------------------------------------------

## 6.8 Audio/Narasi --- Should-have

Jika dimasukkan dalam build MVP:

**FR-AUDIO-01** Scene dapat memiliki audio narration.

**FR-AUDIO-02** Pengguna dapat play/pause audio.

**FR-AUDIO-03** Audio tidak boleh menjadi satu-satunya cara memahami
cerita.

**FR-AUDIO-04** Jika audio gagal, text reader tetap berfungsi.

**FR-AUDIO-05** Audio asset harus memiliki status lisensi/source yang
jelas.

------------------------------------------------------------------------

## 6.9 Admin/CMS

CMS merupakan **must-have** karena kualitas konten merupakan bagian
fundamental produk.

### Story management

Admin dapat:

-   create story;
-   edit story;
-   delete/archive story;
-   publish/unpublish story;
-   mengatur scene;
-   mengatur metadata;
-   mengatur sumber.

### Character management

Admin dapat:

-   create;
-   edit;
-   archive;
-   associate dengan story/scene.

### Cultural content

Admin dapat:

-   create;
-   edit;
-   associate;
-   menambahkan source;
-   menandai verification status.

### AI visual management

Admin dapat:

-   generate/request visual;
-   melihat hasil;
-   approve;
-   reject;
-   replace visual.

### Workflow

``` text
Draft
  ↓
Content Review
  ↓
Visual Review
  ↓
Approved
  ↓
Published
```

**FR-CMS-01** Hanya konten `published` yang tersedia di public
application.

### Konfigurasi Interactive 2D (kebutuhan jangka produk)

CMS merupakan kebutuhan produk. Pada **prototype awal**, scene dan
event 2D boleh didefinisikan melalui konfigurasi data di source code;
**CMS 2D penuh tidak wajib diselesaikan pada prototype awal**. Namun
model data harus dirancang agar kebutuhan berikut dapat dipenuhi oleh
CMS pada tahap berikutnya tanpa mengubah struktur secara mendasar.
Apakah kebutuhan ini masuk dalam release MVP penuh atau V2 belum
diputuskan (Open Question 48).

**FR-CMS2D-01** Admin dapat menentukan apakah sebuah cerita mendukung
mode 2D dan mengatur status kesiapannya.

**FR-CMS2D-02** Admin dapat membuat, mengedit, dan mengurutkan scene
interaktif.

**FR-CMS2D-03** Admin dapat mengatur aset latar, sprite karakter, dan
avatar, termasuk metadata sumber dan lisensi aset.

**FR-CMS2D-04** Admin dapat menentukan lebar dunia, batas gerak, posisi
awal avatar, dan posisi target.

**FR-CMS2D-05** Admin dapat menentukan radius interaksi setiap target.

**FR-CMS2D-06** Admin dapat mengaitkan target dengan event.

**FR-CMS2D-07** Admin dapat mengelola dialog, narasi, dan informasi
budaya (termasuk sumber dan verification status).

**FR-CMS2D-08** Admin dapat mengatur kondisi penyelesaian event
(wajib/opsional) dan aksi setelah event selesai.

**FR-CMS2D-09** Admin dapat menentukan scene berikutnya dan urutan
scene.

**FR-CMS2D-10** Admin dapat melakukan preview dan pengujian mode 2D
(termasuk validasi jarak dan kontrol mobile) sebelum publikasi.

**FR-CMS2D-11** Sistem memvalidasi konfigurasi 2D sebelum publikasi dan
mencegah publikasi apabila konfigurasi tidak valid, aset tanpa
lisensi/hak yang jelas, atau sumber informasi budaya belum
diverifikasi.

**FR-CMS2D-12** Konfigurasi dan aset 2D mengikuti workflow yang sama
(Draft → Content Review → Visual Review → Approved → Published).
Apabila konfigurasi 2D sebuah cerita dibatalkan publikasinya atau gagal
validasi, cerita tersebut otomatis menggunakan reader standar.

| Aspek | Prototype awal | Tahap CMS berikutnya |
|---|---|---|
| Definisi scene, target, event | Konfigurasi data di source code | Dikelola admin melalui CMS (FR-CMS2D-01 sampai 12) |
| Aset | Disediakan manual | Dikelola dengan metadata lisensi dan review |
| Preview/validasi | Pengujian manual dan checklist | Preview dan validasi pada CMS |
| Struktur data | Sudah berstruktur dan terpisah dari logika tampilan | Dipindahkan ke penyimpanan CMS |

------------------------------------------------------------------------

# 7. Sketsa Data Model

Database final masih merupakan **open question** antara MongoDB dan
relational database. Struktur konseptual berikut harus tetap berlaku
terlepas dari pilihan database.

## Entity Relationship

``` text
Region
   │
   ├──── Story ────< Scene
   │                 │
   │                 ├──< VisualAsset
   │                 └──< Character
   │
   └──── CulturalContent

Story ───< Character
Story ───< CulturalContent
Story ───< Source
```

## Story

``` text
Story {
  id
  title
  slug
  synopsis
  body/scene references
  region_id
  category_ids[]
  cultural_content_ids[]
  character_ids[]
  status
  cover_image_id
  source_ids[]
  created_at
  updated_at
  published_at
}
```

## Scene

``` text
Scene {
  id
  story_id
  sequence
  title
  narration_text
  visual_asset_ids[]
  character_ids[]
  cultural_content_ids[]
}
```

> **Catatan (Interactive 2D):** field opsional untuk mode 2D
> ditambahkan pada `Story` dan `Scene` melalui bagian "Ekstensi Data
> Model --- Interactive 2D" di akhir bagian 7. Field yang ada tidak
> diubah.

## Region

``` text
Region {
  id
  name
  province
  country
  latitude
  longitude
  location_precision
  description
}
```

## Character

``` text
Character {
  id
  name
  description
  role
  image_asset_id
  story_ids[]
}
```

## CulturalContent

``` text
CulturalContent {
  id
  title
  type
  description
  story_ids[]
  region_ids[]
  source_ids[]
  verification_status
}
```

## VisualAsset

``` text
VisualAsset {
  id
  scene_id
  asset_url
  generation_method
  prompt_version
  status
  reviewer_id
  created_at
}
```

## Source

``` text
Source {
  id
  title
  author
  publisher
  publication_year
  url_or_reference
  rights_status
  license
  verification_status
}
```

## Admin/User

MVP dapat memiliki user authentication untuk **admin** walaupun public
reader tidak memerlukan login.

``` text
User {
  id
  email
  role
  status
  created_at
}
```

## Ekstensi Data Model --- Interactive 2D Story Exploration

Seluruh field tambahan bersifat **opsional** supaya data cerita standar
tetap valid. Penamaan mengikuti konvensi prototype (`camelCase`,
interface `PascalCase`, nilai literal berformat kebab-case); bagian 7
di atas menggunakan penamaan konseptual (`snake_case`). Nama final
ditetapkan saat implementasi. Pilihan database tetap mengikuti Open
Question 16; struktur di bawah netral terhadap pilihan tersebut (pada
prototype data tertanam di dalam `Scene`; pada CMS dapat menjadi entitas
terpisah dengan referensi story/scene).

### Relasi konseptual

``` text
Story ───< Scene ───< InteractiveTarget ───> StoryEvent
             │                                  ▲
             └──────────────< StoryEvent ───────┘
                              (triggerTargetId)

Story ───> PlayerAvatar        (referensi opsional; kardinalitas belum diputuskan)
InteractiveTarget ───> Character / objek / elemen lingkungan-budaya
InteractiveTarget, StoryEvent ───> konten budaya
                       (culturalAnnotation scene, istilah glosarium, atau unit baru)
Scene ───> Scene berikutnya    (linear, nextSceneNumber)
```

### Sketsa konseptual (bukan kode yang sudah ada)

``` ts
// Tambahan pada tipe yang sudah ada (src/types.ts) -- semua opsional.
export type ReaderMode = 'standard' | 'interactive-2d';
export type Interactive2DStatus = 'not-ready' | 'ready'; // set status final: OQ 36

interface Story {
  // ...seluruh field yang sudah ada tidak berubah...
  defaultReaderMode?: ReaderMode;            // kosong => 'standard'
  interactive2DStatus?: Interactive2DStatus; // kosong => 'not-ready'
  playerAvatarId?: string;                   // referensi PlayerAvatar
}

interface Scene {
  // ...seluruh field yang sudah ada tidak berubah (imageUrl, paragraphs,
  //    characters, culturalAnnotation, ...) sehingga reader standar &
  //    fallback tetap berfungsi...
  mode?: ReaderMode;                         // kosong => 'standard'
  backgroundAssetUrl?: string;               // aset latar pixel art
  backgroundAlt?: string;
  worldWidth?: number;                       // satuan koordinat: OQ 34
  movementBounds?: { minX: number; maxX: number };
  avatarStartX?: number;
  interactiveTargets?: InteractiveTarget[];
  storyEvents?: StoryEvent[];
  nextSceneNumber?: number;                  // kosong pada scene terakhir
}

export interface PlayerAvatar {
  id: string;
  name: string;
  spriteAssetUrl: string;
  animations?: Array<{ name: string; assetUrl?: string }>; // daftar animasi: OQ 30
  movement?: { speed?: number };             // nilai & satuan: OQ 30
}

export type InteractiveTargetType = 'character' | 'object' | 'environment';

export interface InteractiveTarget {
  id: string;
  storyId?: string;                          // bila disimpan sebagai entitas terpisah (CMS)
  sceneNumber: number;                       // Scene belum memiliki id (OQ 46)
  type: InteractiveTargetType;
  entityRef?: { kind: 'character' | 'glossary-term' | 'cultural-annotation'; key: string };
  positionX: number;                         // horizontal saja
  interactionRadius: number;                 // penentuan nilai: OQ 31
  hint: string;                              // petunjuk interaksi
  eventId: string;
  culturalContent?: CulturalContentRef;
}

export type StoryEventType = 'narration' | 'dialogue' | 'cultural-info';
export type StoryEventRequirement = 'required' | 'optional';
export type AfterEventAction = 'return-control' | 'advance-scene';

export interface StoryEvent {
  id: string;
  storyId?: string;
  sceneNumber: number;
  triggerTargetId: string;
  type: StoryEventType;
  requirement: StoryEventRequirement;
  sequence?: number;                         // urutan antar-event wajib: OQ 41
  lines?: Array<{ speaker?: string; text: string }>;
  culturalContent?: CulturalContentRef;
  afterEvent: AfterEventAction;
}

export interface CulturalContentRef {
  glossaryTerm?: string;                     // GlossaryTerm.term
  annotation?: Scene['culturalAnnotation'];  // bentuk yang sama dengan anotasi scene
}
```

### Padanan dengan model yang sudah ada

| Konsep PRD (bagian 7) | Prototype (`src/types.ts`) | Catatan kompatibilitas |
|---|---|---|
| `Scene.sequence` | `Scene.sceneNumber` | Dipakai sebagai referensi scene (`sceneNumber`, `nextSceneNumber`). Scene belum memiliki `id`. |
| `Scene.narration_text` | `Scene.paragraphs` | Tetap menjadi sumber teks untuk reader standar dan fallback. |
| `Scene.visual_asset_ids[]` | `Scene.imageUrl`/`imageAlt` | Tidak ada status/lisensi pada prototype; tidak diasumsikan. |
| `Scene.character_ids[]` | `Scene.characters[]` (inline) | Tidak ada identifier; target karakter memakai `entityRef`. |
| `Scene.cultural_content_ids[]` | `Scene.culturalAnnotation` (satu per scene) | Mode 2D membutuhkan lebih dari satu unit; ditambah melalui `culturalContent` pada target/event. |
| `Story.region_id`, `source_ids[]` | `Story.region`/`regionKey`, `verifiedSource` | Tidak diubah. |
| `CulturalContent` / glosarium | `GlossaryTerm` (`term`, `region`, `meaning`, `culturalContext`) | Dirujuk melalui `glossaryTerm`. |

### Aturan validasi data (konseptual)

-   `eventId` pada target dan `triggerTargetId` pada event harus saling
    merujuk entitas yang ada pada scene yang sama.
-   `movementBounds` berada di dalam `worldWidth`; `avatarStartX` dan
    setiap target wajib dapat dijangkau di dalam batas (FR-2D-BND-03,
    FR-2D-BND-04).
-   `nextSceneNumber` harus merujuk scene yang ada, kecuali pada scene
    terakhir; setiap scene 2D memiliki jalur penyelesaian (FR-2D-CMP-02).
-   `interactive2DStatus = 'ready'` hanya valid apabila seluruh
    konfigurasi dan aset lolos validasi; jumlah scene pada metadata
    (`sceneCount`, `totalScenes`) konsisten dengan data scene aktual.
-   Data interaksi disimpan sebagai modul/konfigurasi terpisah dari
    komponen tampilan (FR-2D-SCN-02).

------------------------------------------------------------------------

# 8. Edge Cases dan Failure States

## Content

  -----------------------------------------------------------------------
  Kondisi                             Expected behavior
  ----------------------------------- -----------------------------------
  Story tidak memiliki visual         Reader tetap menampilkan teks

  Visual gagal loading                Tampilkan fallback image/error
                                      state

  Story belum published               Tidak muncul di public

  Source belum diverifikasi           Tidak dapat dipublish

  Story memiliki lokasi ambigu        Tampilkan wilayah dengan precision
                                      yang sesuai, bukan titik palsu

  Tidak ada character                 Character section tidak ditampilkan

  Tidak ada cultural metadata         Jangan membuat metadata sintetis;
                                      tampilkan section kosong secara
                                      elegan atau sembunyikan

  Scene kosong                        CMS mencegah publish
  -----------------------------------------------------------------------

## AI

  -----------------------------------------------------------------------
  Kondisi                             Expected behavior
  ----------------------------------- -----------------------------------
  Image generation gagal              Scene tetap dapat dipublish tanpa
                                      image jika policy konten
                                      mengizinkan

  AI menghasilkan detail budaya yang  Admin reject/regenerate
  salah                               

  AI image tidak konsisten dengan     Reject
  character                           

  Prompt mengandung informasi         Block/review
  sensitif/tidak pantas               

  Vendor AI unavailable               Existing approved assets tetap
                                      berfungsi

  Model menghasilkan artefak visual   Reject
  -----------------------------------------------------------------------

## Search

-   Query kosong → tampilkan katalog default.
-   Query tidak ditemukan → empty state.
-   Filter menghasilkan 0 hasil → tampilkan filter aktif + opsi reset.
-   Search dengan typo → **belum ditentukan** apakah fuzzy search
    diperlukan.

## Map

-   Region tanpa koordinat → tidak memiliki marker.
-   Multiple stories di lokasi sama → marker membuka list cerita.
-   Lokasi hanya diketahui tingkat provinsi → marker menggunakan
    representasi tingkat provinsi.
-   Mobile viewport kecil → map tetap dapat di-zoom/pan.

## Network

-   Image request timeout → placeholder/fallback.
-   API failure → error state yang dapat dicoba ulang.
-   Offline → **belum menjadi requirement MVP**.
-   Slow network → teks story sebaiknya dapat dirender sebelum image
    selesai.

## Rights & provenance

-   Asset tanpa status lisensi → tidak boleh dipublish.
-   Teks versi tertentu memiliki copyright → admin harus menyimpan
    provenance/rights metadata.
-   AI image menggunakan reference image berlisensi terbatas → tidak
    boleh dipublish sebelum rights diperiksa.
-   Aset pixel art mode 2D tanpa status lisensi/hak, sumber, atau review
    yang jelas → tidak boleh dipublish; status AI/lisensi aset tidak
    boleh diasumsikan dari URL gambar.

## Interactive 2D Story Exploration

| Kondisi | Expected behavior |
|---|---|
| Cerita belum siap menggunakan mode 2D | Cerita memakai reader standar tanpa pesan kesalahan; field 2D tidak diwajibkan |
| Aset latar atau sprite tidak tersedia/gagal dimuat | Beralih ke reader standar dengan pesan singkat; teks cerita tetap dapat dibaca. Jika hanya sprite dekoratif yang gagal, scene dapat tetap berjalan dengan placeholder; jika aset target wajib atau avatar gagal, gunakan fallback |
| Avatar mencapai batas scene | Avatar berhenti; input menuju luar batas diabaikan; tidak ada error |
| Target berada di luar jarak interaksi | Event tidak dipicu; petunjuk untuk mendekat ditampilkan |
| Pengguna mengaktifkan target berulang kali | Hanya satu event aktif; progres tidak dihitung ganda; target lain tidak aktif selama event berjalan. Perilaku setelah event selesai belum ditetapkan (OQ 41) |
| Event gagal ditampilkan atau tidak dapat diselesaikan | Panel dapat ditutup; kontrol tidak terkunci; pengguna dapat kembali ke eksplorasi atau teks cerita; kegagalan dicatat |
| Scene berikutnya tidak ditemukan atau tidak valid | Pengguna tetap di scene saat ini dengan pesan dan jalan keluar ke reader standar/katalog; validasi mencegah publikasi konfigurasi seperti ini |
| Konten informasi budaya tidak tersedia | Target budaya tidak dibuat dan tidak ada konten sintetis; target tanpa data tidak dapat diaktifkan dan dianggap konfigurasi tidak valid |
| Kontrol mobile menutupi target | Dianggap defect; target wajib harus tetap dapat diaktifkan dan dialog tetap terbaca; diverifikasi pada viewport kecil sebelum cerita dinyatakan siap |
| Target tidak dapat dijangkau avatar (di luar batas gerak) | Validasi konfigurasi gagal; cerita tidak berstatus siap |
| Mode 2D bermasalah | Reader standar tetap berfungsi penuh dan teks cerita dapat diakses |
| Viewport berubah (resize/rotasi) saat bermain | Posisi avatar, kamera, dan event aktif tetap konsisten |
| Pengguna menyegarkan halaman/menutup tab di tengah scene | Progres 2D tidak dijamin tersimpan; perilaku final belum ditetapkan (OQ 37) |

------------------------------------------------------------------------

# 9. Success Metrics

MVP sebaiknya mengukur **engagement, usability, discovery, dan kualitas
konten**, bukan hanya page views.

## North Star Metric

**Completed Story Explorations**

Jumlah sesi ketika pengguna:

1.  membuka sebuah cerita;
2.  mencapai scene terakhir;
3.  membuka minimal satu elemen cultural context atau character/map
    exploration.

Metric ini mencerminkan apakah NGM berhasil menggabungkan **reading +
cultural exploration**, bukan sekadar memperoleh traffic.

**Keterkaitan dengan Interactive 2D:** North Star Metric tidak diubah.
Pada cerita yang mendukung mode 2D, fitur Interactive 2D mendukung
metric ini melalui: (a) membuka cerita dan memulai mode 2D; (b)
mencapai scene terakhir melalui penyelesaian scene 2D (FR-2D-CMP);
dan (c) membuka informasi lingkungan/budaya atau informasi karakter
melalui target interaktif (FR-2D-CULT, FR-CHAR-07). Cerita yang memakai
reader standar tetap dihitung dengan definisi yang sama. Pemetaan
event analitik untuk mode 2D terhadap definisi ini perlu disepakati
(Open Question 47).

## Primary metrics

### 1. Story start rate

``` text
Users opening story / Users viewing catalog
```

### 2. Story completion rate

``` text
Users reaching final scene /
Users starting story
```

### 3. Cultural exploration rate

``` text
Story sessions with cultural-content interaction /
Story sessions
```

### 4. Visual engagement

``` text
Story sessions interacting with visual scene /
Story sessions
```

### 5. Search success rate

``` text
Search sessions resulting in story open /
Total search sessions
```

### 6. Map-to-story conversion

``` text
Story opens originating from map /
Map interaction sessions
```

**Metrik Interactive 2D**

Metrik berikut hanya dihitung untuk cerita yang mendukung mode 2D.
Target numerik **belum ditetapkan**.

### 7. Interactive story start rate

``` text
Sessions starting 2D mode /
Sessions opening 2D-ready stories
```

### 8. Primary interaction activation rate

``` text
2D sessions with at least one valid primary target activation /
2D sessions started
```

### 9. Interactive story completion rate

``` text
2D sessions reaching story completion (final 2D scene completed) /
2D sessions started
```

### 10. Scene drop-off rate

``` text
2D sessions leaving at scene N without completing it /
2D sessions entering scene N
```

### 11. Cultural exploration rate (2D)

``` text
2D sessions with at least one cultural/environment information opened /
2D sessions started
```

### 12. Interaction failure rate

``` text
Failed event displays, invalid configuration errors, and asset failures
in 2D mode / 2D sessions started
```

### 13. Mobile control success rate

``` text
Mobile 2D sessions where the avatar moved and the first primary target
was activated / Mobile 2D sessions started
```

### 14. Fallback rate

``` text
2D-ready story sessions that ended up in the standard reader due to
failure / 2D-ready story sessions
```

Sinyal kegunaan tambahan: rasio percobaan aktivasi target di luar radius
terhadap seluruh percobaan aktivasi (indikasi kejelasan petunjuk dan
kecocokan radius interaksi). Ketersediaan analytics per sesi tanpa
login bergantung pada Open Question 20 dan 21.

## Quality metrics

-   \% published stories dengan source lengkap
-   \% cultural entries yang sudah diverifikasi
-   \% AI visual yang lolos review
-   AI visual rejection rate
-   broken asset rate
-   API error rate
-   image loading failure rate
-   2D asset load failure rate
-   2D interaction failure rate
-   \% cerita 2D yang lolos validasi konfigurasi dan pemeriksaan
    lisensi/provenance aset sebelum dinyatakan siap

## UX validation metrics

Untuk prototype usability test, target numerik final **belum
ditetapkan**.

Yang harus diuji:

-   pengguna memahami cara menemukan cerita;
-   pengguna memahami hubungan cerita dengan daerah;
-   pengguna memahami bahwa visual dibuat dengan AI;
-   pengguna dapat berpindah scene tanpa kebingungan;
-   pengguna dapat menemukan cultural context;
-   pengguna memahami perbedaan antara cerita dan informasi faktual
    pendukung.

Untuk mode Interactive 2D, yang juga harus diuji:

-   pengguna memahami cara menggerakkan avatar pada desktop dan mobile;
-   pengguna memahami target mana yang dapat diaktifkan dan mengapa
    interaksi belum terjadi saat terlalu jauh;
-   pengguna dapat membaca dialog dan menekan "Lanjut" tanpa terganggu
    kontrol;
-   pengguna memahami bahwa avatar adalah pemandu, bukan tokoh cerita;
-   pengguna dapat menyelesaikan cerita 2D hingga scene terakhir;
-   pengguna dapat membedakan narasi cerita dari informasi budaya
    terkurasi.

------------------------------------------------------------------------

# 10. Garis Waktu & Rencana Rilis

Karena belum diberikan jumlah anggota tim, kapasitas engineering/design,
jumlah cerita awal, dan deadline eksternal, timeline berikut merupakan
**baseline estimasi**, bukan commitment.

> **Status revisi Interactive 2D:** baseline 10 minggu di bawah
> **belum memperhitungkan** pekerjaan Interactive 2D dan **perlu
> dievaluasi kembali**. PRD ini **tidak menjanjikan** bahwa fitur 2D
> muat dalam 10 minggu; kepastian membutuhkan estimasi dan kapasitas
> tim (jumlah anggota, kapasitas desain/engineering/ilustrasi aset,
> jumlah cerita 2D). Dampak yang diketahui dirangkum pada bagian
> "Dampak Interactive 2D terhadap Baseline Timeline" setelah release
> gate.

## Phase 0 --- Discovery & Content Definition

**Minggu 1**

Output:

-   final product scope;
-   information architecture;
-   content schema;
-   editorial guideline;
-   source/provenance guideline;
-   initial story list;
-   technical architecture decision.
-   *(Interactive 2D)* pemilihan cerita vertical slice, kriteria
    kesiapan cerita 2D, skema data 2D, dan alur produksi serta
    persetujuan aset pixel art.

**Gate:** tidak lanjut development sebelum format Story → Scene →
Cultural Content disepakati.

## Phase 1 --- UX/UI & Technical Foundation

**Minggu 2--3**

### Design

-   responsive design;
-   catalog;
-   story reader;
-   map;
-   cultural context;
-   CMS;
-   *(Interactive 2D)* desain reader 2D (area scene, panel dialog dan
    budaya, kontrol mobile) dan spesifikasi aset pixel art.

### Engineering

-   repository;
-   frontend foundation;
-   backend;
-   database;
-   authentication untuk admin;
-   deployment environment;
-   API contract.
-   *(Interactive 2D)* struktur konfigurasi data 2D yang kompatibel
    dengan model `Story`/`Scene`.

**Output:** clickable prototype + functioning technical skeleton.

## Phase 2 --- Core Story Experience

**Minggu 4--6**

Implement:

-   catalog;
-   search;
-   filter;
-   story reader;
-   scene model;
-   character;
-   cultural context;
-   region/map;
-   *(Interactive 2D)* gerakan avatar dan kamera, target dan event,
    dialog dan panel budaya, kontrol desktop/mobile, serta fallback ke
    reader standar.

**Output:** pengguna dapat menyelesaikan journey dasar:

``` text
Landing
  ↓
Catalog / Map
  ↓
Story
  ↓
Scene
  ↓
Character / Culture
```

Untuk cerita yang mendukung mode 2D:

``` text
Landing
  ↓
Catalog / Map
  ↓
Story (mode 2D dipilih berdasarkan kesiapan)
  ↓
Scene 2D → gerak → dekati target → klik/ketuk → dialog → Lanjut
  ↓
(Informasi lingkungan / budaya, opsional)
  ↓
Scene berikutnya ... sampai scene terakhir
  ↓
Penyelesaian → Explore Further
```

## Phase 3 --- AI Visual & CMS

**Minggu 7--8**

Implement:

-   AI generation workflow;
-   visual asset management;
-   approval/rejection;
-   CMS story management;
-   source metadata;
-   publishing workflow.

**Output:** admin dapat membuat satu story end-to-end sampai published.

*(Interactive 2D)* CMS 2D penuh tidak wajib pada prototype awal;
konfigurasi 2D awal berada di source code (lihat FR-CMS2D dan Open
Question 48).

## Phase 4 --- QA & User Testing

**Minggu 9**

Testing:

-   functional QA;
-   responsive QA;
-   browser compatibility;
-   accessibility baseline;
-   performance;
-   AI visual consistency;
-   content verification;
-   rights/provenance review;
-   *(Interactive 2D)* pengujian mode 2D (gerak, kamera, validasi jarak,
    event, kontrol mobile), pengujian fallback, dan **regresi reader
    standar**.

User testing dengan primary users: remaja SMP--SMA.

## Phase 5 --- MVP Prototype Release

**Minggu 10**

Release:

-   cloud deployment;
-   curated initial content set;
-   analytics;
-   bug monitoring;
-   usability feedback collection.

### MVP release gate

MVP dinyatakan selesai apabila:

-   catalog berfungsi;
-   search/filter berfungsi;
-   story reader end-to-end berfungsi;
-   visual AI approved dapat ditampilkan;
-   map dapat menghubungkan region dengan story;
-   character dapat dieksplorasi;
-   cultural information dapat dieksplorasi;
-   CMS dapat mengelola dan publish konten;
-   source/provenance tersedia;
-   tidak ada blocker P0/P1;
-   prototype dapat digunakan oleh pengguna eksternal.
-   *(Interactive 2D)* untuk setiap cerita berstatus siap 2D: mode 2D
    berfungsi end-to-end, fallback ke reader standar tervalidasi, dan
    konfigurasi serta aset lolos pemeriksaan; jumlah cerita 2D
    ditentukan (Open Question 27);
-   *(Interactive 2D)* cerita tanpa mode 2D tetap berfungsi pada reader
    standar tanpa regresi.

## Dampak Interactive 2D terhadap Baseline Timeline

Tabel berikut mencatat pekerjaan tambahan yang belum diperhitungkan
pada baseline. **Belum ada estimasi** durasi atau kapasitas untuk
pekerjaan ini; timeline harus dievaluasi kembali.

| Pekerjaan tambahan | Fase baseline terkait | Status estimasi |
|---|---|---|
| Desain dan produksi aset pixel art (latar, avatar, karakter, objek) | Phase 1--3 | Belum diestimasi (jumlah aset dan standar: OQ 34) |
| Implementasi pergerakan avatar dan kamera horizontal | Phase 2 | Belum diestimasi |
| Sistem target interaktif dan event | Phase 2 | Belum diestimasi |
| Integrasi dialog dan panel informasi budaya | Phase 2 | Belum diestimasi |
| Kontrol mobile (tombol arah, kontrol sentuh) | Phase 2 | Belum diestimasi |
| Perluasan model data dan validasi konfigurasi | Phase 0--2 | Belum diestimasi |
| Review konten budaya dan aset 2D | Phase 0--4 | Belum diestimasi (penyetuju: OQ 35) |
| Pengujian mode 2D dan regresi reader standar | Phase 4 | Belum diestimasi |
| CMS 2D penuh | Di luar prototype awal | Belum dijadwalkan (OQ 48) |

## Vertical Slice Interactive 2D (validasi awal)

**Tujuan:** memvalidasi mode 2D secara end-to-end pada skala kecil
sebelum berkomitmen pada jumlah cerita dan timeline.

**Cakupan:** satu cerita pilihan (belum ditentukan, OQ 26) dengan
konfigurasi data di source code, mencakup alur:

``` text
Pembukaan cerita dari katalog
  ↓ (mode 2D dipilih karena cerita siap)
Scene 2D pertama: avatar pada posisi awal, kamera, batas gerak
  ↓
Bergerak → klik target terlalu jauh (petunjuk mendekat)
  ↓
Mendekat → klik target → avatar berhenti → dialog/narasi → "Lanjut"
  ↓
(Opsional) target informasi lingkungan/budaya
  ↓
Transisi ke scene berikutnya ... hingga scene terakhir
  ↓
Penyelesaian cerita → Explore Further
```

**Juga diuji:** kontrol desktop dan mobile; fallback ke reader standar
saat aset gagal; cerita tanpa mode 2D tidak terpengaruh.

**Kriteria lulus:** acceptance criteria AC-2D-01 sampai AC-2D-19 yang
relevan terpenuhi. Target numerik untuk kegunaan belum ditetapkan.

**Keluaran:** temuan kelayakan teknis, input untuk estimasi ulang
timeline, serta masukan untuk Open Question 28 sampai 34. Penempatan
vertical slice pada kalender belum ditentukan; hasilnya menjadi dasar
penentuan jumlah cerita 2D.

------------------------------------------------------------------------

# 11. Open Questions

Pertanyaan berikut **sengaja tidak dijawab dengan asumsi** karena
berdampak langsung terhadap scope atau arsitektur.

## Product

1.  **Berapa jumlah cerita minimum untuk MVP?**\
    Misalnya 10, 20, atau 50 cerita.

2.  **Apakah MVP harus mencakup seluruh provinsi Indonesia, atau cukup
    beberapa daerah sebagai pilot?**

3.  **Apakah landing page merupakan bagian scope MVP atau katalog
    menjadi halaman utama?**

4.  **Apakah pengguna harus dapat berpindah dari satu cultural element
    ke cerita lain yang terkait?**

5.  **Apakah story reader berbentuk scroll vertikal, slide/scene
    navigation, atau format lain?**
    *(Catatan: untuk cerita yang mendukung mode 2D, bentuk
    pengalaman ditetapkan pada bagian 6.3.1; pertanyaan ini tetap
    terbuka untuk reader standar.)*

## Content

6.  **Siapa yang menjadi otoritas editorial untuk menyetujui fakta
    budaya?**

7.  **Sumber cerita minimum apa yang dianggap cukup untuk publikasi?**

8.  **Apakah NGM akan menampilkan teks cerita secara utuh atau adaptasi
    editorial?**

9.  **Bagaimana attribution ditampilkan kepada pengguna?**

10. **Berapa banyak visual AI per cerita/scene yang ditargetkan?**

11. **Apakah visual AI harus memiliki style visual yang konsisten di
    seluruh platform?**

## Audio

12. **Apakah audio benar-benar masuk release MVP atau tetap
    Should-have?**

13. Jika masuk MVP, apakah audio:

    -   human narration,
    -   text-to-speech,
    -   atau keduanya?

## Map

14. **Library/map provider apa yang akan digunakan?**

15. **Apakah map hanya menjadi discovery interface atau juga menampilkan
    informasi budaya/geografis?**

## Technical

16. **MongoDB atau relational database?**\
    Keputusan sebaiknya dibuat setelah mempertimbangkan kebutuhan
    relational content, search, CMS, dan analytics.

17. **Apakah AI generation dilakukan synchronously saat admin meminta
    generate, atau asynchronous melalui job queue?**

18. **Apakah visual generation dilakukan oleh backend NGM atau melalui
    external AI service?**

19. **Berapa target performance untuk mobile, khususnya first contentful
    render dan image loading?**

20. **Apakah analytics provider sudah ditentukan?**

## Authentication

21. **Apakah MVP membutuhkan analytics per-user/session tanpa login?**

22. Jika bookmark/progress dipindahkan ke V2, **apakah user
    authentication sepenuhnya hanya untuk admin pada MVP?**

## Legal & governance

23. **Siapa yang bertanggung jawab atas rights review sebelum konten
    dipublish?**

24. **Apakah diperlukan mekanisme takedown/correction untuk konten yang
    dipermasalahkan?**

25. **Apakah AI-generated visual harus selalu diberi label
    "AI-generated" di UI publik?**

## Interactive 2D Story Exploration

Keputusan final fitur ini hanya yang tercantum pada bagian 6.3.1.
Pertanyaan berikut **belum diputuskan**.

### Pertanyaan dari daftar kerja

26. **Cerita mana yang dipilih untuk vertical slice pertama?**

27. **Berapa jumlah cerita 2D pada MVP?**

28. **Berapa jumlah scene dan interaksi utama minimum per cerita?**

29. **Bagaimana desain final avatar pemandu?** Termasuk apakah avatar
    sama untuk semua cerita 2D atau berbeda per cerita.

30. **Animasi karakter apa saja yang diperlukan, dan berapa kecepatan
    geraknya?**

31. **Bagaimana radius interaksi ditentukan?** (nilai default atau
    per target)

32. **Bagaimana detail kontrol sentuh pada mobile?** Termasuk bentuk
    kontrol, serta ukuran dan posisi tombol.

33. **Bagaimana perilaku dan posisi panel dialog/informasi pada
    mobile (dan desktop)?**

34. **Berapa standar ukuran sprite, resolusi aset pixel art, dan
    satuan koordinat dunia?**

35. **Siapa yang menyetujui kesesuaian aset dan detail budaya?**

36. **Apa kriteria final kesiapan cerita untuk mode 2D?**

37. **Apakah progres mode 2D perlu disimpan antar-sesi?**

38. **Bagaimana hubungannya dengan fitur bookmark dan reading progress
    yang berada di V2 pada PRD awal?**

### Pertanyaan turunan dari integrasi

39. **Apakah pengguna dapat memilih manual antara reader standar dan
    mode 2D, dan apakah story card/katalog perlu menandai cerita 2D?**

40. **Apakah pengguna dapat kembali atau melompat antar-scene pada mode
    2D?** (berinteraksi dengan indikator dan navigasi scene pada reader
    standar)

41. **Bagaimana perilaku aktivasi ulang target yang event-nya sudah
    selesai, apakah satu target dapat memicu lebih dari satu event, dan
    bagaimana urutan antar-event wajib dalam satu scene?**

42. **Bagaimana anotasi budaya scene (`culturalAnnotation`) dan istilah
    glosarium ditampilkan dalam mode 2D?**

43. **Bagaimana metode produksi aset pixel art (manual, dibantu AI, atau
    lainnya), dan apakah diperlukan label khusus pada UI publik?**
    (terkait Open Question 25)

44. **Apakah fallback dilakukan per scene atau untuk seluruh cerita, dan
    apakah pengguna dapat memilih reader standar secara manual saat
    terjadi masalah?**

45. **Bagaimana orientasi layar dan rasio area scene pada mobile?**

46. **Apakah scene dan karakter memerlukan identifier stabil
    (misalnya `id`) selain `sceneNumber` dan nama?**

47. **Bagaimana event analitik mode 2D dipetakan ke definisi North Star
    Metric dan metrik visual engagement?**

48. **Apakah kebutuhan CMS 2D (FR-CMS2D) masuk dalam release MVP penuh
    atau V2?**

49. **Apakah diperlukan alternatif aktivasi target selain klik/ketuk
    (misalnya melalui keyboard) untuk kebutuhan aksesibilitas?**
    (terkait accessibility baseline pada Phase 4)

------------------------------------------------------------------------

# MVP Scope Final

Untuk menjaga MVP tetap fokus, scope yang dapat dianggap **committed**
berdasarkan keputusan saat ini adalah:

``` text
                    NGM MVP
                       │
        ┌──────────────┴──────────────┐
        │                             │
     DISCOVERY                     READING
        │                             │
   Catalog                       Story Reader
   Search                        Scene
   Filter                        AI Visual
   Map                           Character
                                 Interactive 2D
                                 (cerita pilihan)
        │                             │
        └──────────────┬──────────────┘
                       │
                CULTURAL EXPLORATION
                       │
          ┌────────────┼────────────┐
          │            │            │
       Region       Tradition     Language
          │            │            │
          └────────────┼────────────┘
                       │
                    CMS/Admin
                       │
              Source + Verification
```

**MVP bukan "website kumpulan cerita".** Produk inti yang harus
divalidasi adalah loop:

> **Discover → Read → Explore in 2D → Understand Culture → Explore Further**

Loop ini berlaku untuk **cerita yang mendukung mode 2D**. Cerita
lainnya tetap menggunakan reader standar dengan loop awal:

> **Discover → Read → See → Understand Culture → Explore Further**

Sedangkan **audio, bookmark/progress, dan kuis** tetap berada di luar
critical path MVP sampai kapasitas pengembangan dan hasil validasi
pengguna menunjukkan bahwa fitur tersebut perlu diprioritaskan.

### Interactive 2D Story Exploration dalam MVP

Mode Interactive 2D adalah **kemampuan tambahan untuk cerita pilihan**,
bukan pengganti reader dan bukan game penuh.

**Committed (MVP):** gerakan horizontal sederhana; kamera mengikuti
saat diperlukan; avatar pemandu; interaksi karakter/objek setelah
mendekat dengan validasi jarak; pemicu dialog/narasi; tombol "Lanjut";
informasi lingkungan dan budaya; transisi linear antar-scene; kontrol
desktop dan mobile; fallback ke reader standar; model data 2D opsional
yang kompatibel dengan `Story`/`Scene`.

**Prototype awal:** konfigurasi scene dan event boleh berada di source
code; CMS 2D penuh tidak wajib.

**Tidak termasuk MVP:** sistem pertarungan atau kesehatan; inventaris,
crafting, atau pengumpulan item; fisika platformer kompleks; open world
tanpa batas; puzzle berbasis fisika; dialog bercabang kompleks; banyak
ending; multiplayer, leaderboard, atau kompetisi; gamification lengkap;
CMS 2D penuh pada prototype awal.

**Belum diputuskan:** lihat Open Questions 26--49. Timeline 10 minggu
perlu dievaluasi kembali (bagian 10).
