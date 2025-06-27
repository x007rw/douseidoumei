const DouseiDoumeiApp = {};

document.addEventListener("DOMContentLoaded", () => {
        let root = document.getElementById("root");

    // --- Constants ---
    const DEMO_EMAIL = "douseidoumei";
    const DEMO_PASSWORD = "douseidoumei";
    const USERS_STORAGE_KEY = "users";

    // --- State Management ---
    const getInitialState = () => ({
        page: "intro",
        user: null,
        form: { email: "", password: "", name: "" },
        matches: [],
        error: ""
    });

    let state = getInitialState();

    // --- Local Storage Utilities ---
    const getUsers = () => {
        try {
            return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "[]");
        } catch (e) {
            console.error("Failed to read from localStorage", e);
            return [];
        }
    };

    const saveUsers = (users) => {
        try {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        } catch (e) {
            console.error("Failed to save to localStorage", e);
        }
    };
    
    // Expose functions for testing
    DouseiDoumeiApp.getUsers = getUsers;
    DouseiDoumeiApp.saveUsers = saveUsers;
    DouseiDoumeiApp.USERS_STORAGE_KEY = USERS_STORAGE_KEY;


    // --- Rendering ---
    // The render function is not exposed as it depends on the DOM
    const render = () => {
        if (!root) return; // Don't render if root element is not on the page (e.g. in test environment)
        const { page, form, user, matches } = state;
        let pageContent = "";
        state.error = ""; // Reset error on each render

        switch (page) {
            case "intro":
                pageContent = `
                    <div class="hero-section text-center">
                        <h1 class="hero-title">同姓同名.com</h1>
                        <p class="hero-subtitle">世界にいる、もう一人の自分を探しに行こう。</p>
                        <p class="hero-description">あなたの名前は、あなただけのものではないかもしれません。<br>同じ名前を持つ人々との、思いがけない出会いが待っています。</p>
                        <button data-action="navigate" data-page="auth" class="btn btn-primary btn-lg hero-btn mt-4">無料で始める</button>
                    </div>`;
                break;
            case "auth":
                pageContent = `
                    <div class="auth-container">
                        <h2>デモログイン</h2>
                        <p class="text-center text-muted mb-4">メールアドレスとパスワードに「${DEMO_EMAIL}」と入力してください。</p>
                        <form data-action="login" novalidate>
                            <div class="form-group">
                                <label for="email-input">メールアドレス</label>
                                <input type="text" id="email-input" class="form-control" data-field="email" value="${form.email}" required />
                            </div>
                            <div class="form-group">
                                <label for="password-input">パスワード</label>
                                <input type="password" id="password-input" class="form-control" data-field="password" value="${form.password}" required />
                            </div>
                            <div id="general-error" class="text-danger text-center mb-3"></div>
                            <button type="submit" class="btn btn-primary btn-block mt-3">デモを続ける</button>
                        </form>
                        <button data-action="navigate" data-page="intro" class="btn-toggle">戻る</button>
                    </div>`;
                break;
            case "addName":
                pageContent = `
                    <div class="auth-container">
                        <h2>お名前の登録</h2>
                        <p>マッチングに使用する名前を入力してください。</p>
                        <form data-action="registerName">
                            <div class="form-group">
                                <label for="name-input">名前</label>
                                <input type="text" id="name-input" class="form-control" data-field="name" value="${form.name}" required />
                                <div id="name-error" class="invalid-feedback"></div>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block">登録</button>
                        </form>
                    </div>`;
                break;
            case "matches":
                const matchesList = matches.length > 0
                    ? matches.map(m => `<li class="list-group-item">${m.name}</li>`).join("")
                    : `<li class="list-group-item">まだ誰もいません。</li>`;
                pageContent = `
                    <div class="container matches-container">
                        <button data-action="logout" class="btn btn-secondary logout-btn">ログアウト</button>
                        <h2>${user?.name}さん、ようこそ！</h2>
                        <h4>あなたと同じ名前のユーザー:</h4>
                        <ul class="list-group">${matchesList}</ul>
                    </div>`;
                break;
            default:
                pageContent = "<h1>エラー</h1><p>ページが見つかりません。</p>";
        }
        root.innerHTML = pageContent;
    };

    // --- Event Handlers & Actions ---
    const actions = {
        navigate(e) {
            state.page = e.target.dataset.page;
            render();
        },
        login(e) {
            e.preventDefault();
            if (state.form.email === DEMO_EMAIL && state.form.password === DEMO_PASSWORD) {
                state.page = "addName";
                render();
            } else {
                const errorEl = document.getElementById("general-error");
                if(errorEl) errorEl.textContent = "メールアドレスとパスワードが違います。";
            }
        },
        registerName(e) {
            e.preventDefault();
            const nameInput = state.form.name.trim();
            if (!nameInput) {
                const errorEl = document.getElementById("name-error");
                if(errorEl) errorEl.textContent = "名前を入力してください。";
                return;
            }
            
            const users = getUsers();
            const newUser = { id: `demo_${Date.now()}`, name: nameInput };
            
            saveUsers([...users, newUser]);
            
            state.user = newUser;
            state.matches = users.filter(u => u.name === nameInput);
            state.page = "matches";
            render();
        },
        logout() {
            state = getInitialState();
            render();
        },
        updateField(e) {
            const { field } = e.target.dataset;
            if (field && state.form.hasOwnProperty(field)) {
                state.form[field] = e.target.value;
            }
        }
    };

    // For testing purposes
    DouseiDoumeiApp.state = state;
    DouseiDoumeiApp.actions = actions;
    DouseiDoumeiApp.initForTesting = (rootElement) => {
        state = getInitialState();
        root = rootElement;
    };

    // --- Event Delegation ---
    if (root) {
        root.addEventListener("click", (e) => {
            const { action } = e.target.dataset;
            if (action && typeof actions[action] === "function") {
                actions[action](e);
            }
        });

        root.addEventListener("submit", (e) => {
            const { action } = e.target.dataset;
            if (action && typeof actions[action] === "function") {
                actions[action](e);
            }
        });
        
        root.addEventListener("input", (e) => {
            actions.updateField(e);
        });

        // --- Initial Render ---
        render();
    }
});