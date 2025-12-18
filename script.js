// Main Visualization Class
class SortingVisualizer {
    constructor() {
        this.canvas = document.getElementById("sortingCanvas");
        this.ctx = this.canvas.getContext("2d");

        this.array = [];
        this.arraySize = 30;
        this.speed = 50;
        this.isSorting = false;
        this.isPaused = false;

        this.comparisons = 0;
        this.swaps = 0;
        this.startTime = 0;

        this.colors = {
            default: "#4fc3f7",
            sorted: "#4caf50"
        };

        this.resizeCanvas();
        this.generateRandomArray();
        this.addEventListeners();
        this.draw();
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = 400;
    }

    resetStats() {
        this.comparisons = 0;
        this.swaps = 0;
        this.startTime = Date.now();
        this.updateStats();
    }

    updateStats() {
        document.getElementById("comparisons").textContent = this.comparisons;
        document.getElementById("swaps").textContent = this.swaps;
        document.getElementById("time").textContent =
            Date.now() - this.startTime + " ms";
    }

    generateRandomArray() {
        this.array = [];
        for (let i = 0; i < this.arraySize; i++) {
            this.array.push({
                value: Math.floor(Math.random() * 300) + 10,
                color: this.colors.default
            });
        }
        this.resetStats();
        this.draw();
    }

    addEventListeners() {
        document.getElementById("arraySize").oninput = e => {
            this.arraySize = +e.target.value;
            document.getElementById("sizeValue").textContent = this.arraySize;
            this.generateRandomArray();
        };

        document.getElementById("speed").oninput = e => {
            this.speed = +e.target.value;
        };

        document.getElementById("generateArray").onclick = () => {
            this.stopSorting();
            this.generateRandomArray();
        };

        document.getElementById("useCustomArray").onclick = () => {
            const input = document.getElementById("customArray").value;
            const nums = input.split(",").map(n => parseInt(n.trim()));

            if (nums.length < 5 || nums.some(isNaN)) {
                alert("Please enter at least 5 valid numbers.");
                return;
            }

            this.stopSorting();
            this.array = nums.map(v => ({
                value: v,
                color: this.colors.default
            }));
            this.resetStats();
            this.draw();
        };

        document.getElementById("startSort").onclick = () => {
            if (!this.isSorting) this.startSorting();
        };

        document.getElementById("pauseSort").onclick = () => {
            this.isPaused = !this.isPaused;
        };

        document.getElementById("reset").onclick = () => {
            this.stopSorting();
            this.generateRandomArray();
        };
    }

    async sleep() {
        while (this.isPaused) {
            await new Promise(r => setTimeout(r, 100));
        }
        return new Promise(r =>
            setTimeout(r, Math.max(5, 110 - this.speed))
        );
    }

    stopSorting() {
        this.isSorting = false;
        this.isPaused = false;
    }

    async startSorting() {
        this.isSorting = true;
        this.resetStats();

        const algo = document.getElementById("algorithm").value;

        if (algo === "bubble") await this.bubbleSort();
        if (algo === "selection") await this.selectionSort();
        if (algo === "insertion") await this.insertionSort();
        if (algo === "merge") await this.mergeSort(0, this.array.length - 1);
        if (algo === "quick") await this.quickSort(0, this.array.length - 1);
        if (algo === "heap") await this.heapSort();
        if (algo === "counting") await this.countingSort();
        if (algo === "radix") await this.radixSort();

        this.array.forEach(e => e.color = this.colors.sorted);
        this.draw();
        this.isSorting = false;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const barWidth = this.canvas.width / this.array.length;
        const maxVal = Math.max(...this.array.map(e => e.value));

        this.array.forEach((e, i) => {
            const height = (e.value / maxVal) * (this.canvas.height - 20);
            this.ctx.fillStyle = e.color;
            this.ctx.fillRect(
                i * barWidth,
                this.canvas.height - height,
                barWidth - 2,
                height
            );
        });
    }

    // ================= BASIC SORTS =================

    async bubbleSort() {
        for (let i = 0; i < this.array.length; i++) {
            for (let j = 0; j < this.array.length - i - 1; j++) {
                if (!this.isSorting) return;

                this.comparisons++;
                if (this.array[j].value > this.array[j + 1].value) {
                    [this.array[j], this.array[j + 1]] =
                        [this.array[j + 1], this.array[j]];
                    this.swaps++;
                }

                this.updateStats();
                this.draw();
                await this.sleep();
            }
        }
    }

