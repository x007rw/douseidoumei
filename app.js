document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("root");

    const getInitialState = () => ({
        page: "intro",
        user: null,
        email: "", password: "", name: "",
        pendingUser: null,
        matches: [],
        error: ""
    });

    let state = getInitialState();

    const getUsers = () => {
        try {
            return JSON.parse(localStorage.getItem("users") || "[]");
        } catch (e) {
            console.error("Failed to read from localStorage", e);
            return [];
        }
    };
    const saveUsers = (users) => {
        try {
            localStorage.setItem("users", JSON.stringify(users));
        } catch (e) {
            console.error("Failed to save to localStorage", e);
        }
    };

    function render() {
        let pageContent = "";
        state.error = "";

        switch (state.page) {
            case "intro":
                pageContent = `
                    <div class="hero-section text-center">
                        <h1 class="hero-title">同姓同名.com</h1>
                        <p class="hero-subtitle">世界にいる、もう一人の自分を探しに行こう。</p>
                        <p class="hero-description">あなたの名前は、あなただけのものではないかもしれません。<br>同じ名前を持つ人々との、思いがけない出会いが待っています。</p>
                        <button id="start-btn" class="btn btn-primary btn-lg hero-btn mt-4">無料で始める</button>
                    </div>`;
                break;
            case "auth":
                pageContent = `
                    <div class="auth-container">
                        <h2>デモログイン</h2>
                        <p class="text-center text-muted mb-4">メールアドレスとパスワードに「douseidoumei」と入力してください。</p>
                        <form id="auth-form" novalidate>
                            <div class="form-group">
                                <label for="email-input">メールアドレス</label>
                                <input type="text" id="email-input" class="form-control" value="${state.email}" />
                            </div>
                            <div class="form-group">
                                <label for="password-input">パスワード</label>
                                <input type="password" id="password-input" class="form-control" value="${state.password}" />
                            </div>
                            <div id="general-error" class="text-danger text-center mb-3"></div>
                            <button type="submit" class="btn btn-primary btn-block mt-3">デモを続ける</button>
                        </form>
                        <button id="back-to-intro-btn" class="btn-toggle">戻る</button>
                    </div>`;
                break;
            case "addName":
                pageContent = `
                    <div class="auth-container">
                        <h2>お名前の登録</h2>
                        <p>マッチングに使用する名前を入力してください。</p>
                        <form id="name-form">
                            <div class="form-group">
                                <label for="name-input">名前</label>
                                <input type="text" id="name-input" class="form-control" value="${state.name}" required />
                                <div id="name-error" class="invalid-feedback"></div>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block">登録</button>
                        </form>
                    </div>`;
                break;
            case "matches":
                const matchesList = state.matches.length > 0 ?
                    state.matches.map(m => `<li class="list-group-item">${m.name}</li>`).join("") :
                    `<li class="list-group-item">まだ誰もいません。</li>`;
                pageContent = `
                    <div class="container matches-container">
                        <button id="logout-btn" class="btn btn-secondary logout-btn">ログアウト</button>
                        <h2>${state.user?.name}さん、ようこそ！</h2>
                        <h4>あなたと同じ名前のユーザー:</h4>
                        <ul class="list-group">${matchesList}</ul>
                    </div>`;
                break;
            default:
                pageContent = "<h1>エラー</h1><p>ページが見つかりません。</p>";
        }
        root.innerHTML = pageContent;
    }

    function handleAuthSubmit(e) {
        e.preventDefault();
        if (state.email === "douseidoumei" && state.password === "douseidoumei") {
            state.pendingUser = { email: "demo@example.com", id: "demo_user" };
            state.page = "addName";
            render();
        } else {
            document.getElementById("general-error").textContent = "メールアドレスとパスワードが違います。";
        }
    }

    function handleNameSubmit(e) {
        e.preventDefault();
        const nameInput = document.getElementById("name-input");
        if (!nameInput.value.trim()) {
            document.getElementById("name-error").textContent = "名前を入力してください。";
            return;
        }
        const users = getUsers();
        const newUser = { ...state.pendingUser, name: state.name };
        newUser.id = `demo_${Date.now()}`;
        const updatedUsers = [...users, newUser];
        saveUsers(updatedUsers);
        state.user = newUser;
        state.matches = users.filter(u => u.name === state.name);
        state.page = "matches";
        render();
    }

    root.addEventListener("click", (e) => {
        const id = e.target.id;
        if (id === "start-btn") state.page = "auth";
        else if (id === "back-to-intro-btn") state.page = "intro";
        else if (id === "logout-btn") state = getInitialState();
        else return;
        render();
    });

    root.addEventListener("input", (e) => {
        const id = e.target.id;
        const value = e.target.value;

        if (id === "email-input") state.email = value;
        else if (id === "password-input") state.password = value;
        else if (id === "name-input") state.name = value;
    });

    root.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = e.target.id;
        if (id === "auth-form") handleAuthSubmit(e);
        else if (id === "name-form") handleNameSubmit(e);
    });

    render();
});