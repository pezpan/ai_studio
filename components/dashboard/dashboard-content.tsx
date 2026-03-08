"use client";

import { useEffect, useState } from "react";
import { getStats, getRecentActivity, getTopSkills } from "@/lib/api";
import { mockCategoryData } from "@/lib/mock-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Stats {
  prompts: number;
  mcpServers: number;
  skills: number;
  workflows: number;
}

interface RecentActivity {
  type: string;
  description: string;
  timestamp: string;
}

interface TopSkill {
  name: string;
  usageCount: number;
  qualityScore: number;
}

const getActivityColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "prompt": return "#6366f1";
    case "skill": return "#22c55e";
    case "workflow": return "#a855f7";
    case "mcp": return "#06b6d4";
    default: return "#6b6b8a";
  }
};

export function DashboardContent() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [topSkills, setTopSkills] = useState<TopSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [s, a, ts] = await Promise.all([
          getStats(),
          getRecentActivity(),
          getTopSkills()
        ]);
        setStats(s);
        setActivities(a);
        setTopSkills(ts);
      } catch (error) {
        console.warn("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = stats ? [
    {
      label: "Total Prompts",
      value: stats.prompts,
      description: "In your library",
      color: "#6366f1",
      gradient: "linear-gradient(135deg, #6366f1, #a855f7)",
    },
    {
      label: "MCP Servers",
      value: stats.mcpServers,
      description: "Configured & active",
      color: "#06b6d4",
      gradient: "linear-gradient(135deg, #06b6d4, #0284c7)",
    },
    {
      label: "Skills",
      value: stats.skills,
      description: "Reusable templates",
      color: "#22c55e",
      gradient: "linear-gradient(135deg, #22c55e, #16a34a)",
    },
    {
      label: "Workflows",
      value: stats.workflows,
      description: "Automated pipelines",
      color: "#a855f7",
      gradient: "linear-gradient(135deg, #a855f7, #9333ea)",
    },
  ] : [];

  if (loading) {
    return (
      <div className="p-8 max-w-7xl flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">Dashboard</h1>
        <p className="text-sm font-medium" style={{ color: "#6b6b8a" }}>
          Overview of your AI Studio workspace
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: "#12121a",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{ background: card.gradient }}
            />
            <p
              className="font-mono text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: card.color }}
            >
              {card.label}
            </p>
            <p
              className="font-mono font-bold mb-1 leading-none"
              style={{ fontSize: "40px", color: "white" }}
            >
              {card.value}
            </p>
            <p className="text-sm font-medium" style={{ color: "#6b6b8a" }}>
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* Mid Row: Chart + Activity */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Bar Chart */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "#12121a",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <p className="font-semibold text-white mb-1">Prompts by Category</p>
          <p className="font-mono text-xs mb-5" style={{ color: "#6b6b8a" }}>
            Distribution across categories
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={mockCategoryData} barSize={36}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="category"
                tick={{ fill: "#6b6b8a", fontSize: 11, fontFamily: "var(--font-space-mono)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b6b8a", fontSize: 11, fontFamily: "var(--font-space-mono)" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={24}
              />
              <Tooltip
                cursor={{ fill: "rgba(99,102,241,0.08)" }}
                contentStyle={{
                  background: "#1a1a26",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  fontFamily: "var(--font-space-mono)",
                  fontSize: 12,
                  color: "#e8e8f0",
                }}
              />
              <Bar dataKey="count" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "#12121a",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <p className="font-semibold text-white mb-1">Recent Activity</p>
          <p className="font-mono text-xs mb-5" style={{ color: "#6b6b8a" }}>
            Latest events in your workspace
          </p>
          <div className="flex flex-col gap-3">
            {activities.length > 0 ? activities.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: `${getActivityColor(item.type)}18` }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: getActivityColor(item.type) }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug" style={{ color: "#c8c8e0" }}>
                    {item.description}
                  </p>
                  <p className="font-mono text-xs mt-0.5" style={{ color: "#3d3d55" }}>
                    {item.timestamp}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-sm" style={{ color: "#6b6b8a" }}>No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Skills Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "#12121a",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <p className="font-semibold text-white">Top Skills by Usage</p>
          <p className="font-mono text-xs mt-0.5" style={{ color: "#6b6b8a" }}>
            Most frequently used skill templates
          </p>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["#", "Skill", "Category", "Uses", "Quality"].map((col) => (
                <th
                  key={col}
                  className="font-mono text-xs text-left px-5 py-3 uppercase tracking-wider"
                  style={{ color: "#3d3d55" }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topSkills.map((skill, idx) => (
                <tr
                  key={idx}
                  className="transition-all duration-150"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                      "rgba(255,255,255,0.02)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                      "transparent")
                  }
                >
                  <td className="px-5 py-3 font-mono text-xs" style={{ color: "#3d3d55" }}>
                    {idx + 1}
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-mono text-sm font-bold" style={{ color: "#c8c8e0" }}>
                      {skill.name}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="font-mono text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(99,102,241,0.1)",
                        color: "#818cf8",
                        border: "1px solid rgba(99,102,241,0.2)",
                      }}
                    >
                      Skill
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-sm font-bold" style={{ color: "#e8e8f0" }}>
                    {skill.usageCount.toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="font-mono text-sm font-bold"
                      style={{ color: "#22c55e" }}
                    >
                      {skill.qualityScore}%
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

