"use client";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import LoadingSpinner from "../Loading";
import { useRouter } from "next/navigation";

const LoginComponent = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await axios
      .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signin`, {
        email,
        password,
      })
      .then((res) => {
        const data = res.data;

        localStorage.setItem("token", data.token);
        document.cookie = `token=${data.token}; path=/`;
        setLoading(false);

        router.push("/");
      })
      .catch((err) => {
        const message = err.response.data.message;
        setError(message);
        setLoading(false);
      });
  };

  useEffect(() => {
    let timer;
    if (error) {
      timer = setTimeout(() => {
        setError(null);
      }, 5000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [error]);

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm sm:text-base font-medium text-gray-900"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Update state on input change
                autoComplete="email"
                required
                className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm md:text-base"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm sm:text-base font-medium text-gray-900"
              >
                Password
              </label>
              <Link href="/change-password">
                <span className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Forgot Password?
                </span>
              </Link>
            </div>
            <div className="mt-2">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Update state on input change
                autoComplete="current-password"
                required
                className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm md:text-base"
              />
            </div>
            <div className="flex justify-end mt-1">
              <button
                className="cursor-pointer text-sm"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm sm:text-base font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
              >
                Sign in
              </button>
            )}
            <p
              className={`text-sm text-center mt-1 ${
                error ? "text-red-400" : "text-transparent"
              }`}
              hidden={!error}
            >
              {error}
            </p>
          </div>
          <Link href="/register">
            <span className="font-semibold">Register</span>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default LoginComponent;
