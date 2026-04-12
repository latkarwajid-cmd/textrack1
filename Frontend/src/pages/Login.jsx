import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import "./Login.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://textrack1-2.onrender.com";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = formData.email.trim();
    const password = formData.password.trim();

    if (!email || !password) {
      toast.warning("Email and password are required");
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/user/login`,
        { email, password }
      );

      const token = response?.data?.data?.token;
      const role = response?.data?.data?.role;

      if (!token) {
        toast.error("Login failed: token not received");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role || "");

      toast.success("Login successful 🎉");
      navigate("/home", { replace: true });

    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Login failed";

      toast.error(message);

    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Google login handler
const handleGoogleLogin = async (credentialResponse) => {
  try {
    if (!credentialResponse?.credential) {
      toast.error("Google token missing");
      return;
    }

    const response = await axios.post(
      `${API_BASE_URL}/auth/google`,
      {
        token: credentialResponse.credential,
      }
    );

    const token = response?.data?.data?.token;
    const role = response?.data?.data?.role;

    if (!token) {
      toast.error("Google login failed");
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("role", role || "");

    toast.success("Google login successful 🎉");
    navigate("/home", { replace: true });

  } catch (error) {
    toast.error(
      error?.response?.data?.error ||
      "Google login failed"
    );
  }
};

  return (
    <main className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>TexTrack Login</h1>
        <p className="subtitle">Sign in to continue</p>

        <label>Email</label>
        <input
          name="email"
          type="email"
          placeholder="abc@gmail.com"
          value={formData.email}
          onChange={handleChange}
        />

        <label>Password</label>
        <input
          name="password"
          type="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleChange}
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>

        {/* Divider */}
        <div style={{ margin: "20px 0", textAlign: "center" }}>
          OR
        </div>

        {/* Google Login Button */}
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => toast.error("Google login failed")}
        />
      </form>
    </main>
  );
}

export default Login;