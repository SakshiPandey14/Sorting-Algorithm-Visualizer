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
            comparing: "#ffeb3b",
            swapping: "#f44336",
            sorted: "#4caf50"
        };

        this.resizeCanvas();
        this.generateArray();
        this.addEvents();
        this.draw();
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = 400;
    }

    generateArray() {
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

    resetStats() {
        this.comparisons = 0;
        this.swaps = 0;
        this.startTime = 0;
        this.updateStats();
    }

    updateStats() {
        document.getElementById("comparisons").textContent = this.comparisons;
        document.getElementById("swaps").textContent = this.swaps;
        if (this.startTime) {
            document.getElementById("time").textContent =
                Date.now() - this.startTime + " ms";
        }
    }

    addEvents() {
        document.getElementById("arraySize").addEventListener("input", e => {
            this.arraySize = +e.target.value;
            document.getElementById("sizeValue").textContent = this.arraySize;
            this.generateArray();
        });

        document.getElementById("speed").addEventListener("input", e => {
            this.speed = +e.target.value;
        });

        document.getElementById("generateArray").onclick = () => {
            this.stop();
            this.generateArray();
        };

        document.getElementById("startSort").onclick = () => {
            if (!this.isSorting) this.startSort();
        };

        document.getElementById("pauseSort").onclick = () => {
            this.isPaused = !this.isPaused;
        };

        document.getElementById("reset").onclick = () => {
            this.stop();
            this.generateArray();
        };

        document.getElementById("useCustomArray").onclick = () => {
            this.useCustomArray();
        };
    }

    useCustomArray() {
        const input = document.getElementById("customArray").value;
        const nums = input.split(",").map(n => parseInt(n.trim()));
        if (nums.length < 5 || nums.some(isNaN)) {
            alert("Enter valid comma separated numbers (min 5)");
            return;
        }

        this.stop();
        this.array = nums.map(v => ({
            value: v,
            color: this.colors.default
        }));
        this.arraySize = nums.length;
        this.draw();
    }

    async sleep() {
        while (this.isPaused) {
            await new Promise(r => setTimeout(r, 100));
        }
        return new Promise(r =>
            setTimeout(r, Math.max(5, 110 - this.speed))
        );
    }

    async startSort() {
        this.isSorting = true;
        this.startTime = Date.now();
        this.resetStats();

        const algo = document.getElementById("algorithm").value;
        if (algo === "bubble") await this.bubbleSort();
        if (algo === "selection") await this.selectionSort();
        if (algo === "insertion") await this.insertionSort();

        this.array.forEach(el => (el.color = this.colors.sorted));
        this.draw();
        this.isSorting = false;
    }

    stop() {
        this.isSorting = false;
        this.isPaused = false;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const barWidth = this.canvas.width / this.array.length;
        const maxVal = Math.max(...this.array.map(e => e.value));

        this.array.forEach((el, i) => {
            const height = (el.value / maxVal) * (this.canvas.height - 20);
            this.ctx.fillStyle = el.color;
            this.ctx.fillRect(
                i * barWidth,
                this.canvas.height - height,
                barWidth - 2,
                height
            );
        });
    }

    async bubbleSort() {
        for (let i = 0; i < this.array.length; i++) {
            for (let j = 0; j < this.array.length - i - 1; j++) {
                if (!this.isSorting) return;

                this.array[j].color = this.array[j + 1].color = this.colors.comparing;
                this.comparisons++;
                this.draw();
                await this.sleep();

                if (this.array[j].value > this.array[j + 1].value) {
                    [this.array[j], this.array[j + 1]] =
                        [this.array[j + 1], this.array[j]];
                    this.swaps++;
                }

                this.array[j].color = this.array[j + 1].color = this.colors.default;
                this.updateStats();
            }
            this.array[this.array.length - i - 1].color = this.colors.sorted;
        }
    }

    async selectionSort() {
        for (let i = 0; i < this.array.length; i++) {
            let min = i;
            for (let j = i + 1; j < this.array.length; j++) {
                if (!this.isSorting) return;

                this.array[j].color = this.colors.comparing;
                this.comparisons++;
                this.draw();
                await this.sleep();

                if (this.array[j].value < this.array[min].value) min = j;
                this.array[j].color = this.colors.default;
            }

            [this.array[i], this.array[min]] =
                [this.array[min], this.array[i]];
            this.swaps++;
            this.array[i].color = this.colors.sorted;
            this.updateStats();
            this.draw();
        }
    }

    async insertionSort() {
        for (let i = 1; i < this.array.length; i++) {
            let key = this.array[i];
            let j = i - 1;

            while (j >= 0 && this.array[j].value > key.value) {
                if (!this.isSorting) return;

                this.array[j + 1] = this.array[j];
                j--;
                this.comparisons++;
                this.swaps++;
                this.draw();
                await this.sleep();
            }
            this.array[j + 1] = key;
            this.updateStats();
        }
    }
}

window.onload = () => new SortingVisualizer();
