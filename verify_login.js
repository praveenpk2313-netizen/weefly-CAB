
const testLogin = (inputUser, dbUsername, envUser) => {
    const normalize = (u) => (u || "").toString().trim().toLowerCase();
    
    // Simulating the backend logic
    const inputUserNorm = normalize(inputUser);
    const dbUsernameNorm = normalize(dbUsername);
    const envUserNorm = normalize(envUser);

    let isValid = false;
    if (dbUsernameNorm && dbUsernameNorm === inputUserNorm) {
        isValid = true;
    } else if (inputUserNorm === envUserNorm) {
        isValid = true;
    }

    console.log(`Input: "${inputUser}", DB: "${dbUsername}", Env: "${envUser}" => Valid: ${isValid}`);
    return isValid;
};

testLogin("Admin2", "admin2", "admin");
testLogin("admin2", "Admin2", "admin");
testLogin("ADMIN", "user", "admin");
testLogin("admin", "admin", "admin");
