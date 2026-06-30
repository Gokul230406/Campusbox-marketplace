"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function WalletPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [addAmount, setAddAmount] = useState("")
  const [addLoading, setAddLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [balance, setBalance] = useState<number>(0)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (user) {
      setBalance(user.walletBalance || 0)
    }
  }, [user, loading, router])

  const handleAddFunds = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const amountValue = Number.parseFloat(addAmount)
    if (!addAmount || isNaN(amountValue) || amountValue <= 0) {
      setSuccess("Please enter a valid amount")
      setTimeout(() => setSuccess(""), 3000)
      return
    }

    setAddLoading(true)
    setSuccess("")
    try {
      const res = await fetch("/api/wallet/add-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountValue }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to add funds")
      }

      const data = await res.json()
      setSuccess("Funds added successfully!")
      setAddAmount("")
      
      // Update balance from response
      if (data.newBalance !== undefined) {
        setBalance(data.newBalance)
      } else if (data.balance !== undefined) {
        setBalance(data.balance)
      } else {
        // Fallback: Refresh user data to get updated balance
        const profileRes = await fetch("/api/user/profile")
        if (profileRes.ok) {
          const userData = await profileRes.json()
          setBalance(userData.walletBalance || balance)
        }
      }
      
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      console.error("Add funds error:", err)
      setSuccess(err.message || "Failed to add funds")
      setTimeout(() => setSuccess(""), 3000)
    } finally {
      setAddLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Wallet Management</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Balance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg border border-primary/30">
                  <p className="text-muted-foreground mb-2">Available Balance</p>
                  <p className="text-4xl font-bold">₹{balance.toLocaleString()}</p>
                </div>
                <Button asChild className="w-full">
                  <a href="/products">Browse & Shop</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Add Funds Card */}
          <Card>
            <CardHeader>
              <CardTitle>Add Funds</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddFunds} className="space-y-4">
                {success && <div className="p-3 bg-green-100 text-green-800 rounded-lg text-sm">{success}</div>}
                <div>
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="500"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    className="mt-2"
                    min="1"
                  />
                </div>
                <Button type="submit" disabled={addLoading} className="w-full">
                  {addLoading ? "Processing..." : "Add Funds via Razorpay"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>No transactions yet</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