    async selectionSort() {
        for (let i = 0; i < this.array.length; i++) {
            let min = i;
            for (let j = i + 1; j < this.array.length; j++) {
                this.comparisons++;
                if (this.array[j].value < this.array[min].value) min = j;
                this.updateStats();
                await this.sleep();
            }
            [this.array[i], this.array[min]] =
                [this.array[min], this.array[i]];
            this.swaps++;
            this.updateStats();
            this.draw();
        }
    }

    async insertionSort() {
        for (let i = 1; i < this.array.length; i++) {
            let key = this.array[i];
            let j = i - 1;

            while (j >= 0 && this.array[j].value > key.value) {
                this.comparisons++;
                this.array[j + 1] = this.array[j];
                j--;
                this.swaps++;
                this.updateStats();
                this.draw();
                await this.sleep();
            }
            this.array[j + 1] = key;
        }
    }

    // ================= ADVANCED SORTS =================

    async mergeSort(l, r) {
        if (l >= r || !this.isSorting) return;
        const m = Math.floor((l + r) / 2);
        await this.mergeSort(l, m);
        await this.mergeSort(m + 1, r);

        const left = this.array.slice(l, m + 1);
        const right = this.array.slice(m + 1, r + 1);

        let i = 0, j = 0, k = l;
        while (i < left.length && j < right.length) {
            this.comparisons++;
            this.array[k++] =
                left[i].value <= right[j].value ? left[i++] : right[j++];
            this.swaps++;
            this.updateStats();
            this.draw();
            await this.sleep();
        }

        while (i < left.length) this.array[k++] = left[i++];
        while (j < right.length) this.array[k++] = right[j++];
    }

    async quickSort(l, r) {
        if (l >= r || !this.isSorting) return;
        let pivot = this.array[r].value;
        let i = l;

        for (let j = l; j < r; j++) {
            this.comparisons++;
            if (this.array[j].value < pivot) {
                [this.array[i], this.array[j]] =
                    [this.array[j], this.array[i]];
                this.swaps++;
                i++;
            }
            this.updateStats();
            this.draw();
            await this.sleep();
        }

        [this.array[i], this.array[r]] =
            [this.array[r], this.array[i]];
        this.swaps++;

        await this.quickSort(l, i - 1);
        await this.quickSort(i + 1, r);
    }

    async heapSort() {
        const n = this.array.length;

        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            await this.heapify(n, i);
        }

        for (let i = n - 1; i > 0; i--) {
            [this.array[0], this.array[i]] =
                [this.array[i], this.array[0]];
            this.swaps++;
            this.updateStats();
            this.draw();
            await this.sleep();
            await this.heapify(i, 0);
        }
    }

    async heapify(n, i) {
        let largest = i;
        let l = 2 * i + 1;
        let r = 2 * i + 2;

        if (l < n && this.array[l].value > this.array[largest].value) largest = l;
        if (r < n && this.array[r].value > this.array[largest].value) largest = r;

        if (largest !== i) {
            [this.array[i], this.array[largest]] =
                [this.array[largest], this.array[i]];
            this.swaps++;
            this.updateStats();
            this.draw();
            await this.sleep();
            await this.heapify(n, largest);
        }
    }

    async countingSort() {
        let max = Math.max(...this.array.map(e => e.value));
        let count = new Array(max + 1).fill(0);

        this.array.forEach(e => count[e.value]++);
        let index = 0;

        for (let i = 0; i < count.length; i++) {
            while (count[i]--) {
                this.array[index++].value = i;
                this.swaps++;
                this.updateStats();
                this.draw();
                await this.sleep();
            }
        }
    }

    async radixSort() {
        let max = Math.max(...this.array.map(e => e.value));

        for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
            let output = new Array(this.array.length);
            let count = new Array(10).fill(0);

            for (let i = 0; i < this.array.length; i++) {
                count[Math.floor(this.array[i].value / exp) % 10]++;
            }

            for (let i = 1; i < 10; i++) count[i] += count[i - 1];

            for (let i = this.array.length - 1; i >= 0; i--) {
                let d = Math.floor(this.array[i].value / exp) % 10;
                output[--count[d]] = this.array[i];
                this.swaps++;
            }

            this.array = output;
            this.updateStats();
            this.draw();
            await this.sleep();
        }
    }
}

window.onload = () => new SortingVisualizer();
