// --- Course Data ---
const courses = [
    {
        id: 1,
        title: "Python 全栈开发大师班",
        desc: "从零基础到独立开发商业级应用。涵盖 Django, Flask, 爬虫与数据分析。",
        price: 2999,
        level: "零基础入门",
        duration: "12 周",
        students: "12,045+ 学员",
        image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        chapters: [
            { title: "Python 基础语法", desc: "变量、循环、函数与面向对象编程" },
            { title: "Web 开发实战", desc: "Django 框架搭建个人博客系统" },
            { title: "自动化与脚本", desc: "办公自动化与网页爬虫实战" }
        ],
        aiKeywords: ["python", "编程", "代码", "后端", "零基础", "爬虫"]
    },
    {
        id: 2,
        title: "AI 深度学习与神经网络",
        desc: "深入理解 Transformer 架构，掌握 PyTorch，亲手训练你的第一个大模型。",
        price: 4599,
        level: "进阶提升",
        duration: "16 周",
        students: "8,920+ 学员",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80",
        chapters: [
            { title: "数学基础", desc: "线性代数与微积分回顾" },
            { title: "神经网络原理", desc: "BP 算法与激活函数详解" },
            { title: "Transformer 架构", desc: "Attention 机制与 BERT 源码解析" }
        ],
        aiKeywords: ["ai", "深度学习", "模型", "神经网络", "gpt", "算法"]
    },
    {
        id: 3,
        title: "UI/UX 设计思维",
        desc: "不仅是画图，更是设计体验。掌握 Figma，学习顶级产品的设计逻辑。",
        price: 1899,
        level: "适合所有人",
        duration: "8 周",
        students: "24,000+ 学员",
        image: "https://images.unsplash.com/photo-1586717791821-3f44a5638d48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        chapters: [
            { title: "设计心理学", desc: "用户行为分析与视觉引导" },
            { title: "Figma 高手之路", desc: "组件系统与自动布局" },
            { title: "实战项目", desc: "重设计常用 App 界面" }
        ],
        aiKeywords: ["ui", "设计", "体验", "figma", "美工", "画图"]
    },
    {
        id: 4,
        title: "React 前端架构师",
        desc: "突破瓶颈，掌握大型前端项目架构能力。Next.js, SSR, 性能优化专题。",
        price: 3299,
        level: "高级进阶",
        duration: "10 周",
        students: "5,600+ 学员",
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
        chapters: [
            { title: "React 原理", desc: "Fiber 架构与 Diff 算法" },
            { title: "Next.js 实战", desc: "服务端渲染与静态生成" },
            { title: "性能优化", desc: "Lighthouse 指标优化实战" }
        ],
        aiKeywords: ["react", "前端", "js", "网页", "架构"]
    },
    {
        id: 5,
        title: "数据可视化魔术",
        desc: "让数据通过图表说话。学习 D3.js 与 ECharts，打造炫酷大屏。",
        price: 2199,
        level: "中级",
        duration: "6 周",
        students: "3,300+ 学员",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        chapters: [
            { title: "图表美学", desc: "配色与排版原则" },
            { title: "ECharts 基础", desc: "常用图表快速开发" },
            { title: "D3.js 进阶", desc: "自定义交互与动画" }
        ],
        aiKeywords: ["数据", "图表", "可视化", "大屏", "分析"]
    },
    {
        id: 6,
        title: "产品经理实战营",
        desc: "从需求挖掘到产品落地。学习如何做一款用户无法拒绝的产品。",
        price: 3699,
        level: "转行必修",
        duration: "12 周",
        students: "10,120+ 学员",
        image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        chapters: [
            { title: "需求分析", desc: "KANO 模型与竞品分析" },
            { title: "原型绘制", desc: "Axure 与墨刀实操" },
            { title: "敏捷管理", desc: "Scrum 流程与 PRD 撰写" }
        ],
        aiKeywords: ["产品", "pm", "经理", "需求", "原型"]
    }
];

// --- State & DOM Elements ---
const app = document.getElementById('app');
const navHome = document.getElementById('nav-home');
const navAbout = document.getElementById('nav-about');
const modal = document.getElementById('purchase-modal');
const modalPrice = document.getElementById('modal-price');
const closeModalBtn = document.querySelector('.close-btn');

const chatWidget = document.getElementById('chat-widget');
const chatFloatBtn = document.getElementById('chat-float-btn');
const chatToggleBtn = document.querySelector('.chat-toggle-btn');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');

let currentView = 'home'; // home | detail

// --- Router Functions ---
function init() {
    renderHome();
    setupEventListeners();
}

function renderHome() {
    currentView = 'home';
    navHome.classList.add('active');
    app.innerHTML = `
        <section class="hero" style="text-align: center; margin-bottom: 3rem; padding: 2rem 0;">
            <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">探索未来的无限可能</h1>
            <p style="color: var(--text-secondary); font-size: 1.1rem;">加入我们，掌握前沿技术，成就更好的自己</p>
        </section>
        <div class="course-grid">
            ${courses.map(course => createCourseCard(course)).join('')}
        </div>
    `;
    window.scrollTo(0, 0);
}

