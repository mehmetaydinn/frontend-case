# Kitap Dünyası Pro

Modern, etkileşimli ve kapsamlı bir kitap listeleme ve yönetim uygulaması.

## 🚀 Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/mehmetaydinn/frontend-case.git
cd frontend-case
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

4. Tarayıcınızda http://localhost:5173 adresini açın.

## 🛠️ Kullanılan Teknolojiler

- **Vue.js 3**: Modern, reaktif kullanıcı arayüzü geliştirme çerçevesi
- **Composition API**: Bileşen mantığını düzenleme ve yeniden kullanım için
- **Vuex 4**: Merkezi durum yönetimi
- **Vue Router**: Sayfa yönlendirme
- **Vuelidate**: Form doğrulaması
- **CSS**: Özel tasarım ve stil tanımlamaları
- **Font Awesome**: İkonlar için
- **LocalStorage**: Veri depolama için

## 📝 Komutlar

```bash
# Geliştirme sunucusunu başlat
npm run dev

# Üretim için derleme
npm run build

# Üretim sürümünü önizleme
npm run preview

# Linter ile kod kontrolü
npm run lint

# Linter ile kod düzeltme
npm run lint:fix
```

## 🎯 Karşılaşılan Zorluklar ve Çözümler

1. **Dark/Light Tema Geçişleri**
   - **Zorluk**: CSS değişkenlerinin dinamik olarak güncellenmesi
   - **Çözüm**: CSS değişkenlerini :root üzerinde tanımlayıp, tema değişikliklerini body class'ı ile yönetme

2. **Döviz Kuru Hesaplamaları**
   - **Zorluk**: Farklı para birimlerinde fiyatların doğru gösterimi
   - **Çözüm**: Custom directive ve merkezi bir currency store modülü kullanımı

3. **LocalStorage Yönetimi**
   - **Zorluk**: Büyük veri setlerinin depolanması ve senkronizasyonu
   - **Çözüm**: Verileri kategorilere ayırma ve önbellekleme stratejisi

4. **Performans Optimizasyonu**
   - **Zorluk**: Büyük listelerin render performansı
   - **Çözüm**: Sanal scroll ve lazy loading teknikleri

5. **Responsive Tasarım**
   - **Zorluk**: Farklı ekran boyutlarında tutarlı görünüm
   - **Çözüm**: CSS Grid ve Flexbox kombinasyonu, medya sorguları

## 🏗️ Mimari Kararlar

Detaylı mimari kararlar için [ARCHITECTURE.md](./docs/ARCHITECTURE.md) dosyasını inceleyebilirsiniz.

Öne çıkan kararlar:
- Composition API kullanımı
- Modüler Vuex store yapısı
- LocalStorage tabanlı veri yönetimi
- Bileşen bazlı CSS yaklaşımı

## 📚 Proje Dokümanları

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Mimari yapı ve kararlar

## 🤝 Katkıda Bulunma

1. Bu depoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasını inceleyebilirsiniz. 
