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
