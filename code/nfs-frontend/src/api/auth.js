/**
 * Perform login request.
 * @param {{email:string,password:string}} credentials
 * @returns {Promise<{accessToken:string, role:string}>}
 */
export async function login({ email, password }) {
    const baseUrl = "http://localhost:5148";
    const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Login request failed");
    }

    const data = await response.json();
    // Expected shape: { accessToken: string, role?: string }
    return data;
} 

export async function register(user) {
  const baseUrl = "http://localhost:5148";
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Register request failed");
  }

  const data = await response.json();
  return data;
}

