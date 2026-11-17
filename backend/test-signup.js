async function testSignup() {
  const response = await fetch("http://localhost:5000/api/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: "Test User",
      email: "testuser@example.com",
      password: "TestPass123!",
      confirmPassword: "TestPass123!"
    })
  });

  const result = await response.json();

  console.log("Status:", response.status);
  console.log("Response:", result);
}

testSignup().catch(console.error);