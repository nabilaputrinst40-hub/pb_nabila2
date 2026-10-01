/* ==============================
   NOVACALC MODERN CALCULATOR
   JAVASCRIPT
================================ */


/* ==============================
   ELEMENTS
================================ */

const currentDisplay =
    document.getElementById("currentOperation");

const previousDisplay =
    document.getElementById("previousOperation");

const historyList =
    document.getElementById("historyList");

const clearHistoryButton =
    document.getElementById("clearHistory");

const themeButton =
    document.getElementById("themeButton");

const memoryIndicator =
    document.getElementById("memoryIndicator");


/* ==============================
   VARIABLES
================================ */

let currentInput = "0";

let previousInput = "";

let operator = null;

let shouldResetDisplay = false;

let memory = 0;

let history =
    JSON.parse(localStorage.getItem("novaCalcHistory")) || [];


/* ==============================
   DISPLAY
================================ */

function updateDisplay() {

    currentDisplay.textContent = formatNumber(currentInput);

    if (previousInput && operator) {

        previousDisplay.textContent =
            formatNumber(previousInput) +
            " " +
            getOperatorSymbol(operator);

    } else {

        previousDisplay.innerHTML = "&nbsp;";
    }
}


/* ==============================
   FORMAT NUMBER
================================ */

function formatNumber(value) {

    if (value === "Error") {
        return "Error";
    }

    if (value === "") {
        return "0";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "Error";
    }

    if (Math.abs(number) >= 1000000000000) {

        return number.toExponential(6);
    }

    if (
        Math.abs(number) >= 1000000 ||
        (Math.abs(number) > 0 && Math.abs(number) < 0.000001)
    ) {

        return number.toExponential(6);
    }

    return number.toLocaleString("en-US", {
        maximumFractionDigits: 10
    });
}


/* ==============================
   OPERATOR SYMBOL
================================ */

function getOperatorSymbol(op) {

    const symbols = {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷"
    };

    return symbols[op] || op;
}


/* ==============================
   ADD NUMBER
================================ */

function addNumber(number) {

    if (currentInput === "Error") {
        clearCalculator();
    }

    if (shouldResetDisplay) {

        currentInput = number;

        shouldResetDisplay = false;

    } else if (currentInput === "0") {

        currentInput = number;

    } else {

        currentInput += number;
    }

    updateDisplay();
}


/* ==============================
   DECIMAL
================================ */

function addDecimal() {

    if (currentInput === "Error") {
        clearCalculator();
    }

    if (shouldResetDisplay) {

        currentInput = "0.";
        shouldResetDisplay = false;

        updateDisplay();

        return;
    }

    if (!currentInput.includes(".")) {

        currentInput += ".";
    }

    updateDisplay();
}


/* ==============================
   OPERATOR
================================ */

function chooseOperator(nextOperator) {

    if (currentInput === "Error") {
        return;
    }

    if (operator && !shouldResetDisplay) {

        calculate(false);
    }

    previousInput = currentInput;

    operator = nextOperator;

    shouldResetDisplay = true;

    updateDisplay();
}


/* ==============================
   CALCULATE
================================ */

function calculate(addToHistory = true) {

    if (!operator || previousInput === "") {
        return;
    }

    const firstNumber =
        Number(previousInput);

    const secondNumber =
        Number(currentInput);

    let result;


    switch (operator) {

        case "+":
            result = firstNumber + secondNumber;
            break;

        case "-":
            result = firstNumber - secondNumber;
            break;

        case "*":
            result = firstNumber * secondNumber;
            break;

        case "/":

            if (secondNumber === 0) {

                showError();

                return;
            }

            result = firstNumber / secondNumber;

            break;

        default:
            return;
    }


    result = cleanNumber(result);


    if (addToHistory) {

        addHistory(
            `${formatNumber(previousInput)} ${getOperatorSymbol(operator)} ${formatNumber(currentInput)}`,
            result
        );
    }


    currentInput = String(result);

    previousInput = "";

    operator = null;

    shouldResetDisplay = true;

    updateDisplay();
}


/* ==============================
   CLEAN NUMBER
================================ */

function cleanNumber(number) {

    if (!Number.isFinite(number)) {
        return NaN;
    }

    return parseFloat(number.toPrecision(12));
}


/* ==============================
   ERROR
================================ */

function showError() {

    currentInput = "Error";

    previousInput = "";

    operator = null;

    shouldResetDisplay = true;

    updateDisplay();
}


/* ==============================
   CLEAR
================================ */

function clearCalculator() {

    currentInput = "0";

    previousInput = "";

    operator = null;

    shouldResetDisplay = false;

    updateDisplay();
}


/* ==============================
   DELETE
================================ */

function deleteNumber() {

    if (shouldResetDisplay) {
        return;
    }

    if (
        currentInput.length <= 1 ||
        currentInput === "Error"
    ) {

        currentInput = "0";

    } else {

        currentInput =
            currentInput.slice(0, -1);
    }

    updateDisplay();
}


/* ==============================
   PERCENT
================================ */

function percentage() {

    if (currentInput === "Error") {
        return;
    }

    const value =
        Number(currentInput) / 100;

    currentInput =
        String(cleanNumber(value));

    updateDisplay();
}


/* ==============================
   NEGATIVE
================================ */

function toggleNegative() {

    if (
        currentInput === "0" ||
        currentInput === "Error"
    ) {
        return;
    }

    currentInput =
        String(Number(currentInput) * -1);

    updateDisplay();
}


/* ==============================
   QUICK TOOLS
================================ */

