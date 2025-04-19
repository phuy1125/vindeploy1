"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data: { message?: string; token?: string } = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
      } else {
        localStorage.setItem("authToken", data.token || "");
        router.push("/");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-auto w-full bg-gradient-to-r from-blue-500 to-purple-500">
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-lg sm:max-w-xl">
        <h1 className="text-3xl font-bold text-center text-gray-700 mb-6">Log In</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-lg text-gray-600 mb-2">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-lg text-gray-600 mb-2">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:bg-gradient-to-l transition duration-300 ease-in-out"
          >
            {loading ? "Loading..." : "Log In"}
          </button>

          <div className="flex items-center justify-center mt-4">
            <span className="text-sm text-gray-600">Do not have an account?</span>
            <Link href="/register" className="text-blue-400 text-sm ml-1">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
