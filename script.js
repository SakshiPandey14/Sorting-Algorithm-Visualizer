// Main Visualization Class
let array = [];
let comparisons = 0;
let swaps = 0;

function drawArray(arr, highlight = []) {
    const container = document.getElementById("arrayContainer");
    container.innerHTML = "";
    for (let i = 0; i < arr.length; i++) {
        const bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.height = arr[i] * 5 + "px";
        if (highlight.includes(i)) bar.style.backgroundColor = "red";
        container.appendChild(bar);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateStats() {
    document.getElementById("comparisons").innerText = comparisons;
    document.getElementById("swaps").innerText = swaps;
}

// ---------------- SORTING ALGORITHMS ---------------- //

async function bubbleSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            comparisons++;
            updateStats();
            if (arr[j] > arr[j + 1]) {
                swaps++;
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                drawArray(arr, [j, j + 1]);
                await sleep(200);
            }
        }
    }
}

async function selectionSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            comparisons++;
            updateStats();
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        if (minIdx !== i) {
            swaps++;
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
            drawArray(arr, [i, minIdx]);
            await sleep(200);
        }
    }
}

async function insertionSort(arr) {
    let n = arr.length;
    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            comparisons++;
            arr[j + 1] = arr[j];
            swaps++;
            drawArray(arr, [j, j + 1]);
            updateStats();
            await sleep(200);
            j--;
        }
        arr[j + 1] = key;
    }
}

async function mergeSort(arr, l = 0, r = arr.length - 1) {
    if (l >= r) return;
    let m = Math.floor((l + r) / 2);
    await mergeSort(arr, l, m);
    await mergeSort(arr, m + 1, r);
    await merge(arr, l, m, r);
}

async function merge(arr, l, m, r) {
    let left = arr.slice(l, m + 1);
    let right = arr.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
        comparisons++;
        updateStats();
        if (left[i] <= right[j]) {
            arr[k] = left[i++];
        } else {
            arr[k] = right[j++];
        }
        swaps++;
        drawArray(arr, [k]);
        await sleep(200);
        k++;
    }
    while (i < left.length) { arr[k++] = left[i++]; swaps++; drawArray(arr, [k-1]); await sleep(200); }
    while (j < right.length) { arr[k++] = right[j++]; swaps++; drawArray(arr, [k-1]); await sleep(200); }
}

async function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        let pi = await partition(arr, low, high);
        await quickSort(arr, low, pi - 1);
        await quickSort(arr, pi + 1, high);
    }
}

async function partition(arr, low, high) {
    let pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
        comparisons++;
        updateStats();
        if (arr[j] < pivot) {
            i++;
            swaps++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
            drawArray(arr, [i, j]);
            await sleep(200);
        }
    }
    swaps++;
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    drawArray(arr, [i + 1, high]);
    await sleep(200);
    return i + 1;
}

async function heapSort(arr) {
    let n = arr.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await heapify(arr, n, i);
    for (let i = n - 1; i > 0; i--) {
        swaps++;
        [arr[0], arr[i]] = [arr[i], arr[0]];
        drawArray(arr, [0, i]);
        await sleep(200);
        await heapify(arr, i, 0);
    }
}

async function heapify(arr, n, i) {
    let largest = i;
    let l = 2 * i + 1;
    let r = 2 * i + 2;
    if (l < n && arr[l] > arr[largest]) comparisons++;
    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) comparisons++;
    if (r < n && arr[r] > arr[largest]) largest = r;
    if (largest !== i) {
        swaps++;
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        drawArray(arr, [i, largest]);
        await sleep(200);
        await heapify(arr, n, largest);
    }
    updateStats();
}

async function countingSort(arr) {
    let max = Math.max(...arr);
    let count = Array(max + 1).fill(0);
    for (let i = 0; i < arr.length; i++) { count[arr[i]]++; comparisons++; swaps++; drawArray(arr, [i]); await sleep(100); updateStats(); }
    let index = 0;
    for (let i = 0; i < count.length; i++) {
        while (count[i]-- > 0) { arr[index++] = i; drawArray(arr, [index-1]); swaps++; await sleep(100); updateStats(); }
    }
}

async function radixSort(arr) {
    let max = Math.max(...arr);
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) await countingRadix(arr, exp);
}

async function countingRadix(arr, exp) {
    let output = Array(arr.length).fill(0);
    let count = Array(10).fill(0);
    for (let i = 0; i < arr.length; i++) count[Math.floor(arr[i]/exp)%10]++;
    for (let i = 1; i < 10; i++) count[i] += count[i-1];
    for (let i = arr.length - 1; i >= 0; i--) {
        output[count[Math.floor(arr[i]/exp)%10]-1] = arr[i];
        count[Math.floor(arr[i]/exp)%10]--;
    }
    for (let i = 0; i < arr.length; i++) { arr[i] = output[i]; swaps++; drawArray(arr, [i]); await sleep(100); updateStats(); }
}

// ---------------- START SORT ---------------- //

async function startSort() {
    const input = document.getElementById("arrayInput").value;
    if (!input) return alert("Please enter an array!");
    array = input.split(",").map(Number);
    drawArray(array);
    comparisons = 0; swaps = 0; updateStats();
    const algorithm = document.getElementById("algorithm").value;
    const startTime = performance.now();
    switch(algorithm) {
        case "bubble": await bubbleSort(array); break;
        case "selection": await selectionSort(array); break;
        case "insertion": await insertionSort(array); break;
        case "merge": await mergeSort(array); break;
        case "quick": await quickSort(array); break;
        case "heap": await heapSort(array); break;
        case "counting": await countingSort(array); break;
        case "radix": await radixSort(array); break;
    }
    const endTime = performance.now();
    document.getElementById("time").innerText = (endTime - startTime).toFixed(2);
    drawArray(array);
}