function quickTool(tool) {

    const value =
        Number(currentInput);

    if (!Number.isFinite(value)) {
        return;
    }


    let result;


    switch (tool) {

        case "square":

            result = value * value;

            addHistory(
                `${formatNumber(value)}²`,
                result
            );

            break;


        case "sqrt":

            if (value < 0) {

                showError();

                return;
            }

            result = Math.sqrt(value);

            addHistory(
                `√${formatNumber(value)}`,
                result
            );

            break;


        case "inverse":

            if (value === 0) {

                showError();

                return;
            }

            result = 1 / value;

            addHistory(
                `1 ÷ ${formatNumber(value)}`,
                result
            );

            break;


        case "negative":

            toggleNegative();

            return;


        default:
            return;
    }


    result = cleanNumber(result);

    currentInput = String(result);

    shouldResetDisplay = true;

    updateDisplay();
}


/* ==============================
   MEMORY
================================ */

function updateMemoryIndicator() {

    memoryIndicator.textContent =
        "Memory: " + formatNumber(String(memory));
}


/* MEMORY CLEAR */
document
    .getElementById("memoryClear")
    .addEventListener("click", function () {

        memory = 0;

        updateMemoryIndicator();
    });


/* MEMORY RECALL */
document
    .getElementById("memoryRecall")
    .addEventListener("click", function () {

        currentInput = String(memory);

        shouldResetDisplay = true;

        updateDisplay();
    });


/* MEMORY ADD */
document
    .getElementById("memoryAdd")
    .addEventListener("click", function () {

        const value =
            Number(currentInput);

        if (Number.isFinite(value)) {

            memory += value;

            updateMemoryIndicator();
        }
    });


/* MEMORY SUBTRACT */
document
    .getElementById("memorySubtract")
    .addEventListener("click", function () {

        const value =
            Number(currentInput);

        if (Number.isFinite(value)) {

            memory -= value;

            updateMemoryIndicator();
        }
    });


/* ==============================
   HISTORY
================================ */

function addHistory(expression, result) {

    const historyItem = {

        expression: expression,

        result: cleanNumber(Number(result))
    };


    history.unshift(historyItem);


    if (history.length > 20) {

        history.pop();
    }


    localStorage.setItem(
        "novaCalcHistory",
        JSON.stringify(history)
    );


    renderHistory();
}


/* ==============================
   RENDER HISTORY
================================ */

function renderHistory() {

    historyList.innerHTML = "";


    if (history.length === 0) {

        historyList.innerHTML = `
            <div class="empty-history">
                Belum ada riwayat
            </div>
        `;

        return;
    }


    history.forEach(function (item) {

        const element =
            document.createElement("div");

        element.className =
            "history-item";


        element.innerHTML = `
            <div class="history-expression">
                ${item.expression}
            </div>

            <div class="history-result">
                = ${formatNumber(String(item.result))}
            </div>
        `;


        element.addEventListener(
            "click",
            function () {

                currentInput =
                    String(item.result);

                previousInput = "";

                operator = null;

                shouldResetDisplay = true;

                updateDisplay();
            }
        );


        historyList.appendChild(element);

    });
}


/* ==============================
   CLEAR HISTORY
================================ */

clearHistoryButton.addEventListener(
    "click",
    function () {

        history = [];

        localStorage.removeItem(
            "novaCalcHistory"
        );

        renderHistory();
    }
);


/* ==============================
   CALCULATOR BUTTONS
================================ */

document
    .querySelectorAll(".buttons button")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const number =
                    button.dataset.number;

                const operation =
                    button.dataset.operation;

                const action =
                    button.dataset.action;


                if (number !== undefined) {

                    addNumber(number);

                    return;
                }


                if (operation) {

                    chooseOperator(operation);

                    return;
                }


                if (action === "decimal") {

                    addDecimal();

                    return;
                }


                if (action === "clear") {

                    clearCalculator();

                    return;
                }


                if (action === "delete") {

                    deleteNumber();

                    return;
                }


                if (action === "percent") {

                    percentage();

                    return;
                }


                if (action === "calculate") {

                    calculate(true);

                }

            }
        );

    });


/* ==============================
   QUICK TOOL BUTTONS
================================ */

document
    .querySelectorAll("[data-tool]")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const tool =
                    button.dataset.tool;

                quickTool(tool);
            }
        );

    });


/* ==============================
   KEYBOARD SUPPORT
================================ */

document.addEventListener(
    "keydown",
    function (event) {

        const key = event.key;


        /* NUMBER */
        if (/^[0-9]$/.test(key)) {

            addNumber(key);

            return;
        }


        /* DECIMAL */
        if (key === ".") {

            addDecimal();

            return;
        }


        /* OPERATORS */
        if (
            key === "+" ||
            key === "-" ||
            key === "*" ||
            key === "/"
        ) {

            chooseOperator(key);

            return;
        }


        /* ENTER */
        if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            calculate(true);

            return;
        }


        /* BACKSPACE */
        if (key === "Backspace") {

            deleteNumber();

            return;
        }


        /* ESCAPE */
        if (key === "Escape") {

            clearCalculator();

            return;
        }


        /* PERCENT */
        if (key === "%") {

            percentage();

            return;
        }

    }
);


/* ==============================
   THEME
================================ */

themeButton.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "light-theme"
        );


        const isLight =
            document.body.classList.contains(
                "light-theme"
            );


        localStorage.setItem(
            "novaCalcTheme",
            isLight ? "light" : "dark"
        );


        themeButton.textContent =
            isLight ? "☾" : "☀";
    }
);


/* ==============================
   LOAD THEME
================================ */

const savedTheme =
    localStorage.getItem("novaCalcTheme");


if (savedTheme === "light") {

    document.body.classList.add(
        "light-theme"
    );

    themeButton.textContent = "☾";

} else {

    themeButton.textContent = "☀";
}


/* ==============================
   START
================================ */

updateDisplay();

updateMemoryIndicator();

renderHistory();