// =================================================================
// 步驟一：模擬成績數據接收
// -----------------------------------------------------------------

// 確保這是全域變數
let finalScore = 0; 
let maxScore = 0;
let scoreText = ""; // 用於 p5.js 繪圖的文字

// 【新增】用於儲存所有的👍粒子
let thumbUpParticles = []; 

window.addEventListener('message', function (event) {
    // 執行來源驗證...
    // ...
    const data = event.data;
    
    if (data && data.type === 'H5P_SCORE_RESULT') {
        
        // !!! 關鍵步驟：更新全域變數 !!!
        finalScore = data.score; // 更新全域變數
        maxScore = data.maxScore;
        scoreText = `最終成績分數: ${finalScore}/${maxScore}`;
        
        console.log("新的分數已接收:", scoreText); 
        
        // ----------------------------------------
        // 關鍵步驟 2: 呼叫重新繪製 (見方案二)
        // ----------------------------------------
        if (typeof redraw === 'function') {
            redraw(); 
        }
    }
}, false);


// =================================================================
// 【新增】步驟三：建立 👍 粒子的類別 (Class)
// -----------------------------------------------------------------

class ThumbUpParticle {
    constructor(x, y) {
        this.pos = createVector(x, y);
        // 設定一個向下的隨機速度
        this.vel = createVector(random(-1, 1), random(2, 5)); 
        this.lifespan = 255; // 粒子的生命週期，用於淡出效果
        this.size = random(30, 50); // 隨機尺寸
    }

    // 更新粒子的位置
    update() {
        this.pos.add(this.vel);
        // 降低生命週期，讓粒子逐漸消失
        this.lifespan -= 4; 
    }

    // 繪製粒子
    display() {
        // 設定繪製文字的顏色，alpha (透明度) 使用 lifespan
        fill(0, 0, 0, this.lifespan); 
        textSize(this.size);
        textAlign(CENTER, CENTER);
        // 使用 p5.js 的 text() 函數繪製 Emoji
        text("👍", this.pos.x, this.pos.y);
    }

    // 檢查粒子是否「死亡」（生命週期結束）
    isDead() {
        return this.lifespan < 0;
    }
}


// =================================================================
// 步驟二：使用 p5.js 繪製分數 (在網頁 Canvas 上顯示)
// -----------------------------------------------------------------

function setup() { 
    createCanvas(windowWidth / 2, windowHeight / 2); 
    background(255); 
    // 必須移除 noLoop()，粒子需要持續更新位置 (呼叫 draw())
    // 註解掉 noLoop(); 讓 draw 函式持續執行
    // noLoop(); 
} 

// score_display.js 中的 draw() 函數片段

function draw() { 
    background(255); // 清除背景

    // 計算百分比
    let percentage = (finalScore / maxScore) * 100;

    textSize(80); 
    textAlign(CENTER);
    
    // -----------------------------------------------------------------
    // A. 根據分數區間改變文本顏色和內容 (畫面反映一)
    // -----------------------------------------------------------------
    if (percentage >= 90) {
        // 滿分或高分：顯示鼓勵文本，使用鮮豔顏色
        fill(0, 200, 50); // 綠色 
        text("恭喜！優異成績！", width / 2, height / 2 - 50);
        
        // 【新增】當分數高於 90% 時，不斷產生 👍 粒子
        if (frameCount % 10 === 0) { // 每隔 10 幀產生一個
            // 從畫面上方隨機位置產生粒子
            let startX = random(width); 
            thumbUpParticles.push(new ThumbUpParticle(startX, 0));
        }
        
    } else if (percentage >= 60) {
        // 中等分數：顯示一般文本，使用黃色 
        fill(255, 181, 35); 
        text("成績良好，請再接再厲。", width / 2, height / 2 - 50);
        
    } else if (percentage > 0) {
        // 低分：顯示警示文本，使用紅色 
        fill(200, 0, 0); 
        text("需要加強努力！", width / 2, height / 2 - 50);
        
    } else {
        // 尚未收到分數或分數為 0
        fill(150);
        text(scoreText, width / 2, height / 2);
    }

    // 顯示具體分數
    textSize(50);
    fill(50);
    text(`得分: ${finalScore}/${maxScore}`, width / 2, height / 2 + 50);
    
    
    // -----------------------------------------------------------------
    // B. 根據分數觸發不同的幾何圖形反映 (畫面反映二)
    // -----------------------------------------------------------------
    
    if (percentage >= 90) {
        // 畫一個大圓圈代表完美 
        fill(0, 200, 50, 150); // 帶透明度
        noStroke();
        circle(width / 2, height / 2 + 150, 150);
        
    } else if (percentage >= 60) {
        // 畫一個方形 
        fill(255, 181, 35, 150);
        rectMode(CENTER);
        rect(width / 2, height / 2 + 150, 150, 150);
    }
    
    // -----------------------------------------------------------------
    // 【新增】C. 處理 👍 粒子系統
    // -----------------------------------------------------------------
    // 從陣列的**尾端**向前迭代，以便安全地移除元素
    for (let i = thumbUpParticles.length - 1; i >= 0; i--) {
        let p = thumbUpParticles[i];
        p.update();
        p.display();

        // 檢查粒子是否死亡，如果是，則從陣列中移除
        if (p.isDead()) {
            thumbUpParticles.splice(i, 1);
        }
    }
}
