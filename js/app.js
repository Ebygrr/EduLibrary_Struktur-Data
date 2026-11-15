document.addEventListener("DOMContentLoaded", () => {
    initData();
    updateDashboard();
    renderBooks(books);
    updateBookSelect();
    renderQueue();
    renderBorrows();
    
    document.getElementById("book-form").addEventListener("submit", saveBook);
    document.getElementById("queue-form").addEventListener("submit", enqueueRequest);
});

function showSection(sectionId) {
    document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
    document.getElementById(sectionId).classList.add("active");
    if(sectionId === 'dashboard') updateDashboard();
    if(sectionId === 'antrean') updateBookSelect();
}

function updateDashboard() {
    document.getElementById("stat-total-buku").innerText = books.length;
    document.getElementById("stat-total-stok").innerText = books.reduce((sum, b) => sum + parseInt(b.stok), 0);
    document.getElementById("stat-antrean").innerText = borrowQueue.toArray().length;
    document.getElementById("stat-aktif").innerText = activeBorrows.length;
}

// === FITUR KATALOG BUKU ===
function renderBooks(dataToRender) {
    const tbody = document.getElementById("book-table-body");
    tbody.innerHTML = "";
    dataToRender.forEach(book => {
        tbody.innerHTML += `
            <tr>
                <td>${book.kodeBuku}</td>
                <td>${book.judul}</td>
                <td>${book.penulis}</td>
                <td>${book.kategori}</td>
                <td>${book.tahunTerbit}</td>
                <td>${book.stok}</td>
                <td>
                    <button class="btn-edit" onclick="editBook(${book.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteBook(${book.id})">Hapus</button>
                </td>
            </tr>
        `;
    });
}

function saveBook(e) {
    e.preventDefault();
    const id = document.getElementById("book-id").value;
    const kode = document.getElementById("book-code").value.trim();
    const judul = document.getElementById("book-title").value.trim();
    const penulis = document.getElementById("book-author").value.trim();
    const kategori = document.getElementById("book-category").value.trim();
    const tahun = document.getElementById("book-year").value;
    const stok = document.getElementById("book-stock").value;

    if (!kode || !judul || !penulis) {
        alert("Mohon lengkapi data!");
        return;
    }

    if (id) {
        // Edit existing
        const index = books.findIndex(b => b.id == id);
        if (books.some(b => b.kodeBuku === kode && b.id != id)) {
            alert("Kode buku sudah ada!");
            return;
        }
        books[index] = { id: parseInt(id), kodeBuku: kode, judul, penulis, kategori, tahunTerbit: tahun, stok: parseInt(stok) };
        alert("Buku berhasil diperbarui!");
    } else {
        // Add new
        if (books.some(b => b.kodeBuku === kode)) {
            alert("Kode buku sudah ada!");
            return;
        }
        const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
        books.push({ id: newId, kodeBuku: kode, judul, penulis, kategori, tahunTerbit: tahun, stok: parseInt(stok) });
        alert("Buku berhasil ditambahkan!");
    }
    
    saveToLocalStorage(STORAGE_KEY_BOOKS, books);
    cancelEdit();
    renderBooks(books);
    updateBookSelect();
}

function editBook(id) {
    const book = books.find(b => b.id == id);
    if (!book) return;
    document.getElementById("book-id").value = book.id;
    document.getElementById("book-code").value = book.kodeBuku;
    document.getElementById("book-title").value = book.judul;
    document.getElementById("book-author").value = book.penulis;
    document.getElementById("book-category").value = book.kategori;
    document.getElementById("book-year").value = book.tahunTerbit;
    document.getElementById("book-stock").value = book.stok;
    document.getElementById("btn-cancel-edit").style.display = "inline-block";
    showSection('katalog');
}

function cancelEdit() {
    document.getElementById("book-form").reset();
    document.getElementById("book-id").value = "";
    document.getElementById("btn-cancel-edit").style.display = "none";
}

function deleteBook(id) {
    if (confirm("Apakah Anda yakin ingin menghapus buku ini?")) {
        books = books.filter(b => b.id !== id);
        saveToLocalStorage(STORAGE_KEY_BOOKS, books);
        renderBooks(books);
        updateBookSelect();
    }
}

// === SEARCHING & SORTING ===
function handleSearch() {
    const query = document.getElementById("search-query").value;
    const type = document.getElementById("search-type").value;
    const results = linearSearch(books, query, type);
    renderBooks(results);
}

function resetSearch() {
    document.getElementById("search-query").value = "";
    renderBooks(books);
}

function handleSort() {
    const type = document.getElementById("sort-type").value;
    const sorted = selectionSort(books, type);
    renderBooks(sorted);
}

// === FITUR ANTREAN QUEUE ===
function updateBookSelect() {
    const select = document.getElementById("borrow-book-code");
    select.innerHTML = '<option value="">Pilih Buku...</option>';
    books.forEach(b => {
        select.innerHTML += `<option value="${b.kodeBuku}">${b.kodeBuku} - ${b.judul} (Stok: ${b.stok})</option>`;
    });
}

