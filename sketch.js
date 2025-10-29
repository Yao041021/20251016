// =================================================================
// 步驟一：模擬成績數據接收
// -----------------------------------------------------------------

// 確保這是全域變數
let finalScore = 0; 
let maxScore = 0;
let scoreText = ""; // 用於 p5.js 繪圖的文字
let thumbUpParticles = []; 

// 【新增】Canvas 元素的參考，用於控制其 CSS 屬性 (display: none/block)
let myCanvas; 

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
        // 【重要】控制 Canvas 顯示：一旦收到成績，就顯示 Canvas
        // ----------------------------------------
        if (myCanvas) {
            myCanvas.style('display', 'block'); // 顯示 p5.js 畫面
        }

        // ----------------------------------------
        // 關鍵步驟 2: 呼叫重新繪製 
        // ----------------------------------------
        if (typeof redraw === 'function') {
            redraw(); 
        }
    }
}, false);


// =================================================================
// 步驟三：建立 👍 粒子的類別 (Class)
// -----------------------------------------------------------------

class ThumbUpParticle {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(random(-1, 1), random(2, 5)); 
        this.lifespan = 255; 
        this.size = random(30, 50); 
    }

    update() {
        this.pos.add(this.vel);
        this.lifespan -= 4; 
    }

    display() {
        fill(0, 0, 0, this.lifespan); 
        textSize(this.size);
        textAlign(CENTER, CENTER);
        text("👍", this.pos.x, this.pos.y);
    }

    isDead() {
        return this.lifespan < 0;
    }
}


// =================================================================
// 步驟二：使用 p5.js 繪製分數 (在網頁 Canvas 上顯示)
// -----------------------------------------------------------------

function setup() { 
    // 【修改 1】設定 Canvas 尺寸為整個視窗大小 (或 H5P 容器大小)
    // 這樣才能覆蓋 H5P 內容。建議使用 windowWidth/Height 
    // 或獲取 H5P 容器的尺寸。
    myCanvas = createCanvas(windowWidth, windowHeight); 
    
    // 【修改 2】將 Canvas 放置在指定的父元素，如果需要的話 (此處假設放在 body)
    // myCanvas.parent('h5p-content-container-id'); // 如果 H5P 內容有 ID
    
    // 【修改 3】設定 Canvas 樣式以覆蓋 H5P 內容
    myCanvas.style('position', 'absolute');
    myCanvas.style('top', '0');
    myCanvas.style('left', '0');
    myCanvas.style('z-index', '9999'); // 確保在最頂層
    myCanvas.style('pointer-events', 'none'); // 允許滑鼠點擊穿透

    // 【修改 4】預設隱藏 Canvas，直到收到成績事件
    myCanvas.style('display', 'none'); 

    background(255); 
    // 註解掉 noLoop() 讓 draw 函式持續執行，以支援粒子效果
    // noLoop(); 
} 

function draw() { 
    // 只有在 Canvas 顯示時才執行繪圖邏輯，這可以進一步優化性能
    if (myCanvas && myCanvas.style('display') === 'none') {
        return;
    }
    
    background(255); // 清除背景

    // 計算百分比
    let percentage = (finalScore / maxScore) * 100;

    textSize(80); 
    textAlign(CENTER);
    
    // A. 根據分數區間改變文本顏色和內容 (畫面反映一)
    if (percentage >= 90) {
        // 滿分或高分：顯示鼓勵文本
        fill(0, 200, 50); 
        text("恭喜！優異成績！", width / 2, height / 2 - 50);
        
        // 當分數高於 90% 時，不斷產生 👍 粒子
        if (frameCount % 10 === 0) { 
            let startX = random(width); 
            thumbUpParticles.push(new ThumbUpParticle(startX, 0));
        }
        
    } else if (percentage >= 60) {
        // 中等分數：顯示一般文本
        fill(255, 181, 35); 
        text("成績良好，請再接再厲。", width / 2, height / 2 - 50);
        
    } else if (percentage > 0) {
        // 低分：顯示警示文本
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
    
    
    // B. 幾何圖形反映
    if (percentage >= 90) {
        fill(0, 200, 50, 150); 
        noStroke();
        circle(width / 2, height / 2 + 150, 150);
        
    } else if (percentage >= 60) {
        fill(255, 181, 35, 150);
        rectMode(CENTER);
        rect(width / 2, height / 2 + 150, 150, 150);
    }
    
    // C. 處理 👍 粒子系統
    for (let i = thumbUpParticles.length - 1; i >= 0; i--) {
        let p = thumbUpParticles[i];
        p.update();
        p.display();

        if (p.isDead()) {
            thumbUpParticles.splice(i, 1);
        }
    }
}
