// Main Visualization Class
class SortingVisualizer {
    constructor() {
        this.canvas = document.getElementById('sortingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.array = [];
        this.arraySize = 30;
        this.speed = 50;
        this.isSorting = false;
        this.isPaused = false;
        this.comparisons = 0;
        this.swaps = 0;
        this.startTime = 0;
        this.timeoutId = null;
        this.currentAlgorithm = null;
        
        // Colors for visualization
        this.colors = {
            default: '#4fc3f7',
            comparing: '#ffeb3b',
            swapping: '#f44336',
            sorted: '#4caf50',
            pivot: '#9c27b0'
        };
        
        this.init();
    }
    
    init() {
        this.updateCanvasSize();
        this.generateRandomArray();
        this.setupEventListeners();
        this.updateAlgorithmExplanation();
        this.draw();
        
        window.addEventListener('resize', () => {
            this.updateCanvasSize();
            this.draw();
        });
    }
    
    updateCanvasSize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }
    
    generateRandomArray() {
        this.array = [];
        const min = 10;
        const max = this.canvas.height - 50;
        
        for (let i = 0; i < this.arraySize; i++) {
            this.array.push({
                value: Math.floor(Math.random() * (max - min + 1)) + min,
                color: this.colors.default
            });
        }
        this.resetStats();
        this.draw();
    }
    
    generateSortedArray() {
        this.array = [];
        const min = 10;
        const max = this.canvas.height - 50;
        const step = (max - min) / this.arraySize;
        
        for (let i = 0; i < this.arraySize; i++) {
            this.array.push({
                value: Math.floor(min + i * step),
                color: this.colors.default
            });
        }
        this.resetStats();
        this.draw();
    }
    
    resetStats() {
        this.comparisons = 0;
        this.swaps = 0;
        this.startTime = 0;
        this.updateStats();
    }
    
    updateStats() {
        document.getElementById('comparisons').textContent = this.comparisons;
        document.getElementById('swaps').textContent = this.swaps;
        
        if (this.startTime) {
            const elapsed = Date.now() - this.startTime;
            document.getElementById('time').textContent = `${elapsed} ms`;
        }
    }
    
    updateAlgorithmExplanation() {
        const algorithm = document.getElementById('algorithm').value;
        const explanations = {
            bubble: "Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they're in the wrong order. Time Complexity: O(n²) worst/average, O(n) best.",
            selection: "Selection Sort divides the list into sorted and unsorted parts, repeatedly selecting the smallest element from unsorted part. Time Complexity: O(n²) always.",
            insertion: "Insertion Sort builds the final sorted array one item at a time, inserting each new element into its proper position. Time Complexity: O(n²) worst/average, O(n) best.",
            merge: "Merge Sort uses divide and conquer: recursively divides array into halves, sorts them, and merges sorted halves. Time Complexity: O(n log n) always.",
            quick: "Quick Sort picks a 'pivot' element, partitions array around pivot, and recursively sorts sub-arrays. Time Complexity: O(n log n) average, O(n²) worst.",
            heap: "Heap Sort converts array into a max heap, repeatedly extracts maximum element and rebuilds heap. Time Complexity: O(n log n) always."
        };
        
        document.getElementById('algorithmExplanation').innerHTML = `
            <p><strong>${document.getElementById('algorithm').selectedOptions[0].text}:</strong> ${explanations[algorithm]}</p>
            <p><strong>Space Complexity:</strong> ${algorithm === 'merge' ? 'O(n)' : 'O(1)'}</p>
        `;
        
        // Update complexity in stats
        const complexityMap = {
            bubble: 'O(n²)',
            selection: 'O(n²)',
            insertion: 'O(n²)',
            merge: 'O(n log n)',
            quick: 'O(n log n)',
            heap: 'O(n log n)'
        };
        document.getElementById('complexity').textContent = complexityMap[algorithm];
    }
    
