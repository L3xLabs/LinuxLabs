"use client";
import React, { useState } from "react";

interface RegisterFormData {
  email: string;
  password: string;
}

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = (): boolean => {
    const { email, password } = formData;
    if (!email || !password) {
      setErrorMessage("Email and Password are required.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handleRegister = (event: React.FormEvent): void => {
    event.preventDefault();
    if (validateForm()) {
      // Route to /crm page on successful login
      window.location.href = "/crm";
    }
  };

  const handleGithubSignIn = () => {
    // Route to /crm page on GitHub sign-in
    window.location.href = "/crm";
  };
  
  const handleGoogleSignIn = () => {
    // Route to /crm page on Google sign-in
    window.location.href = "/crm";
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
      }}
    >
      <div
        style={{
          width: "500px",
          height: "600px",
          backgroundColor: "#fff",
          padding: "60px 60px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <img
                src="/Frame 29.svg"
                alt="Flowwbook logo"
                style={{
                  width: "31.803px",
                  height: "49.927px",
                  flexShrink: 0,
                  aspectRatio: "31.80/49.93",
                }}
              />
              <h1
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "40px",
                  margin: 0,
                }}
              >
                <img
                  src="/Group 5.svg"
                  alt="Floww"
                  style={{ width: "107.053px", height: "28.681px" }}
                />
                <img src="/book.svg" alt="book" style={{ height: "32px" }} />
              </h1>
            </div>
          </div>
          <h2
            style={{
              color: "#020817",
              fontSize: "24px",
              fontStyle: "normal",
              fontWeight: 600,
              lineHeight: "32px",
              letterSpacing: "-0.6px",
              marginBottom: "8px",
            }}
          >
            Login or SignUp
          </h2>
          <h3
            style={{
              color: "var(--text-text-muted-foreground, #64748B)",
              fontFamily: "Inter",
              fontSize: "14px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "20px",
              textAlign: "center",
              wordWrap: "break-word",
              overflowWrap: "break-word",
              marginBottom: "22px",
              marginLeft: "0px",
              marginRight: "0px",
            }}
          >
            Enter your email & password below to create your account
          </h3>
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: "20px", width: "100%" }}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E0",
                  background: "#F7FAFC",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                  fontSize: "14px",
                  color: "#2D3748",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ marginBottom: "20px", width: "100%" }}>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E0",
                  background: "#F7FAFC",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                  fontSize: "14px",
                  color: "#2D3748",
                  outline: "none",
                }}
              />
            </div>
            {errorMessage && (
              <p style={{ color: "red", marginBottom: "15px" }}>
                {errorMessage}
              </p>
            )}
            <button
              type="submit"
              style={{
                display: "flex",
                height: "40px",
                padding: "10px 20px",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                borderRadius: "8px",
                background: "linear-gradient(90deg, #2563EB, #1E40AF)",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "bold",
                border: "none",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                marginBottom: "20px",
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.95)";
                e.currentTarget.style.boxShadow =
                  "0px 2px 4px rgba(0, 0, 0, 0.2)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0px 4px 6px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0px 4px 6px rgba(0, 0, 0, 0.1)";
              }}
            >
              Login
            </button>
          </form>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#606770",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "0.5px",
                backgroundColor: "#CBD5E0",
              }}
            ></div>
            <span style={{ whiteSpace: "nowrap", fontSize: "12px" }}>
              OR CONTINUE WITH
            </span>
            <div
              style={{
                flex: 1,
                height: "1px",
                backgroundColor: "#CBD5E0",
              }}
            ></div>
          </div>
          <button
            onClick={handleGithubSignIn}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              width: "100%",
              height: "40px",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              color: "#333",
              transition: "transform 0.2s, box-shadow 0.2s",
              fontFamily: "Inter",
              fontStyle: "normal",
              marginBottom: "10px",
              lineHeight: "20px",
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "scale(0.95)";
              e.currentTarget.style.boxShadow =
                "0px 1px 2px rgba(0, 0, 0, 0.2)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0px 2px 4px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0px 2px 4px rgba(0, 0, 0, 0.1)";
            }}
          >
            <img
              src="/github-logo.svg"
              alt="GitHub logo"
              style={{ width: "20px", height: "20px" }}
            />
            Continue with GitHub
          </button>
          <button
            onClick={handleGoogleSignIn}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              width: "100%",
              height: "40px",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              color: "#1877f2",
              transition: "transform 0.2s, box-shadow 0.2s",
              fontFamily: "Inter",
              fontStyle: "normal",
              lineHeight: "20px",
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "scale(0.95)";
              e.currentTarget.style.boxShadow =
                "0px 1px 2px rgba(0, 0, 0, 0.2)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0px 2px 4px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0px 2px 4px rgba(0, 0, 0, 0.1)";
            }}
          >
            <img
              src="/Google - Original.svg"
              alt="Google logo"
              style={{ width: "20px", height: "20px" }}
            />
            Continue with Google
          </button>
        </div>
        <p
          style={{
            color: "var(--text-text-muted-foreground, #64748B)",
            fontFamily: "Inter",
            fontSize: "14px",
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: "20px",
            textAlign: "center",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          By creating an account, you agree to our <br />
          <span
            style={{
              textDecoration: "underline",
              textDecorationStyle: "solid",
              textDecorationSkipInk: "none",
            }}
          >
            Terms of Service
          </span>{" "}
          and{" "}
          <span
            style={{
              textDecoration: "underline",
              textDecorationStyle: "solid",
              textDecorationSkipInk: "none",
            }}
          >
            Privacy Policy
          </span>
          .
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;