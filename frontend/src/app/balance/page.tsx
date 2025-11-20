"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BalancePage() {
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      setUsername(loggedInUser);
      fetchBalance(loggedInUser);
    } else {
      router.push("/login");
    }
  }, [router]);

  const fetchBalance = async (user: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`https://banking-system-fastapi-backend.onrender.com/balance/${user}`);
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
      } else {
        const errorData = await res.json();
        setError(errorData.detail || "Failed to fetch balance.");
      }
    } catch (err) {
      setError("An error occurred while fetching balance.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    router.push("/login");
  };

  if (!username) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Account Balance
          </h2>
          <button onClick={handleLogout} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Logout
          </button>
        </div>
        
        <p className="text-center text-sm text-gray-600">
            Current balance for account: <span className="font-bold">{username}</span>
        </p>

        {loading ? (
          <div className="text-center text-gray-500">Loading balance...</div>
        ) : error ? (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        ) : (
          <div className="p-6 text-center text-green-700 bg-green-100 rounded-lg">
            <p className="text-xl font-bold">Your Current Balance:</p>
            <p className="mt-2 text-5xl font-extrabold text-green-800">
              ${balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        )}

         <div className="text-sm text-center">
              <button onClick={() => router.push('/dashboard')} className="font-medium text-indigo-600 hover:text-indigo-500">
                &larr; Back to Dashboard
              </button>
          </div>
      </div>
    </div>
  );
}
