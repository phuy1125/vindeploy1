"use client";

import { useState } from "react";
import Link from "next/link";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
      } else {
        setSuccess(true);
        console.log("User registered successfully:", data);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[90vh] w-full bg-gradient-to-r from-blue-500 to-purple-500">
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-lg sm:max-w-xl">
        <h1 className="text-3xl font-bold text-center text-gray-700 mb-6">Sign Up</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-600 text-center mb-4">✅ Registered successfully!</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-lg text-gray-600 mb-2">Email</label>
            <input
              id="email"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-lg text-gray-600 mb-2">Password</label>
            <input
              id="password"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-lg text-gray-600 mb-2">Confirm Password</label>
            <input
              id="confirmPassword"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:bg-gradient-to-l transition duration-300 ease-in-out"
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>

          <div className="flex items-center justify-center mt-4">
            <span className="text-sm text-gray-600">Already have an account?</span>
            <Link href="/login" className="text-blue-400 text-sm ml-1">
              Log In
            </Link>
          </div>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            By signing up, you agree to our{" "}
            <Link href="#" className="text-blue-400">Terms</Link> and{" "}
            <Link href="#" className="text-blue-400">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
