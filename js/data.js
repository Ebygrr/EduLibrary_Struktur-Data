// Array List Buku
let books = [];

// Antrean Queue
let borrowQueue = new Queue();

// Transaksi Aktif Array
let activeBorrows = [];

// Initialize Data
function initData() {
    const storedBooks = loadFromLocalStorage(STORAGE_KEY_BOOKS);
    if (storedBooks) {
        books = storedBooks;
    } else {
        // Data Dummy awal
        books = [
            { id: 1, kodeBuku: 'B001', judul: 'Struktur Data dan Algoritma', penulis: 'Abdul Kadir', kategori: 'Teknologi', tahunTerbit: 2021, stok: 5 },
            { id: 2, kodeBuku: 'B002', judul: 'Pengantar Ilmu Komputer', penulis: 'Sutarman', kategori: 'Teknologi', tahunTerbit: 2020, stok: 2 }
        ];
        saveToLocalStorage(STORAGE_KEY_BOOKS, books);
    }

    const storedQueue = loadFromLocalStorage(STORAGE_KEY_QUEUE);
    if (storedQueue) {
        borrowQueue.fromArray(storedQueue);
    }

    const storedBorrows = loadFromLocalStorage(STORAGE_KEY_BORROWS);
    if (storedBorrows) {
        activeBorrows = storedBorrows;
    }
}