function createCourseCard(course) {
    return `
        <div class="course-card" onclick="renderDetail(${course.id})">
            <div class="card-image" style="background-image: url('${course.image}')">
                <div class="card-badge">${course.level}</div>
            </div>
            <div class="card-body">
                <div class="card-title">${course.title}</div>
                <div class="card-desc">${course.desc}</div>
                <div class="card-footer">
                    <div class="price">¥ ${course.price}</div>
                    <div class="btn-arrow">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderDetail(id) {
    const course = courses.find(c => c.id === id);
    if (!course) return;

    currentView = 'detail';
    navHome.classList.remove('active'); // Simply remove active state when in detail

    app.innerHTML = `
        <div class="detail-view">
            <button class="back-btn" onclick="renderHome()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                返回课程列表
            </button>
            
            <div class="detail-header">
                <div class="detail-image-container">
                    <img src="${course.image}" alt="${course.title}" class="detail-image">
                </div>
                <div class="detail-info">
                    <h1 class="detail-title">${course.title}</h1>
                    <div class="detail-meta">
                        <span>⏱ ${course.duration}</span>
                        <span>👥 ${course.students}</span>
                        <span>📊 ${course.level}</span>
                    </div>
                    <p class="detail-description">${course.desc}</p>
                    <button class="cta-button" onclick="openPurchaseModal(${course.price})">
                        立即报名 ¥ ${course.price}
                    </button>
                </div>
            </div>

            <div class="curriculum">
                <h2>课程大纲</h2>
                <div class="chapters-list">
                    ${course.chapters.map((chap, index) => `
                        <div class="chapter">
                            <h3>0${index + 1}. ${chap.title}</h3>
                            <p>${chap.desc}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    window.scrollTo(0, 0);

    // Auto-trigger chat suggestion
    setTimeout(() => {
        if (chatWidget.classList.contains('closed')) {
            addBotMessage(`对 **${course.title}** 感兴趣吗？我是这门课的智能顾问，有任何问题随时问我！`);
            toggleChat(true); // Open chat automatically on detail page for engagement
        }
    }, 1500);
}

// --- Chat Logic ---
function toggleChat(forceOpen = null) {
    if (forceOpen === true) {
        chatWidget.classList.remove('closed');
        chatFloatBtn.classList.add('hidden');
    } else if (forceOpen === false) {
        chatWidget.classList.add('closed');
        chatFloatBtn.classList.remove('hidden');
    } else {
        chatWidget.classList.toggle('closed');
        chatFloatBtn.classList.toggle('hidden');
    }
}

function handleUserMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Add user message
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message user';
    msgDiv.innerHTML = `<div class="text">${escapeHtml(text)}</div>`;
    chatMessages.appendChild(msgDiv);

    chatInput.value = '';
    scrollToBottom();

    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="avatar">AI</div>
        <div class="text">
            <div class="typing-dots"><span></span><span></span><span></span></div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    scrollToBottom();

    // Simulate AI delay and response
    setTimeout(() => {
        typingDiv.remove();
        const response = generateAIResponse(text);
        addBotMessage(response);
    }, 1000 + Math.random() * 500);
}

function addBotMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message bot';
    msgDiv.innerHTML = `
        <div class="avatar">AI</div>
        <div class="text">${text}</div>
    `;
    chatMessages.appendChild(msgDiv);
    scrollToBottom();
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateAIResponse(input) {
    input = input.toLowerCase();

    // Course Context Matching
    const matchedCourse = courses.find(c => c.aiKeywords.some(k => input.includes(k)));

    if (input.includes("价格") || input.includes("多少钱") || input.includes("贵")) {
        if (matchedCourse) {
            return `《${matchedCourse.title}》目前的优惠价格是 ¥${matchedCourse.price}。这个价格包含了所有的视频教程和源码资料哦。`;
        }
        return "我们的课程价格在 ¥1899 到 ¥4599 不等。您可以点击具体课程查看详细价格，或者告诉我您感兴趣的方向。";
    }

    if (input.includes("适合") || input.includes("基础") || input.includes("小白")) {
        if (matchedCourse) {
            return `《${matchedCourse.title}》的难度等级是：${matchedCourse.level}。${matchedCourse.level === '零基础入门' ? '完全不需要任何基础，非常适合初学者！' : '建议有一些相关基础会学得更轻松哦。'}`;
        }
        return "我们有很多适合零基础的课程，比如Python开发和UI设计。您之前的背景是什么呢？";
    }

    if (matchedCourse) {
        return `看起来您对 **${matchedCourse.title}** 感兴趣！这门课主要包括 ${matchedCourse.chapters[0].title} 和 ${matchedCourse.chapters[1].title} 等内容，共有 ${matchedCourse.students} 位同学在学。想要了解更多吗？`;
    }

    const genericResponses = [
        "这是一个非常好的问题！我们的课程设计都非常强调实战，确保您学完后能直接应用到工作中。",
        "我在听。您可以具体问我关于课程内容、讲师或者就业方向的问题。",
        "如果您不确定选哪门课，可以告诉我您的职业目标，我来为您推荐。",
        "好的，我明白了。除此之外，您还有其他顾虑吗？"
    ];

    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// --- Modal Logic ---
function openPurchaseModal(price) {
    modalPrice.textContent = price;
    modal.classList.remove('hidden');
}

function closePurchaseModal() {
    modal.classList.add('hidden');
}

// --- Event Listeners ---
function setupEventListeners() {
    navHome.addEventListener('click', renderHome);

    // Modal
    closeModalBtn.addEventListener('click', closePurchaseModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closePurchaseModal();
    });

    // Chat
    chatFloatBtn.addEventListener('click', () => toggleChat(true));
    chatToggleBtn.addEventListener('click', () => toggleChat(false));

    sendBtn.addEventListener('click', handleUserMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserMessage();
    });
}

// --- Init ---
// Make renderDetail available globally for onclick events in HTML strings
window.renderDetail = renderDetail;
window.renderHome = renderHome;
window.openPurchaseModal = openPurchaseModal;

init();