function enqueueRequest(e) {
    e.preventDefault();
    const name = document.getElementById("borrower-name").value.trim();
    const kode = document.getElementById("borrow-book-code").value;

    if (!name || !kode) return;
    
    const request = {
        reqId: Date.now(),
        nama: name,
        kodeBuku: kode
    };
    
    borrowQueue.enqueue(request);
    saveToLocalStorage(STORAGE_KEY_QUEUE, borrowQueue.toArray());
    
    document.getElementById("queue-form").reset();
    alert("Permintaan dimasukkan ke antrean!");
    renderQueue();
}

function renderQueue() {
    const qArray = borrowQueue.toArray();
    document.getElementById("queue-count").innerText = qArray.length;
    
    const nextEl = document.getElementById("queue-next");
    if (!borrowQueue.isEmpty()) {
        const next = borrowQueue.peek();
        const book = books.find(b => b.kodeBuku === next.kodeBuku);
        nextEl.innerText = `${next.nama} (Meminta: ${book ? book.judul : next.kodeBuku})`;
    } else {
        nextEl.innerText = "-";
    }

    const tbody = document.getElementById("queue-table-body");
    tbody.innerHTML = "";
    qArray.forEach((req, idx) => {
        const book = books.find(b => b.kodeBuku === req.kodeBuku);
        const bookTitle = book ? book.judul : req.kodeBuku;
        const stockStatus = book ? (book.stok > 0 ? '<span style="color:green">Tersedia</span>' : '<span style="color:red">Habis</span>') : 'Tidak Valid';
        tbody.innerHTML += `
            <tr>
                <td>${idx + 1}</td>
                <td>${req.nama}</td>
                <td>${bookTitle}</td>
                <td>${stockStatus}</td>
            </tr>
        `;
    });
}

function processNextQueue() {
    if (borrowQueue.isEmpty()) {
        alert("Tidak ada antrean!");
        return;
    }
    
    const nextReq = borrowQueue.peek();
    const bookIndex = books.findIndex(b => b.kodeBuku === nextReq.kodeBuku);
    
    if (bookIndex !== -1 && books[bookIndex].stok > 0) {
        // Proses berhasil
        books[bookIndex].stok -= 1;
        saveToLocalStorage(STORAGE_KEY_BOOKS, books);
        
        // Pindahkan ke active borrows
        const req = borrowQueue.dequeue();
        activeBorrows.push({
            borrowId: req.reqId,
            nama: req.nama,
            kodeBuku: req.kodeBuku,
            judul: books[bookIndex].judul
        });
        
        saveToLocalStorage(STORAGE_KEY_QUEUE, borrowQueue.toArray());
        saveToLocalStorage(STORAGE_KEY_BORROWS, activeBorrows);
        
        alert(`Berhasil! ${req.nama} meminjam buku ${books[bookIndex].judul}. Stok berkurang.`);
        
        renderBooks(books);
        updateBookSelect();
        renderQueue();
        renderBorrows();
        updateDashboard();
    } else {
        // Stok habis
        alert(`Gagal diproses: Stok buku untuk permintaan ${nextReq.nama} tidak tersedia. Permintaan ditunda di antrean.`);
    }
}

// === PENGEMBALIAN ===
function renderBorrows() {
    const tbody = document.getElementById("borrows-table-body");
    tbody.innerHTML = "";
    activeBorrows.forEach(b => {
        tbody.innerHTML += `
            <tr>
                <td>TRX-${b.borrowId}</td>
                <td>${b.nama}</td>
                <td>${b.judul}</td>
                <td>
                    <button class="btn-edit" onclick="returnBook(${b.borrowId})">Kembalikan Buku</button>
                </td>
            </tr>
        `;
    });
}

function returnBook(borrowId) {
    const borrowIdx = activeBorrows.findIndex(b => b.borrowId === borrowId);
    if (borrowIdx !== -1) {
        const borrowed = activeBorrows[borrowIdx];
        
        // Kembalikan stok
        const bookIndex = books.findIndex(b => b.kodeBuku === borrowed.kodeBuku);
        if (bookIndex !== -1) {
            books[bookIndex].stok += 1;
            saveToLocalStorage(STORAGE_KEY_BOOKS, books);
        }
        
        // Hapus dari peminjaman aktif
        activeBorrows.splice(borrowIdx, 1);
        saveToLocalStorage(STORAGE_KEY_BORROWS, activeBorrows);
        
        alert(`Buku ${borrowed.judul} berhasil dikembalikan oleh ${borrowed.nama}. Stok bertambah.`);
        
        renderBooks(books);
        updateBookSelect();
        renderBorrows();
        updateDashboard();
    }
}

function resetData() {
    if(confirm("AWAS! Ini akan menghapus semua data (Buku, Antrean, Peminjaman) dan mereset ke data awal. Yakin?")) {
        localStorage.clear();
        alert("Data berhasil direset. Halaman akan dimuat ulang.");
        location.reload();
    }
}