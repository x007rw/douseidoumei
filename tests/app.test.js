const runTests = () => {
    const { getUsers, saveUsers, USERS_STORAGE_KEY } = DouseiDoumeiApp;
    let failures = 0;

    const test = (description, testFn) => {
        try {
            testFn();
            console.log(`✅ PASS: ${description}`);
        } catch (error) {
            failures++;
            console.error(`❌ FAIL: ${description}`);
            console.error(error);
        }
    };

    const assertEqual = (actual, expected, msg = "") => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(`Assertion failed: ${msg}\nExpected: ${JSON.stringify(expected)}\nActual:   ${JSON.stringify(actual)}`);
        }
    };

    // --- Test Suite ---

    test("getUsers should return an empty array when localStorage is empty", () => {
        localStorage.removeItem(USERS_STORAGE_KEY);
        const users = getUsers();
        assertEqual(users, []);
    });

    test("saveUsers and getUsers should save and retrieve users correctly", () => {
        const mockUsers = [{ id: 1, name: "Test User" }];
        saveUsers(mockUsers);
        const users = getUsers();
        assertEqual(users, mockUsers);
    });

    test("getUsers should return an empty array when localStorage contains invalid JSON", () => {
        localStorage.setItem(USERS_STORAGE_KEY, "invalid-json");
        const users = getUsers();
        assertEqual(users, []);
    });

    // --- DOM-dependent tests would go here, but are harder to unit test without a virtual DOM ---
    // For example, testing the login flow would require DOM elements and event simulation.

    test("Login action should change page to addName on correct credentials", () => {
        document.body.innerHTML = '<div id="root"></div>';
        DouseiDoumeiApp.initForTesting(document.getElementById('root'));

        DouseiDoumeiApp.state.form.email = "douseidoumei";
        DouseiDoumeiApp.state.form.password = "douseidoumei";
        DouseiDoumeiApp.actions.login({ preventDefault: () => {} });

        assertEqual(DouseiDoumeiApp.state.page, "addName", "Page should be addName after login");
    });

    test("registerName action should save user and find matches", () => {
        localStorage.removeItem(USERS_STORAGE_KEY);
        const initialUsers = [{ id: 'existing_user', name: '山田太郎' }];
        saveUsers(initialUsers);

        document.body.innerHTML = '<div id="root"></div>';
        DouseiDoumeiApp.initForTesting(document.getElementById('root'));

        DouseiDoumeiApp.state.form.name = "山田太郎";
        DouseiDoumeiApp.actions.registerName({ preventDefault: () => {} });

        const finalUsers = getUsers();
        assertEqual(finalUsers.length, 2, "There should be two users after registration");
        assertEqual(finalUsers[1].name, "山田太郎", "The new user should be named 山田太郎");

        assertEqual(DouseiDoumeiApp.state.page, "matches", "Page should be matches after registration");
        assertEqual(DouseiDoumeiApp.state.matches.length, 1, "Should find one match");
        assertEqual(DouseiDoumeiApp.state.matches[0].name, "山田太郎", "The match should be 山田太郎");
    });


    // --- Test Summary ---
    if (failures > 0) {
        console.error(`\n${failures} test(s) failed.`);
        document.body.style.backgroundColor = "#ffcccc";
    } else {
        console.log("\nAll tests passed!");
        document.body.style.backgroundColor = "#ccffcc";
    }
};

window.onload = runTests;
