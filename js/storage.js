const STORAGE_KEY_BOOKS = 'siperpustakaan_books';
const STORAGE_KEY_QUEUE = 'siperpustakaan_queue';
const STORAGE_KEY_BORROWS = 'siperpustakaan_borrows';

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}