import localStorageService from '@/services/localStorage/localStorageService';

const BOOKS_KEY = 'books';

export default {
  namespaced: true,
  
  state: () => ({
    books: [],
    isLoading: false,
    error: null,
    selectedBook: null
  }),
  
  getters: {
    allBooks: state => state.books,
    featuredBooks: state => state.books.filter(book => book.isFeatured || book.isFree).slice(0, 10),
    userBooks: (state, getters, rootState) => {
      const currentUserId = rootState.user?.currentUser?.id;
      if (!currentUserId) return [];
      return state.books.filter(book => book.addedBy === currentUserId);
    },
    bookById: state => id => state.books.find(book => book.id === id),
    booksByCategory: state => category => state.books.filter(book => book.category === category),
    booksByAuthor: state => author => state.books.filter(book => book.author === author),
    relatedBooks: state => (currentBookId, limit = 6) => {
      const currentBook = state.books.find(book => book.id === currentBookId);
      if (!currentBook) return [];
      
      // Aynı yazarın diğer kitapları
      const sameAuthorBooks = state.books.filter(book => 
        book.id !== currentBookId && book.author === currentBook.author
      );
      
      // Aynı kategorideki diğer kitaplar
      const sameCategoryBooks = state.books.filter(book => 
        book.id !== currentBookId && 
        book.category === currentBook.category &&
        book.author !== currentBook.author // Yazarın kitapları hariç
      );
      
      // İlk önce aynı yazarın kitaplarını, sonra aynı kategoriden kitapları ekle
      let result = [...sameAuthorBooks, ...sameCategoryBooks];
      
      // Dublike kitapları kaldır
      result = [...new Map(result.map(book => [book.id, book])).values()];
      
      // Belirtilen limitle sınırla
      return result.slice(0, limit);
    },
    isLoading: state => state.isLoading,
    error: state => state.error,
    selectedBook: state => state.selectedBook
  },
  
  mutations: {
    SET_BOOKS(state, books) {
      state.books = books;
    },
    ADD_BOOK(state, book) {
      state.books.push(book);
    },
    UPDATE_BOOK(state, updatedBook) {
      const index = state.books.findIndex(book => book.id === updatedBook.id);
      if (index !== -1) {
        state.books.splice(index, 1, updatedBook);
      }
    },
    DELETE_BOOK(state, bookId) {
      state.books = state.books.filter(book => book.id !== bookId);
    },
    SET_LOADING(state, status) {
      state.isLoading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_SELECTED_BOOK(state, book) {
      state.selectedBook = book;
    }
  },
  
  actions: {
    async fetchBooks({ commit, state }, params = {}) {
      // Varsayılan değerleri ayarla
      const page = params?.page || 1;
      

      try {
        // LocalStorage'dan kitapları çek
        let books = await localStorageService.getItem(BOOKS_KEY) || [];
        
        // Kitaplar henüz çekilmemiş veya daha az kitap var ise veya sayfa 1 ise
        if (state.books.length === 0 || books.length !== state.books.length || page === 1) {
          
          // Kitapları oluşturma tarihine göre sırala (en yeniden en eskiye)
          const sortedBooks = [...books].sort((a, b) => {
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          });
          
          commit('SET_LOADING', true);
          commit('SET_BOOKS', sortedBooks);
          commit('SET_LOADING', false);
          return sortedBooks;
        } else {
          return state.books;
        }
      } catch (error) {
        commit('SET_ERROR', error.message);
        return [];
      }
    },
    
    async fetchBookById({ commit, getters }, bookId) {
      commit('SET_LOADING', true);
      try {
        const book = getters.bookById(bookId);
        commit('SET_SELECTED_BOOK', book);
        return book;
      } catch (error) {
        commit('SET_ERROR', error.message);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async addBook({ commit, state, rootState }, bookData) {
      commit('SET_LOADING', true);
      
      try {
        const currentUser = rootState.user.currentUser;
        
        const newBook = {
          ...bookData,
          id: `book-${Date.now()}`,
          addedBy: currentUser ? currentUser.id : null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        
        const updatedBooks = [...state.books, newBook];
        await localStorageService.setItem(BOOKS_KEY, updatedBooks);
        
        commit('ADD_BOOK', newBook);
        
        return newBook;
      } catch (error) {
        commit('SET_ERROR', error.message);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async createBook({ commit, state, rootState }, bookData) {
      commit('SET_LOADING', true);
      
      try {
        const currentUser = rootState.user.currentUser;
        
        const newBook = {
          ...bookData,
          id: `book-${Date.now()}`,
          addedBy: currentUser ? currentUser.id : null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        
        const updatedBooks = [...state.books, newBook];
        await localStorageService.setItem(BOOKS_KEY, updatedBooks);
        
        commit('ADD_BOOK', newBook);

        return newBook;
      } catch (error) {
        commit('SET_ERROR', error.message);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async updateBook({ commit, state }, updatedBook) {
      commit('SET_LOADING', true);
      try {
        // Updatedbook'un id özelliğini ve geri kalan verilerini ayrı değişkenlere al
        const { id, ...bookData } = updatedBook;
        
        // Güncellenen kitap nesnesini oluştur
        const finalUpdatedBook = {
          ...bookData,
          id: id,
          updatedAt: new Date().toISOString()
        };
        
        // Mevcut kitapları al, kitabı güncelle
        const updatedBooks = state.books.map(book => 
          book.id === id ? finalUpdatedBook : book
        );
        
        // LocalStorage'a kaydet
        await localStorageService.setItem(BOOKS_KEY, updatedBooks);
        
        // State'i güncelle
        commit('UPDATE_BOOK', finalUpdatedBook);
        return finalUpdatedBook;
      } catch (error) {
        commit('SET_ERROR', error.message);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async deleteBook({ commit, state }, bookId) {
      commit('SET_LOADING', true);
      try {
        const updatedBooks = state.books.filter(book => book.id !== bookId);
        await localStorageService.setItem(BOOKS_KEY, updatedBooks);
        
        commit('DELETE_BOOK', bookId);
        return true;
      } catch (error) {
        commit('SET_ERROR', error.message);
        return false;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async searchBooks({ state }, searchTerm) {
      // Basit bir arama fonksiyonu
      if (!searchTerm || searchTerm.trim() === '') {
        return [];
      }
      
      const term = searchTerm.toLowerCase().trim();
      
      // Eğer arama terimi çok kısaysa veya anlamsız ise (random karakterler) boş dizi döndür
      if (term.length < 2) {
        return [];
      }
      
      const results = state.books.filter(book => 
        book.title.toLowerCase().includes(term) || 
        book.author.toLowerCase().includes(term) || 
        (book.description && book.description.toLowerCase().includes(term))
      );
      
      // Sonuç bulunamazsa boş dizi döndür
      return results;
    },
    
    async filterBooks({ state }, filters) {
      let filteredBooks = [...state.books];
      
      // Kategoriye göre filtreleme
      if (filters.category) {
        filteredBooks = filteredBooks.filter(book => book.category === filters.category);
      }
      
      // Fiyat aralığına göre filtreleme
      if (filters.minPrice !== undefined) {
        filteredBooks = filteredBooks.filter(book => {
          if (book.isFree) return true;
          return book.price.amount >= filters.minPrice;
        });
      }
      
      if (filters.maxPrice !== undefined) {
        filteredBooks = filteredBooks.filter(book => {
          if (book.isFree) return filters.includeFree !== false;
          return book.price.amount <= filters.maxPrice;
        });
      }
      
      // Yayın yılına göre filtreleme
      if (filters.publishedYear) {
        filteredBooks = filteredBooks.filter(book => book.publishedYear === filters.publishedYear);
      }
      
      // Dile göre filtreleme
      if (filters.language) {
        filteredBooks = filteredBooks.filter(book => book.language === filters.language);
      }
      
      return filteredBooks;
    },
    
    // Klasik kitapları localStorage'a ekleyen fonksiyon
    async initializeClassicBooks({ commit, state }) {

      // Eğer kitaplar zaten varsa, tekrar ekleme yapma
      if (state.books && state.books.length > 0) {
        return state.books;
      }
      
      try {
        // LocalStorage'da kitaplar var mı kontrol et
        const existingBooks = await localStorageService.getItem(BOOKS_KEY);
        if (existingBooks && existingBooks.length > 0) {
          commit('SET_BOOKS', existingBooks);
          return existingBooks;
        }
        
        // Örnek klasik kitapları tanımla
        const classicBooks = [
          {
            id: "book-1000001",
            title: "Suç ve Ceza",
            author: "Fyodor Dostoyevski",
            description: "Yoksul bir öğrenci olan Raskolnikov'un işlediği cinayeti ve sonrasında yaşadığı psikolojik çöküşü anlatan klasik roman.",
            coverImage: "https://picsum.photos/seed/book1/300/400",
            category: "Roman",
            language: "Türkçe",
            publishedYear: 1866,
            pageCount: 687,
            isbn: "9789750719387",
            price: {
              amount: 85.50,
              currency: "TRY"
            },
            isFree: false,
            isFeatured: true,
            tags: ["Klasik", "Rus Edebiyatı", "Psikolojik"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "book-1000002",
            title: "Sefiller",
            author: "Victor Hugo",
            description: "Jean Valjean'ın hayat hikayesi etrafında gelişen, adaletsizlik, merhamet ve kurtuluş temalarını işleyen epik roman.",
            coverImage: "https://picsum.photos/seed/book2/300/400",
            category: "Roman",
            language: "Türkçe",
            publishedYear: 1862,
            pageCount: 1724,
            isbn: "9789750738609",
            price: {
              amount: 95.75,
              currency: "TRY"
            },
            isFree: false,
            tags: ["Klasik", "Fransız Edebiyatı", "Tarihi"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "book-1000003",
            title: "Savaş ve Barış",
            author: "Lev Tolstoy",
            description: "Napolyon'un Rusya seferini ve beş aristokrat ailenin yaşamını konu alan tarihi roman.",
            coverImage: "https://picsum.photos/seed/book3/300/400",
            category: "Roman",
            language: "Türkçe",
            publishedYear: 1869,
            pageCount: 1392,
            isbn: "9789750726477",
            price: {
              amount: 135.00,
              currency: "TRY"
            },
            isFree: false,
            tags: ["Klasik", "Rus Edebiyatı", "Tarihi"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "book-1000004",
            title: "Don Kişot",
            author: "Miguel de Cervantes",
            description: "Şövalye romanlarından etkilenen Don Kişot'un gerçeklikle hayal dünyası arasındaki maceraları anlatan satirik roman.",
            coverImage: "https://picsum.photos/seed/book4/300/400",
            category: "Roman",
            language: "Türkçe",
            publishedYear: 1605,
            pageCount: 1024,
            isbn: "9789750726842",
            price: {
              amount: 90.50,
              currency: "TRY"
            },
            isFree: false,
            isFeatured: true,
            tags: ["Klasik", "İspanyol Edebiyatı", "Satirik"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "book-1000005",
            title: "Madame Bovary",
            author: "Gustave Flaubert",
            description: "Taşra hayatının sıkıcılığından bunalan Emma Bovary'nin yasak aşk ve lüks yaşam arayışını anlatan roman.",
            coverImage: "https://picsum.photos/seed/book5/300/400",
            category: "Roman",
            language: "Türkçe",
            publishedYear: 1856,
            pageCount: 360,
            isbn: "9789750743900",
            price: {
              amount: 76.25,
              currency: "TRY"
            },
            isFree: false,
            tags: ["Klasik", "Fransız Edebiyatı", "Psikolojik"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "book-1000006",
            title: "Uğultulu Tepeler",
            author: "Emily Brontë",
            description: "Catherine ve Heathcliff'in tutkulu ve yıkıcı aşk hikayesini anlatan klasik Gotik roman.",
            coverImage: "https://picsum.photos/seed/book6/300/400",
            category: "Roman",
            language: "Türkçe",
            publishedYear: 1847,
            pageCount: 368,
            isbn: "9789750741395",
            price: {
              amount: 70.00,
              currency: "TRY"
            },
            isFree: false,
            tags: ["Klasik", "İngiliz Edebiyatı", "Gotik"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "book-1000007",
            title: "Moby Dick",
            author: "Herman Melville",
            description: "Kaptan Ahab'ın beyaz balina Moby Dick'e karşı intikam arayışını konu alan deniz romanı.",
            coverImage: "https://picsum.photos/seed/book7/300/400",
            category: "Roman",
            language: "Türkçe",
            publishedYear: 1851,
            pageCount: 704,
            isbn: "9789750740404",
            price: {
              amount: 85.50,
              currency: "TRY"
            },
            isFree: false,
            tags: ["Klasik", "Amerikan Edebiyatı", "Macera"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "book-1000008",
            title: "Anna Karenina",
            author: "Lev Tolstoy",
            description: "Evli bir kadının yasak aşkı ve Rus aristokrasisini anlatan psikolojik roman.",
            coverImage: "https://picsum.photos/seed/book8/300/400",
            category: "Roman",
            language: "Türkçe",
            publishedYear: 1877,
            pageCount: 864,
            isbn: "9789750734519",
            price: {
              amount: 95.75,
              currency: "TRY"
            },
            isFree: false,
            tags: ["Klasik", "Rus Edebiyatı", "Psikolojik"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "book-1000009",
            title: "1984",
            author: "George Orwell",
            description: "Totaliter bir rejimin gözetim altında tuttuğu distopik bir dünyayı anlatan siyasi roman.",
            coverImage: "https://picsum.photos/seed/book9/300/400",
            category: "Bilim Kurgu",
            language: "Türkçe",
            publishedYear: 1949,
            pageCount: 352,
            isbn: "9789750718793",
            price: {
              amount: 65.00,
              currency: "TRY"
            },
            isFree: true,
            isFeatured: true,
            tags: ["Klasik", "Distopya", "Siyasi"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "book-1000010",
            title: "Hayvan Çiftliği",
            author: "George Orwell",
            description: "Bir çiftlikte yaşanan devrim ve sonrasını alegorik olarak anlatan siyasi hiciv.",
            coverImage: "https://picsum.photos/seed/book10/300/400",
            category: "Roman",
            language: "Türkçe",
            publishedYear: 1945,
            pageCount: 152,
            isbn: "9789750718809",
            price: {
              amount: 55.00,
              currency: "TRY"
            },
            isFree: true,
            tags: ["Klasik", "Alegori", "Siyasi"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "book-1000011",
            title: "Gurur ve Önyargı",
            author: "Jane Austen",
            description: "Elizabeth Bennet ve Bay Darcy'nin aşk hikayesini konu alan romansı roman.",
            coverImage: "https://picsum.photos/seed/book11/300/400",
            category: "Roman",
            language: "Türkçe",
            publishedYear: 1813,
            pageCount: 424,
            isbn: "9789750726262",
            price: {
              amount: 75.00,
              currency: "TRY"
            },
            isFree: false,
            tags: ["Klasik", "İngiliz Edebiyatı", "Romantik"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "book-1000012",
            title: "Ulysses",
            author: "James Joyce",
            description: "Dublin'de geçen bir günün anlatıldığı modernist edebiyatın başyapıtı.",
            coverImage: "https://picsum.photos/seed/book12/300/400",
            category: "Roman",
            language: "Türkçe",
            publishedYear: 1922,
            pageCount: 804,
            isbn: "9789750740411",
            price: {
              amount: 115.50,
              currency: "TRY"
            },
            isFree: false,
            tags: ["Klasik", "İrlanda Edebiyatı", "Modernist"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "book-1000013",
            title: "Bülbülü Öldürmek",
            author: "Harper Lee",
            description: "1930'ların Amerika'sında ırkçılık ve adaletsizliği bir çocuğun gözünden anlatan roman.",
            coverImage: "https://picsum.photos/seed/book13/300/400",
            category: "Roman",
            language: "Türkçe",
            publishedYear: 1960,
            pageCount: 360,
            isbn: "9789750726750",
            price: {
              amount: 65.50,
              currency: "TRY"
            },
            isFree: false,
            tags: ["Klasik", "Amerikan Edebiyatı", "Toplumsal"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "book-1000014",
            title: "Yüzyıllık Yalnızlık",
            author: "Gabriel García Márquez",
            description: "Buendia ailesinin yedi kuşak boyunca yaşadıklarını konu alan büyülü gerçekçi roman.",
            coverImage: "https://picsum.photos/seed/book14/300/400",
            category: "Roman",
            language: "Türkçe",
            publishedYear: 1967,
            pageCount: 416,
            isbn: "9789750726545",
            price: {
              amount: 78.50,
              currency: "TRY"
            },
            isFree: false,
            isFeatured: true,
            tags: ["Klasik", "Latin Amerika Edebiyatı", "Büyülü Gerçekçilik"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "book-1000015",
            title: "Dönüşüm",
            author: "Franz Kafka",
            description: "Bir sabah uyandığında kendini dev bir böceğe dönüşmüş bulan Gregor Samsa'nın hikayesi.",
            coverImage: "https://picsum.photos/seed/book15/300/400",
            category: "Roman",
            language: "Türkçe",
            publishedYear: 1915,
            pageCount: 96,
            isbn: "9789750734243",
            price: {
              amount: 42.50,
              currency: "TRY"
            },
            isFree: true,
            tags: ["Klasik", "Alman Edebiyatı", "Absürt"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        // Diğer 35 kitap için şablonu çoğalt
        const bookTemplates = [
          { title: "İki Şehrin Hikayesi", author: "Charles Dickens", category: "Roman", isFree: false },
          { title: "Büyük Umutlar", author: "Charles Dickens", category: "Roman", isFree: false },
          { title: "Oliver Twist", author: "Charles Dickens", category: "Roman", isFree: false },
          { title: "Vadideki Zambak", author: "Honoré de Balzac", category: "Roman", isFree: false },
          { title: "Goriot Baba", author: "Honoré de Balzac", category: "Roman", isFree: false },
          { title: "Kumarbaz", author: "Fyodor Dostoyevski", category: "Roman", isFree: false },
          { title: "Karamazov Kardeşler", author: "Fyodor Dostoyevski", category: "Roman", isFree: false },
          { title: "Budala", author: "Fyodor Dostoyevski", category: "Roman", isFree: true },
          { title: "İnsancıklar", author: "Fyodor Dostoyevski", category: "Roman", isFree: false },
          { title: "Yeraltından Notlar", author: "Fyodor Dostoyevski", category: "Roman", isFree: false },
          { title: "Diriliş", author: "Lev Tolstoy", category: "Roman", isFree: false },
          { title: "İvan İlyiç'in Ölümü", author: "Lev Tolstoy", category: "Roman", isFree: true },
          { title: "Bir İdam Mahkumunun Son Günü", author: "Victor Hugo", category: "Roman", isFree: false },
          { title: "Notre Dame'ın Kamburu", author: "Victor Hugo", category: "Roman", isFree: false },
          { title: "Deniz İşçileri", author: "Victor Hugo", category: "Roman", isFree: false },
          { title: "Altın Defter", author: "Doris Lessing", category: "Roman", isFree: false },
          { title: "Çalıkuşu", author: "Reşat Nuri Güntekin", category: "Roman", isFree: true },
          { title: "Othello", author: "William Shakespeare", category: "Tiyatro", isFree: false },
          { title: "Romeo ve Juliet", author: "William Shakespeare", category: "Tiyatro", isFree: true },
          { title: "Hamlet", author: "William Shakespeare", category: "Tiyatro", isFree: false },
          { title: "Macbeth", author: "William Shakespeare", category: "Tiyatro", isFree: false },
          { title: "Kral Lear", author: "William Shakespeare", category: "Tiyatro", isFree: false },
          { title: "Bir Yaz Gecesi Rüyası", author: "William Shakespeare", category: "Tiyatro", isFree: false },
          { title: "Fırtına", author: "William Shakespeare", category: "Tiyatro", isFree: false },
          { title: "Fareler ve İnsanlar", author: "John Steinbeck", category: "Roman", isFree: false },
          { title: "Gazap Üzümleri", author: "John Steinbeck", category: "Roman", isFree: false },
          { title: "İnci", author: "John Steinbeck", category: "Roman", isFree: true },
          { title: "Cesur Yeni Dünya", author: "Aldous Huxley", category: "Bilim Kurgu", isFree: false },
          { title: "Algernon'a Çiçekler", author: "Daniel Keyes", category: "Bilim Kurgu", isFree: false },
          { title: "Beyaz Diş", author: "Jack London", category: "Roman", isFree: true },
          { title: "Vahşetin Çağrısı", author: "Jack London", category: "Roman", isFree: false },
          { title: "Martin Eden", author: "Jack London", category: "Roman", isFree: false },
          { title: "Ses ve Öfke", author: "William Faulkner", category: "Roman", isFree: false },
          { title: "Çavdar Tarlasında Çocuklar", author: "J.D. Salinger", category: "Roman", isFree: false },
          { title: "Sineklerin Tanrısı", author: "William Golding", category: "Roman", isFree: false }
        ];
        
        // Template'ten kitapları oluştur
        const additionalBooks = bookTemplates.map((template, index) => ({
          id: `book-100${index + 16}`,
          title: template.title,
          author: template.author,
          description: `${template.title}, ${template.author} tarafından yazılmış önemli bir klasik eserdir.`,
          coverImage: `https://picsum.photos/seed/${index + 16}/300/400`,
          category: template.category,
          language: "Türkçe",
          publishedYear: 1800 + Math.floor(Math.random() * 200),
          pageCount: 100 + Math.floor(Math.random() * 600),
          isbn: `978${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
          price: {
            amount: 30 + Math.floor(Math.random() * 100),
            currency: "TRY"
          },
          isFree: template.isFree,
          tags: ["Klasik", template.category],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        
        // Tüm kitapları birleştir
        const allBooks = [...classicBooks, ...additionalBooks];
        
        // LocalStorage'a kaydet
        await localStorageService.setItem(BOOKS_KEY, allBooks);
        
        // Store'a yükle
        commit('SET_BOOKS', allBooks);
        
        return allBooks;
      } catch (error) {
        commit('SET_ERROR', error.message);
        return [];
      }
    }
  }
}; 