    setupEventListeners() {
        // Array size slider
        const arraySizeSlider = document.getElementById('arraySize');
        const sizeValue = document.getElementById('sizeValue');
        
        arraySizeSlider.addEventListener('input', (e) => {
            this.arraySize = parseInt(e.target.value);
            sizeValue.textContent = this.arraySize;
            this.generateRandomArray();
        });
        
        // Speed slider
        const speedSlider = document.getElementById('speed');
        const speedValue = document.getElementById('speedValue');
        
        speedSlider.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            const speedText = this.speed < 33 ? 'Slow' : this.speed < 66 ? 'Medium' : 'Fast';
            speedValue.textContent = speedText;
        });
        
        // Algorithm selector
        document.getElementById('algorithm').addEventListener('change', () => {
            this.updateAlgorithmExplanation();
        });
        
        // Control buttons
        document.getElementById('generateArray').addEventListener('click', () => {
            this.stopSorting();
            this.generateRandomArray();
        });
        
        document.getElementById('startSort').addEventListener('click', () => {
            if (!this.isSorting) {
                this.startSorting();
            } else if (this.isPaused) {
                this.resumeSorting();
            }
        });
        
        document.getElementById('pauseSort').addEventListener('click', () => {
            if (this.isSorting && !this.isPaused) {
                this.pauseSorting();
            }
        });
        
        document.getElementById('reset').addEventListener('click', () => {
            this.stopSorting();
            this.generateRandomArray();
        });
    }
    
    async startSorting() {
        if (this.isSorting) return;
        
        this.isSorting = true;
        this.isPaused = false;
        this.startTime = Date.now();
        this.resetStats();
        
        const algorithm = document.getElementById('algorithm').value;
        this.currentAlgorithm = algorithm;
        
        const algorithms = {
            bubble: () => this.bubbleSort(),
            selection: () => this.selectionSort(),
            insertion: () => this.insertionSort(),
            merge: () => this.mergeSort(),
            quick: () => this.quickSort(),
            heap: () => this.heapSort()
        };
        
        try {
            await algorithms[algorithm]();
        } catch (error) {
            console.log('Sorting stopped:', error);
        }
        
        // Mark all as sorted
        for (let item of this.array) {
            item.color = this.colors.sorted;
        }
        this.draw();
        
        this.isSorting = false;
        this.currentAlgorithm = null;
    }
    
    pauseSorting() {
        this.isPaused = true;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }
    
    resumeSorting() {
        this.isPaused = false;
        this.startSorting();
    }
    
    stopSorting() {
        this.isSorting = false;
        this.isPaused = false;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        // Reset colors
        for (let item of this.array) {
            item.color = this.colors.default;
        }
        this.draw();
    }
    
    sleep() {
        const speedFactor = 101 - this.speed; // Invert speed (1-100 to 100-1)
        const sleepTime = Math.max(10, speedFactor * 2);
        return new Promise(resolve => {
            if (this.isPaused) {
                // Don't resolve when paused
                this.timeoutId = setTimeout(() => {
                    this.sleep().then(resolve);
                }, 100);
            } else {
                this.timeoutId = setTimeout(resolve, sleepTime);
            }
        });
    }
    
    // Bubble Sort Implementation
    async bubbleSort() {
        const n = this.array.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (!this.isSorting) return;
                
                // Visualize comparison
                this.array[j].color = this.colors.comparing;
                this.array[j + 1].color = this.colors.comparing;
                this.comparisons++;
                this.updateStats();
                this.draw();
                await this.sleep();
                
                if (this.array[j].value > this.array[j + 1].value) {
                    // Visualize swap
                    this.array[j].color = this.colors.swapping;
                    this.array[j + 1].color = this.colors.swapping;
                    this.draw();
                    await this.sleep();
                    
                    // Swap
                    [this.array[j], this.array[j + 1]] = [this.array[j + 1], this.array[j]];
                    this.swaps++;
                    this.updateStats();
                    
                    this.draw();
                    await this.sleep();
                }
                
                // Reset colors
                this.array[j].color = j < n - i - 1 ? this.colors.default : this.colors.sorted;
                this.array[j + 1].color = this.colors.default;
            }
            this.array[n - i - 1].color = this.colors.sorted;
        }
        this.array[0].color = this.colors.sorted;
    }
    
    // Selection Sort Implementation
    async selectionSort() {
        const n = this.array.length;
        for (let i = 0; i < n - 1; i++) {
            if (!this.isSorting) return;
            
            let minIdx = i;
            this.array[minIdx].color = this.colors.comparing;
            
            for (let j = i + 1; j < n; j++) {
                if (!this.isSorting) return;
                
                this.array[j].color = this.colors.comparing;
                this.comparisons++;
                this.updateStats();
                this.draw();
                await this.sleep();
                
                if (this.array[j].value < this.array[minIdx].value) {
                    this.array[minIdx].color = this.colors.default;
                    minIdx = j;
                    this.array[minIdx].color = this.colors.comparing;
                } else {
                    this.array[j].color = this.colors.default;
                }
            }
            
            if (minIdx !== i) {
                // Visualize swap
                this.array[i].color = this.colors.swapping;
                this.array[minIdx].color = this.colors.swapping;
                this.draw();
                await this.sleep();
                
                // Swap
                [this.array[i], this.array[minIdx]] = [this.array[minIdx], this.array[i]];
                this.swaps++;
                this.updateStats();
            }
            
            this.array[i].color = this.colors.sorted;
            this.array[minIdx].color = this.colors.default;
            this.draw();
            await this.sleep();
        }
        this.array[n - 1].color = this.colors.sorted;
    }
    
    // Insertion Sort Implementation
    async insertionSort() {
        const n = this.array.length;
        this.array[0].color = this.colors.sorted;
        
        for (let i = 1; i < n; i++) {
            if (!this.isSorting) return;
            
            let key = this.array[i];
            key.color = this.colors.comparing;
            let j = i - 1;
            
            this.draw();
            await this.sleep();
            
            while (j >= 0 && this.array[j].value > key.value) {
                if (!this.isSorting) return;
                
                this.comparisons++;
                this.array[j].color = this.colors.swapping;
                this.array[j + 1] = this.array[j];
                
                this.updateStats();
                this.draw();
                await this.sleep();
                
                this.array[j].color = j === 0 ? this.colors.sorted : this.colors.default;
                j--;
            }
            
            this.array[j + 1] = key;
            key.color = this.colors.sorted;
            
            for (let k = 0; k <= i; k++) {
                this.array[k].color = this.colors.sorted;
            }
            
            this.draw();
            await this.sleep();
        }
    }
    
    // Merge Sort Implementation
    async mergeSort() {
        await this.mergeSortHelper(0, this.array.length - 1);
    }
    
    async mergeSortHelper(left, right) {
        if (left >= right || !this.isSorting) return;
        
        const mid = Math.floor((left + right) / 2);
        
        await this.mergeSortHelper(left, mid);
        if (!this.isSorting) return;
        
        await this.mergeSortHelper(mid + 1, right);
        if (!this.isSorting) return;
        
        await this.merge(left, mid, right);
    }
    
    async merge(left, mid, right) {
        const leftArray = this.array.slice(left, mid + 1);
        const rightArray = this.array.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArray.length && j < rightArray.length) {
            if (!this.isSorting) return;
            
            this.comparisons++;
            this.updateStats();
            
            // Visualize comparison
            this.array[k] = { value: 0, color: this.colors.comparing };
            this.draw();
            await this.sleep();
            
            if (leftArray[i].value <= rightArray[j].value) {
                this.array[k] = leftArray[i];
                i++;
            } else {
                this.array[k] = rightArray[j];
                j++;
                this.swaps += (leftArray.length - i);
            }
            
            this.array[k].color = this.colors.swapping;
            this.draw();
            await this.sleep();
            
            this.array[k].color = this.colors.default;
            k++;
        }
        
        while (i < leftArray.length) {
            if (!this.isSorting) return;
            
            this.array[k] = leftArray[i];
            this.array[k].color = this.colors.swapping;
            i++;
            k++;
            
            this.draw();
            await this.sleep();
        }
        
        while (j < rightArray.length) {
            if (!this.isSorting) return;
            
            this.array[k] = rightArray[j];
            this.array[k].color = this.colors.swapping;
            j++;
            k++;
            
            this.draw();
            await this.sleep();
        }
        
        // Mark sorted section
        for (let idx = left; idx <= right; idx++) {
            this.array[idx].color = this.colors.sorted;
        }
        this.draw();
        await this.sleep();
    }
    
    // Quick Sort Implementation
    async quickSort() {
        await this.quickSortHelper(0, this.array.length - 1);
    }
    
    async quickSortHelper(low, high) {
        if (low < high && this.isSorting) {
            const pi = await this.partition(low, high);
            
            await this.quickSortHelper(low, pi - 1);
            if (!this.isSorting) return;
            
            await this.quickSortHelper(pi + 1, high);
        }
        
        if (low >= 0 && high >= 0 && low < this.array.length && high < this.array.length) {
            for (let i = low; i <= high; i++) {
                this.array[i].color = this.colors.sorted;
            }
            this.draw();
            await this.sleep();
        }
    }
    
    async partition(low, high) {
        const pivot = this.array[high];
        pivot.color = this.colors.pivot;
        this.draw();
        await this.sleep();
        
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
            if (!this.isSorting) return i + 1;
            
            this.array[j].color = this.colors.comparing;
            this.draw();
            await this.sleep();
            
            this.comparisons++;
            this.updateStats();
            
            if (this.array[j].value < pivot.value) {
                i++;
                
                if (i !== j) {
                    this.array[i].color = this.colors.swapping;
                    this.array[j].color = this.colors.swapping;
                    this.draw();
                    await this.sleep();
                    
                    [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
                    this.swaps++;
                    this.updateStats();
                    
                    this.draw();
                    await this.sleep();
                }
            }
            
            this.array[j].color = this.colors.default;
            if (i >= 0) this.array[i].color = this.colors.default;
        }
        
        if (i + 1 !== high && this.isSorting) {
            this.array[i + 1].color = this.colors.swapping;
            pivot.color = this.colors.swapping;
            this.draw();
            await this.sleep();
            
            [this.array[i + 1], this.array[high]] = [this.array[high], this.array[i + 1]];
            this.swaps++;
            this.updateStats();
        }
        
        pivot.color = this.colors.sorted;
        this.draw();
        await this.sleep();
        
        return i + 1;
    }
    
    // Heap Sort Implementation
    async heapSort() {
        const n = this.array.length;
        
        // Build max heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            if (!this.isSorting) return;
            await this.heapify(n, i);
        }
        
        // Extract elements from heap
        for (let i = n - 1; i > 0; i--) {
            if (!this.isSorting) return;
            
            // Move current root to end
            this.array[0].color = this.colors.swapping;
            this.array[i].color = this.colors.swapping;
            this.draw();
            await this.sleep();
            
            [this.array[0], this.array[i]] = [this.array[i], this.array[0]];
            this.swaps++;
            this.updateStats();
            
            this.array[i].color = this.colors.sorted;
            this.draw();
            await this.sleep();
            
            await this.heapify(i, 0);
        }
        
        this.array[0].color = this.colors.sorted;
    }
    
    async heapify(n, i) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        
        // Visualize comparison
        if (left < n) {
            this.array[largest].color = this.colors.comparing;
            this.array[left].color = this.colors.comparing;
            this.comparisons++;
            this.updateStats();
            this.draw();
            await this.sleep();
            
            if (this.array[left].value > this.array[largest].value) {
                this.array[largest].color = this.colors.default;
                largest = left;
                this.array[largest].color = this.colors.comparing;
            } else {
                this.array[left].color = this.colors.default;
                this.array[largest].color = this.colors.default;
            }
        }
        
        if (right < n) {
            this.array[largest].color = this.colors.comparing;
            this.array[right].color = this.colors.comparing;
            this.comparisons++;
            this.updateStats();
            this.draw();
            await this.sleep();
            
            if (this.array[right].value > this.array[largest].value) {
                this.array[largest].color = this.colors.default;
                largest = right;
                this.array[largest].color = this.colors.comparing;
            } else {
                this.array[right].color = this.colors.default;
                this.array[largest].color = this.colors.default;
            }
        }
        
        if (largest !== i) {
            // Visualize swap
            this.array[i].color = this.colors.swapping;
            this.array[largest].color = this.colors.swapping;
            this.draw();
            await this.sleep();
            
            [this.array[i], this.array[largest]] = [this.array[largest], this.array[i]];
            this.swaps++;
            this.updateStats();
            
            this.draw();
            await this.sleep();
            
            await this.heapify(n, largest);
        }
        
        this.array[i].color = this.colors.default;
        if (largest < n) this.array[largest].color = this.colors.default;
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate bar dimensions
        const barWidth = (this.canvas.width - 40) / this.array.length;
        const maxHeight = Math.max(...this.array.map(item => item.value));
        const scaleFactor = (this.canvas.height - 40) / maxHeight;
        
        // Draw bars
        for (let i = 0; i < this.array.length; i++) {
            const item = this.array[i];
            const barHeight = item.value * scaleFactor;
            const x = 20 + i * barWidth;
            const y = this.canvas.height - barHeight - 20;
            
            // Draw bar
            this.ctx.fillStyle = item.color;
            this.ctx.fillRect(x, y, barWidth - 2, barHeight);
            
            // Draw bar border
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y, barWidth - 2, barHeight);
            
            // Draw value on bar (only if bar is tall enough)
            if (barHeight > 20) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(item.value.toString(), x + (barWidth - 2) / 2, y + 15);
            }
        }
        
        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let i = 0; i <= 10; i++) {
            const y = 20 + (this.canvas.height - 40) * (i / 10);
            this.ctx.beginPath();
            this.ctx.moveTo(20, y);
            this.ctx.lineTo(this.canvas.width - 20, y);
            this.ctx.stroke();
        }
        
        // Vertical grid lines
        for (let i = 0; i <= 10; i++) {
            const x = 20 + (this.canvas.width - 40) * (i / 10);
            this.ctx.beginPath();
            this.ctx.moveTo(x, 20);
            this.ctx.lineTo(x, this.canvas.height - 20);
            this.ctx.stroke();
        }
    }
}

// Initialize the visualizer when page loads
window.addEventListener('DOMContentLoaded', () => {
    const visualizer = new SortingVisualizer();
});