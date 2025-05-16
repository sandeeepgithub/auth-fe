"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const ResetPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");

  const inputsRef = useRef([]);
  const router = useRouter();

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/sendOtp`,
        { email }
      );
      const token = res.data.token;
      localStorage.setItem("reset-token", token);
      setStep(2);
      setMessage("OTP sent successfully");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 4) {
      setMessage("Please enter a valid 4-digit OTP");
      return;
    }

    if (!password) {
      setMessage("Please enter a new password");
      return;
    }

    const token = localStorage.getItem("reset-token");
    if (!token) {
      setMessage("No token found. Please resend OTP.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/resetPassword`,
        { otp: enteredOtp, password },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("Password reset successful!");
      router.replace("/login");
    } catch (err) {
      setMessage(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setMessage("Please enter your email to resend OTP");
      return;
    }

    setResending(true);
    setMessage("");

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/sendOtp`,
        { email }
      );

      const token = res.data.token;
      localStorage.setItem("reset-token", token);
      setMessage("OTP resent successfully");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-white">
          {step === 1 ? "Reset Password" : "Enter OTP & New Password"}
        </h2>

        <form
          onSubmit={step === 1 ? handleSendOtp : handleResetPassword}
          className="space-y-6"
        >
          <div>
            <label
              htmlFor="email"
              className="block mb-1 font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={step === 2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          {step === 2 && (
            <>
              <div className="flex justify-between space-x-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleBackspace(i, e)}
                    ref={(el) => (inputsRef.current[i] = el)}
                    className="w-12 h-12 text-center text-lg border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ))}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block mb-1 font-medium text-gray-700 dark:text-gray-300"
                >
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition disabled:opacity-50"
          >
            {loading
              ? step === 1
                ? "Sending..."
                : "Resetting..."
              : step === 1
              ? "Send OTP"
              : "Reset Password"}
          </button>
        </form>

        {step === 2 && (
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending}
            className="mt-4 w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-md transition disabled:opacity-50"
          >
            {resending ? "Resending..." : "Resend OTP"}
          </button>
        )}

        {message && (
          <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
