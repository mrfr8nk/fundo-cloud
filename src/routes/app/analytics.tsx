import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { formatBytes } from "@/lib/format";

export const Route = createFileRoute("/app/analytics")({ component: Analytics });

function Analytics() {
  const [byDay, setByDay] = useState<{ day: string; requests: number; bytes: number }[]>([]);
  const [byAction, setByAction] = useState<{ action: string; count: number }[]>([]);

  useEffect(() => { (async () => {
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const { data } = await supabase.from("usage_logs").select("created_at, bytes, action").gte("created_at", since);
    const dayMap = new Map<string, { requests: number; bytes: number }>();
    const actMap = new Map<string, number>();
    (data ?? []).forEach((r: any) => {
      const d = new Date(r.created_at).toISOString().slice(0, 10);
      const cur = dayMap.get(d) ?? { requests: 0, bytes: 0 };
      cur.requests++; cur.bytes += Number(r.bytes || 0);
      dayMap.set(d, cur);
      actMap.set(r.action, (actMap.get(r.action) ?? 0) + 1);
    });
    setByDay(Array.from(dayMap.entries()).sort(([a],[b]) => a.localeCompare(b)).map(([day, v]) => ({ day: day.slice(5), ...v })));
    setByAction(Array.from(actMap.entries()).map(([action, count]) => ({ action, count })));
  })(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Last 30 days.</p>
      </div>

      <Card className="glass p-6 border-border/50">
        <h2 className="font-semibold mb-4">Requests per day</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={byDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
              <XAxis dataKey="day" stroke="oklch(0.72 0.04 260)" fontSize={11} />
              <YAxis stroke="oklch(0.72 0.04 260)" fontSize={11} />
              <Tooltip contentStyle={{ background: "oklch(0.20 0.04 265)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="requests" stroke="oklch(0.78 0.18 220)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="glass p-6 border-border/50">
          <h2 className="font-semibold mb-4">Bandwidth per day</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
                <XAxis dataKey="day" stroke="oklch(0.72 0.04 260)" fontSize={11} />
                <YAxis stroke="oklch(0.72 0.04 260)" fontSize={11} tickFormatter={(v) => formatBytes(v, 0)} />
                <Tooltip formatter={(v: any) => formatBytes(v)} contentStyle={{ background: "oklch(0.20 0.04 265)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} />
                <Bar dataKey="bytes" fill="oklch(0.65 0.22 295)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="glass p-6 border-border/50">
          <h2 className="font-semibold mb-4">By action</h2>
          <div className="space-y-2">
            {byAction.map((a) => (
              <div key={a.action} className="flex justify-between text-sm">
                <span className="capitalize">{a.action}</span>
                <span className="text-muted-foreground">{a.count}</span>
              </div>
            ))}
            {byAction.length === 0 && <div className="text-sm text-muted-foreground">No activity yet.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
