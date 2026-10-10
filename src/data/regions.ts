import { RegionDetail } from '../types';

export const REGIONS: Record<string, RegionDetail> = {
  sulawesi: {
    key: 'sulawesi',
    name: 'Sulawesi',
    title: 'Sulawesi & Kepulauan Bahari',
    provinces: 'Sulawesi Selatan • Barat • Tenggara • Tengah • Utara • Gorontalo',
    badge: 'Wilayah Terpilih • 15 Naskah',
    code: 'SLW-ID',
    storyCount: 15,
    sub: 'Tradisi Maritim Phinisi & Toraja',
    summary: "Pusat epos kesusastraan maritim dunia seperti I La Galigo, tradisi perkapalan Pinisi, serta kearifan arsitektur Tongkonan Toraja. Tradisi lisan merekam ketangguhan menaklukkan samudra dan penghormatan sakral pada semesta alam.",
    culturalHighlights: [
      {
        title: 'Tradisi Pembuatan Perahu Pinisi',
        description: 'Diakui UNESCO Intangible Cultural Heritage sejak 2017, simbol ketepatan rancang bangun lisan suku Bugis-Makassar.'
      },
      {
        title: 'Falsafah Siri’ na Pacce',
        description: 'Fondasi etika luhur yang menjunjung tinggi kehormatan, integritas, dan rasa empati mendalam terhadap penderitaan sesama.'
      }
    ],
    featuredStoryIds: ['sawerigading', 'danau-poso', 'to-manurung', 'danau-matano']
  },
  sumatera: {
    key: 'sumatera',
    name: 'Sumatera',
    title: 'Sumatera: Swarnadwipa & Muara Hikayat',
    provinces: 'Aceh • Sumut • Sumbar • Riau • Kepri • Jambi • Sumsel • Bengkulu • Lampung',
    badge: 'Wilayah Terpilih • 18 Naskah',
    code: 'SMT-ID',
    storyCount: 18,
    sub: 'Tradisi Maritim Minangkabau & Batak',
    summary: 'Tanah emas penjaga hikayat pelayaran Selat Malaka, petuah pantun Melayu, legenda Danau Toba yang megah, serta falsafah Minangkabau Alam Takambang Jadi Guru.',
    culturalHighlights: [
      {
        title: 'Falsafah Alam Takambang Jadi Guru',
        description: 'Ajaran Minangkabau yang menempatkan harmoni alam sebagai guru kehidupan moral dan kearifan merantau.'
      },
      {
        title: 'Kearifan Sumpah Danau Toba',
        description: 'Ikrar persaudaraan kosmis antara manusia dan elemen air yang menjaga kelestarian hulu sungai.'
      }
    ],
    featuredStoryIds: ['putri-hijau', 'danau-toba', 'malin-kundang']
  },
  jawa: {
    key: 'jawa',
    name: 'Jawa & Madura',
    title: 'Jawa & Madura: Poros Babad Keraton & Fabel Rakyat',
    provinces: 'Banten • DKI Jakarta • Jawa Barat • Jawa Tengah • DI Yogyakarta • Jawa Timur',
    badge: 'Wilayah Terpilih • 24 Naskah',
    code: 'JWA-ID',
    storyCount: 24,
    sub: 'Keraton, Mistik Gunung & Pesisir',
    summary: 'Kawasan sarat babad keraton, kidung mitologi Merapi-Laut Selatan, hikayat Candi Prambanan, hingga dongeng kancil cerdik yang sarat kritik sosial.',
    culturalHighlights: [
      {
        title: 'Tradisi Lesung (Gejog Lesung)',
        description: 'Ritme penumbuk lesung komunal sebagai medium alarm pagi desa dan wujud keguyuban panen agraris.'
      },
      {
        title: 'Kearifan Arsitektur Candi Andesit',
        description: 'Sistem kancing takik batu purba di Dataran Kewu dan Prambanan yang tahan gempa ratusan tahun.'
      }
    ],
    featuredStoryIds: ['roro-jonggrang']
  },
  kalimantan: {
    key: 'kalimantan',
    name: 'Kalimantan',
    title: 'Kalimantan: Belantara Sungai & Kaharingan',
    provinces: 'Kalbar • Kalteng • Kalsel • Kaltim • Kaltara',
    badge: 'Wilayah Terpilih • 12 Naskah',
    code: 'KLM-ID',
    storyCount: 12,
    sub: 'Kearifan Sungai & Belantara Dayak',
    summary: 'Jantung ekosistem sungai dan hutan hujan purba. Mengakar tradisi lisan Dayak tentang Pohon Batang Garing, ketangguhan perisai kancet, serta keharmonisan manusia dengan rimba.',
    culturalHighlights: [
      {
        title: 'Mitologi Lembuswana Kutai',
        description: 'Simbol penjaga tiga alam (air, darat, udara) dan penegak hukum adil kerajaan tertua Nusantara.'
      },
      {
        title: 'Larangan Hutan Tana Ta’a',
        description: 'Zonasi adat hutan larangan suku Dayak demi menjaga resapan mata air dan habitat satwa liar.'
      }
    ],
    featuredStoryIds: ['lembuswana']
  },
  balinusra: {
    key: 'balinusra',
    name: 'Bali & Nusa Tenggara',
    title: 'Bali & Kepulauan Nusa Tenggara',
    provinces: 'Bali • Nusa Tenggara Barat • Nusa Tenggara Timur',
    badge: 'Wilayah Terpilih • 14 Naskah',
    code: 'BLN-ID',
    storyCount: 14,
    sub: 'Mitologi Sasak, Bali & Komodo',
    summary: 'Pusat wiracarita wayang Calon Arang, hikayat penenun Flores, mitos Gunung Tambora, dan kearifan tenun ikat Sumba yang bertutur lewat benang bening tradisi.',
    culturalHighlights: [
      {
        title: 'Tradisi Bau Nyale Lombok',
        description: 'Pengorbanan Putri Mandalika yang menjelma menjadi cacing laut berkah kesuburan pantai.'
      },
      {
        title: 'Sistem Subak Bali',
        description: 'Demokrasi air berbasis pura dan filosofi Tri Hita Karana yang diakui warisan dunia UNESCO.'
      }
    ],
    featuredStoryIds: []
  },
  maluku: {
    key: 'maluku',
    name: 'Maluku',
    title: 'Kepulauan Rempah Maluku',
    provinces: 'Maluku • Maluku Utara',
    badge: 'Wilayah Terpilih • 8 Naskah',
    code: 'MLK-ID',
    storyCount: 8,
    sub: 'Kepulauan Rempah & Laut Banda',
    summary: 'Kepulauan rempah pala dan cengkih yang melahirkan kidung tifa, nyanyian bahari Arumbae, serta sumpah persaudaraan Pela Gandong.',
    culturalHighlights: [
      {
        title: 'Pranata Pela Gandong',
        description: 'Pakta perdamaian sakral antardesa dan lintas agama yang menjaga persaudaraan abadi di Maluku.'
      },
      {
        title: 'Sasi Laut Tradisional',
        description: 'Hukum adat penutupan zona tangkap ikan periodik agar ekosistem terumbu karang pulih alami.'
      }
    ],
    featuredStoryIds: []
  },
  papua: {
    key: 'papua',
    name: 'Papua',
    title: 'Papua: Negeri Cendrawasih & Puncak Salju Abadi',
    provinces: 'Papua • Papua Barat • Papua Selatan • Papua Tengah • Papua Pegunungan',
    badge: 'Wilayah Terpilih • 8 Naskah',
    code: 'PPU-ID',
    storyCount: 8,
    sub: 'Pegunungan Tengah & Pesisir Asmat',
    summary: 'Warisan noken lisan Lembah Baliem, mitos burung surga Cendrawasih, dan legenda pengorbanan suku pesisir Raja Ampat yang menjaga terumbu karang karunia langit.',
    culturalHighlights: [
      {
        title: 'Filosofi Noken Serat Kayu',
        description: 'Tas anyaman warisan UNESCO yang melambangkan rahim ibu, kejujuran, dan ruang berbagi hasil bumi.'
      },
      {
        title: 'Mitos Penjaga Hutan Larangan',
        description: 'Keyakinan adat bahwa burung Cenderawasih adalah penuntun roh leluhur penjaga keseimbangan rimba.'
      }
    ],
    featuredStoryIds: ['cenderawasih']
  }
};
