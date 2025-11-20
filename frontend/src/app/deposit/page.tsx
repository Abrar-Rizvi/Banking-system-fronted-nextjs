"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DepositPage() {
  const [username, setUsername] = useState(""); 
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newBalance, setNewBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      setUsername(loggedInUser);
    } else {
      router.push("/login");
    }
  }, [router]);

  // Clear success/error messages when user starts typing again
  useEffect(() => {
    if (amount) {
      setSuccess("");
      setError("");
      setNewBalance(null);
    }
  }, [amount]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    router.push("/login");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setNewBalance(null);

    if (parseFloat(amount) <= 0) {
      setError("Deposit amount must be positive.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://banking-system-fastapi-backend.onrender.com/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          amount: parseFloat(amount),
        }),
      });

      const responseData = await res.json();
      
      if (res.ok) {
        setSuccess(`Deposit of $${amount} was successful.`);
        setNewBalance(responseData.new_balance);
        setAmount("");
      } else {
        setError(responseData.detail || "An unknown error occurred.");
      }
    } catch (err) {
      setError("Failed to connect to the server. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!username) {
    return null; // Render nothing or a loading spinner while redirecting
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Deposit Funds
          </h2>
          <button onClick={handleLogout} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Logout
          </button>
        </div>
        
        <p className="text-center text-sm text-gray-600">
            Add funds to your account.
        </p>

        <div className="p-4 text-sm text-blue-700 bg-blue-100 rounded-md">
            You are depositing funds for account: <span className="font-bold">{username}</span>
        </div>

        {/* Success message and New Balance Display */}
        {success && newBalance !== null && (
            <div className="p-4 text-sm text-green-700 bg-green-100 rounded-lg">
                <p className="font-bold">{success}</p>
                <p className="mt-2">
                    Your new account balance is: 
                    <span className="font-extrabold text-lg ml-2">
                        ${newBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </p>
            </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                    id="amount"
                    name="amount"
                    type="number"
                    required
                    className="relative block w-full px-3 py-2 pl-7 pr-12 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 sm:text-sm" id="price-currency">USD</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 mt-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !username}
              className="relative flex justify-center w-full px-4 py-2 mt-6 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {loading ? "Depositing..." : "Deposit Funds"}
            </button>
          </div>
        </form>
         <div className="text-sm text-center">
              <button onClick={() => router.push('/dashboard')} className="font-medium text-indigo-600 hover:text-indigo-500">
                &larr; Back to Dashboard
              </button>
          </div>
      </div>
    </div>
  );
}
