"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Zap,
  Package,
  TrendingUp,
  DollarSign,
  ArrowLeft,
  ChevronRight,
  LineChart,
  ShoppingCart,
  Users
} from "lucide-react";

export default function HeroDashboard() {
  const [activeView, setActiveView] = useState<"overview" | "orders" | "offers">("overview");

  return (
    <Card className="hero-dashboard-motion glass-surface overflow-hidden shadow-md transition-all duration-300">
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border relative">
        {activeView !== "overview" && (
          <button 
            onClick={() => setActiveView("overview")}
            className="absolute left-3 w-6 h-6 flex items-center justify-center rounded-md bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-100 animate-in fade-in"
          >
            <ArrowLeft strokeWidth="3" className="w-3.5 h-3.5" />
          </button>
        )}
        <div className={`flex items-center gap-2 transition-transform duration-300 ${activeView !== "overview" ? "translate-x-8" : ""}`}>
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <span className="flex-1 text-center text-[11px] text-muted-foreground font-mono">
          buyease.app/dashboard{activeView !== "overview" ? `/${activeView}` : ""}
        </span>
      </div>
      
      <CardContent className="p-3 relative overflow-hidden h-[340px]">
        {/* OVERVIEW VIEW */}
        <div className={`absolute inset-3 flex flex-col gap-2.5 transition-all duration-500 max-h-full ${
          activeView === "overview" ? "opacity-100 translate-y-0 z-10" : "opacity-0 -translate-y-8 z-0 pointer-events-none"
        }`}>
          {/* Top Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { icon: DollarSign, label: "Revenue", value: "$48.2k", change: "+23.1%", color: "teal", action: "overview" },
              { icon: TrendingUp, label: "Upsell Rev", value: "$8.4k", change: "+34.7%", color: "orange", action: "offers" },
              { icon: Zap, label: "Conversion", value: "4.8%", change: "+1.2%", color: "teal", action: "overview" },
              { icon: Package, label: "AOV", value: "$64.50", change: "+5.4%", color: "orange", action: "orders" },
            ].map((stat) => (
              <div 
                key={stat.label} 
                onClick={() => setActiveView(stat.action as any)}
                className="bg-muted/30 dark:bg-muted/10 rounded-xl p-2.5 border border-border/50 shadow-sm flex flex-col justify-between cursor-pointer hover:border-teal-500/50 hover:bg-muted/50 transition-all group"
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-transform group-hover:scale-110 ${
                    stat.color === "teal" ? "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" : "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                  }`}>
                    <stat.icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[8px] font-bold text-teal-700 bg-teal-100 dark:text-teal-300 dark:bg-teal-900/40 px-1.5 py-0.5 rounded-full">{stat.change}</span>
                </div>
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">{stat.label}</p>
                  <p className="text-base font-black tracking-tight group-hover:text-teal-600 transition-colors">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Revenue Chart */}
            <div className="bg-muted/30 dark:bg-muted/10 rounded-xl p-2.5 border border-border/50 shadow-sm flex flex-col relative overflow-hidden">
              <p className="text-[9px] font-bold mb-2.5 z-10 relative">Revenue Overview</p>
              <div className="flex items-end gap-1 h-14 mt-auto z-10 relative">
                {[48, 64, 52, 78, 60, 84, 70, 76, 50, 65].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-[1px] min-w-0 ${
                      i % 2 === 0 ? "bg-teal-500" : i % 3 === 0 ? "bg-orange-400" : "bg-teal-300 dark:bg-teal-700"
                    } opacity-80 hover:opacity-100 transition-opacity`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Top Offers */}
            <div 
              className="bg-muted/30 dark:bg-muted/10 rounded-xl p-2.5 border border-border/50 shadow-sm cursor-pointer hover:border-orange-500/50 transition-colors"
              onClick={() => setActiveView("offers")}
            >
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[9px] font-bold">Top Offers</p>
                <ChevronRight strokeWidth="3" className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                {[
                  { name: "Post-Purchase Bundle", cr: "12.4%", status: "Active" },
                  { name: "One-Click Upsell #1", cr: "8.2%", status: "Active" },
                  { name: "Checkout Bump", cr: "5.1%", status: "Paused" },
                  { name: "Free Shipping Tier", cr: "15.0%", status: "Active" },
                ].map((offer, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1 h-1 rounded-full ${offer.status === 'Active' ? 'bg-teal-500' : 'bg-muted-foreground'}`} />
                      <span className="text-[9px] font-semibold group-hover:text-orange-500 transition-colors whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">{offer.name}</span>
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground">{offer.cr}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Traffic Sources / Devices */}
            <div className="bg-muted/30 dark:bg-muted/10 rounded-xl p-2.5 border border-border/50 shadow-sm flex flex-col">
              <p className="text-[9px] font-bold mb-2.5">Traffic Source</p>
              <div className="flex-1 flex flex-col justify-center space-y-2.5">
                {[
                  { label: "Mobile", percent: 76, color: "bg-teal-500" },
                  { label: "Desktop", percent: 24, color: "bg-orange-400" },
                ].map((src, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] font-semibold text-muted-foreground">{src.label}</span>
                      <span className="text-[8px] font-bold">{src.percent}%</span>
                    </div>
                    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${src.color}`} style={{ width: `${src.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders Map/Grid */}
          <div className="bg-muted/30 dark:bg-muted/10 rounded-xl p-2.5 border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[9px] font-bold">Recent COD Orders</p>
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveView("orders"); }}
                className="text-[8px] font-semibold text-teal-600 hover:underline cursor-pointer transition-colors"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {[
                { id: "#BE-1044", amount: "$124.99", status: "Fulfilled" },
                { id: "#BE-1043", amount: "$89.50", status: "Pending" },
                { id: "#BE-1042", amount: "$256.00", status: "Fulfilled" },
                { id: "#BE-1041", amount: "$45.00", status: "Pending" },
                { id: "#BE-1040", amount: "$12.99", status: "Fulfilled" },
                { id: "#BE-1039", amount: "$199.00", status: "Pending" },
              ].map((order) => (
                <div 
                  key={order.id} 
                  onClick={() => setActiveView("orders")}
                  className="bg-background/80 rounded-md p-2 border border-border/60 shadow-sm flex flex-col justify-between hover:border-teal-500/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[7.5px] font-mono font-bold text-teal-600 dark:text-teal-400 group-hover:text-teal-700 transition-colors">{order.id}</span>
                    <span className={`w-1 h-1 rounded-full ${order.status === 'Fulfilled' ? 'bg-teal-500' : 'bg-orange-400'}`} />
                  </div>
                  <span className="text-[10px] font-extrabold">{order.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ORDERS VIEW */}
        <div className={`absolute inset-3 flex flex-col transition-all duration-500 max-h-full ${
          activeView === "orders" ? "opacity-100 translate-y-0 z-10" : "opacity-0 translate-y-8 z-0 pointer-events-none"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-teal-600" />
              All COD Orders
            </h3>
            <div className="flex gap-2">
              <span className="bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 px-2 py-0.5 rounded text-[8px] font-bold">142 Today</span>
              <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[8px] font-bold">Export</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto rounded-lg border border-border/50 text-[10px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/50 sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="py-2 px-3 font-semibold border-b border-border/50">Order ID</th>
                  <th className="py-2 px-3 font-semibold border-b border-border/50">Customer</th>
                  <th className="py-2 px-3 font-semibold border-b border-border/50">Amount</th>
                  <th className="py-2 px-3 font-semibold border-b border-border/50">Status</th>
                  <th className="py-2 px-3 font-semibold border-b border-border/50 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {[
                  { id: "#BE-1044", cus: "Sarah J.", amt: "$124.99", st: "Fulfilled", d: "2m ago" },
                  { id: "#BE-1043", cus: "Mike T.", amt: "$89.50", st: "Pending", d: "14m ago" },
                  { id: "#BE-1042", cus: "Alex B.", amt: "$256.00", st: "Fulfilled", d: "1h ago" },
                  { id: "#BE-1041", cus: "Emily W.", amt: "$45.00", st: "Pending", d: "3h ago" },
                  { id: "#BE-1040", cus: "David L.", amt: "$12.99", st: "Fulfilled", d: "4h ago" },
                  { id: "#BE-1039", cus: "Chloe M.", amt: "$199.00", st: "Pending", d: "5h ago" },
                  { id: "#BE-1038", cus: "James R.", amt: "$32.50", st: "Fulfilled", d: "yesterday" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2 px-3 font-mono font-semibold text-teal-600 dark:text-teal-400">{row.id}</td>
                    <td className="py-2 px-3 text-muted-foreground">{row.cus}</td>
                    <td className="py-2 px-3 font-bold">{row.amt}</td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[8px] font-bold ${
                        row.st === 'Fulfilled' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${row.st === 'Fulfilled' ? 'bg-teal-500' : 'bg-orange-500'}`} />
                        {row.st}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-muted-foreground">{row.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* OFFERS VIEW */}
        <div className={`absolute inset-3 flex flex-col transition-all duration-500 max-h-full ${
          activeView === "offers" ? "opacity-100 translate-y-0 z-10" : "opacity-0 translate-y-8 z-0 pointer-events-none"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold flex items-center gap-1.5">
              <LineChart className="w-4 h-4 text-orange-500" />
              Upsell Funnels Performance
            </h3>
            <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 px-2 py-0.5 rounded text-[8px] font-bold">+$8.4k Total Rev</span>
          </div>

          <div className="grid grid-cols-1 gap-2 overflow-auto pr-1">
            {[
              { name: "Post-Purchase VIP Bundle", views: "1.2k", conv: "12.4%", rev: "$4,250", status: "Active" },
              { name: "One-Click Mystery Item", views: "840", conv: "8.2%", rev: "$1,840", status: "Active" },
              { name: "Cart Bump Guarantee", views: "2.1k", conv: "5.1%", rev: "$950", status: "Paused" },
              { name: "Free Shipping Tier Reach", views: "3.4k", conv: "15.0%", rev: "$1,360", status: "Active" },
            ].map((offer, i) => (
              <div key={i} className="bg-muted/30 border border-border/50 rounded-lg p-2.5 flex items-center justify-between group hover:border-orange-500/50 transition-colors">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${offer.status === 'Active' ? 'bg-teal-500' : 'bg-muted-foreground'}`} />
                    <span className="text-[10px] font-bold">{offer.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[8px] text-muted-foreground ml-3">
                    <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5"/> {offer.views} views</span>
                    <span className="flex items-center gap-1"><Zap className="w-2.5 h-2.5"/> {offer.conv} conversion</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-black text-orange-500">{offer.rev}</div>
                  <div className="text-[8px] text-muted-foreground uppercase font-semibold tracking-wider">Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}