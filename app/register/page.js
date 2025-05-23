"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const RegisterPage = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    countryCode: "",
    contact: "",
    dob: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const validCountryCodes = [91, 1, 44, 61, 81]; // Add more valid country codes as needed

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFutureDate = (dateStr) => {
    const today = new Date();
    const inputDate = new Date(dateStr);
    return inputDate > today;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // ✅ Custom Validations
    if (!validCountryCodes.includes(Number(form.countryCode))) {
      setMessage("Invalid country code");
      setLoading(false);
      return;
    }

    if (form.contact.length < 8 || form.contact.length > 15) {
      setMessage("Contact must be between 8 and 15 characters");
      setLoading(false);
      return;
    }

    if (isFutureDate(form.dob)) {
      setMessage("Date of birth cannot be in the future");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signup`,
        form,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200) {
        setMessage("Registration successful!");
        localStorage.setItem("token", res.data.token);
        router.push("/verify");
      } else {
        throw new Error("Unexpected error");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-white">
          Register
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "First Name", name: "firstName", type: "text" },
            { label: "Last Name", name: "lastName", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Password", name: "password", type: "password" },
            { label: "Country Code", name: "countryCode", type: "number" },
            { label: "Contact", name: "contact", type: "number" },
            { label: "Date of Birth", name: "dob", type: "date" },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {label}
              </label>
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
