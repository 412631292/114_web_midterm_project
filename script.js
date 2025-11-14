// 1. 取得所有需要的 DOM 元素
const builderForm = document.querySelector('#builderForm');
const optionItems = document.querySelectorAll('.option-item');
const currentTotalEl = document.querySelector('#current-total');
const buttonPriceEl = document.querySelector('#button-price'); // 按鈕上的價格
const finalPriceInput = document.querySelector('#finalPrice');
const pizzaVisualContainer = document.querySelector('#pizza-visual-container');
const toppingCheckboxes = document.querySelectorAll('.topping-checkbox');
const orderForm = document.querySelector('#orderForm');
const toppingValidationEl = document.querySelector('#topping-validation-message');
const successModal = new bootstrap.Modal(document.getElementById('successModal'));
const modalFinalPriceEl = document.querySelector('#modal-final-price');

// 預設價格 (根據 HTML 中選中的 Large 尺寸)
let currentPrice = 350; 

// --- 核心功能 1：即時價格計算 ---

function updatePizzaPrice() {
    let newPrice = 0;
    let sizeSelected = false; // 檢查尺寸是否被選中

    // 遍歷所有選項
    optionItems.forEach(item => {
        if (item.checked) {
            const itemPrice = parseInt(item.getAttribute('data-price'));
            newPrice += itemPrice;
            
            // 檢查是否為尺寸選項
            if (item.name === 'size') {
                sizeSelected = true;
            }
        }
    });

    // 如果沒有尺寸被選中，價格設為 0 (理論上 HTML 的 required 會阻止，但程式邏輯上需考慮)
    if (!sizeSelected) {
        newPrice = 0;
    }
    
    currentPrice = newPrice;
    
    // 更新 DOM 顯示
    currentTotalEl.textContent = currentPrice;
    buttonPriceEl.textContent = currentPrice;
    finalPriceInput.value = currentPrice;
}


// --- 核心功能 2：動態新增/移除配料視覺圖示 (DOM操作) ---

function updatePizzaVisual(checkbox) {
    const toppingName = checkbox.value; // 例如: 'Pepperoni'
    const toppingId = `icon-${toppingName}`;
    const toppingImg = checkbox.dataset.img; // 從 data-img 取得圖片識別名稱

    if (checkbox.checked) {
        // [DOM 操作：createElement & appendChild]
        const toppingEl = document.createElement('div');
        toppingEl.classList.add('topping-icon');
        toppingEl.id = toppingId;
        // 將 data-img 屬性設定到創建的元素上，以便 CSS 根據這個屬性來套用樣式
        toppingEl.setAttribute('data-img', toppingImg);
        
        pizzaVisualContainer.appendChild(toppingEl);
    } else {
        // [DOM 操作：移除]
        const toppingEl = document.querySelector(`#${toppingId}`);
        if (toppingEl) {
            toppingEl.remove();
        }
    }
}

// 監聽所有選項的變動 (尺寸和配料)
optionItems.forEach(item => {
    item.addEventListener('change', (event) => {
        updatePizzaPrice(); // 價格更新
        
        // 如果是配料的 checkbox 變動，則更新視覺圖示
        if (event.target.classList.contains('topping-checkbox')) {
             updatePizzaVisual(event.target);
        }
    });
});

// --- 核心功能 3：表單驗證 (HTML5 Constraint API + 自訂驗證) ---

orderForm.addEventListener('submit', function(event) {
    let isToppingValid = true;

    // 1. 自訂驗證：檢查至少選擇三種配料
    const selectedToppings = document.querySelectorAll('.topping-checkbox:checked').length;
    
    if (selectedToppings < 3) {
        event.preventDefault(); // 阻止表單提交
        event.stopPropagation();
        toppingValidationEl.style.display = 'block'; // 顯示自訂錯誤提示
        isToppingValid = false;
    } else {
        toppingValidationEl.style.display = 'none'; // 隱藏錯誤提示
    }

    // 2. 檢查 HTML5 Constraint Validation API 驗證 (姓名、Email、電話)
    if (!orderForm.checkValidity() || !isToppingValid) {
        event.preventDefault(); // 確保被阻止
        event.stopPropagation();
    } else {
        // 3. 所有驗證通過，處理成功邏輯
        event.preventDefault(); // 阻止表單實際提交
        
        // 更新 Modal 內容並顯示
        modalFinalPriceEl.textContent = currentPrice;
        successModal.show();
        
        // [加分項目：清空表單，準備下一個訂單]
        orderForm.reset();
        builderForm.reset();
        
        // 視覺和價格重設
        document.querySelectorAll('.topping-icon').forEach(icon => icon.remove());
        updatePizzaPrice(); // 重設為預設價格 (350)
    }

    // 顯示 Bootstrap 驗證樣式 (紅/綠邊框)
    orderForm.classList.add('was-validated');
}, false);

// 頁面載入時先執行一次初始化
document.addEventListener('DOMContentLoaded', () => {
    // 確保一開始就有圖形和價格
    updatePizzaPrice();
    // 由於 HTML 預設 sizeL 是 checked，我們需要手動呼叫一次視覺更新 (若有初始配料)
    // 這裡我們假設初始沒有配料，所以只更新價格即可
});