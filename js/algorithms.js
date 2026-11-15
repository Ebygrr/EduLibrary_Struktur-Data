// Linear Search implementation
function linearSearch(arr, query, type) {
    const results = [];
    const q = query.toLowerCase();
    for (let i = 0; i < arr.length; i++) {
        let match = false;
        if (type === 'kode' && arr[i].kodeBuku.toLowerCase().includes(q)) match = true;
        if (type === 'judul' && arr[i].judul.toLowerCase().includes(q)) match = true;
        if (type === 'penulis' && arr[i].penulis.toLowerCase().includes(q)) match = true;
        
        if (match) {
            results.push(arr[i]);
        }
    }
    return results;
}

// Selection Sort implementation
function selectionSort(arr, key) {
    let sortedArr = [...arr]; // Copy array
    let n = sortedArr.length;
    
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            if (key === 'judul') {
                if (sortedArr[j].judul.toLowerCase() < sortedArr[minIdx].judul.toLowerCase()) {
                    minIdx = j;
                }
            } else if (key === 'stok') {
                if (parseInt(sortedArr[j].stok) < parseInt(sortedArr[minIdx].stok)) {
                    minIdx = j;
                }
            }
        }
        // Swap
        if (minIdx !== i) {
            let temp = sortedArr[i];
            sortedArr[i] = sortedArr[minIdx];
            sortedArr[minIdx] = temp;
        }
    }
    return sortedArr;
}