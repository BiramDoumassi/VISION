import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import {
  Send, Database, Download, Copy, RefreshCw,
  Lightbulb, Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import DoumassiLogo from '@/components/ui/DoumassiLogo';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

const sampleQueries = [
  "Show me European sales for the last 12 months",
  "Analyze customer churn patterns",
  "Find anomalies in server logs",
  "Compare revenue across product categories"
];

const salesData = [
  { month: 'Jan', revenue: 4200 },
  { month: 'Feb', revenue: 3800 },
  { month: 'Mar', revenue: 5100 },
  { month: 'Apr', revenue: 4700 },
  { month: 'May', revenue: 5900 },
  { month: 'Jun', revenue: 6200 }
];

const pieData = [
  { name: 'Product A', value: 35 },
  { name: 'Product B', value: 28 },
  { name: 'Product C', value: 22 },
  { name: 'Product D', value: 15 }
];

const COLORS = ['#ffffff', '#888888', '#555555', '#333333'];

export default function AIQuery() {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(true);

  const handleQuery = () => {
    if (!query.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowResults(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header 
        title="AI Query Interface" 
        subtitle="Natural language data analytics" 
      />
      
      <div className="p-6 max-w-6xl mx-auto">
        {/* Query Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <DoumassiLogo className="h-9 w-auto" />
            <div>
              <h2 className="text-white font-medium">Ask AI Anything</h2>
              <p className="text-xs text-white/40">Query your data using natural language</p>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Show me the top 10 customers by revenue in Q4 2025..."
              className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-white/20"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-white/40 hover:text-white">
                <Database className="w-4 h-4" />
              </Button>
              <Button 
                onClick={handleQuery}
                className="bg-white text-black hover:bg-white/90 gap-2"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isProcessing ? 'Processing...' : 'Run Query'}
              </Button>
            </div>
          </div>

          {/* Sample Queries */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-white/30">Try:</span>
            {sampleQueries.map((q) => (
              <button
                key={q}
                onClick={() => setQuery(q)}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-white/50 hover:bg-white/10 hover:text-white/80 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* AI Explanation */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-white/70 font-medium">AI Insight</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                Based on your query, I analyzed the European sales data from our PostgreSQL database. 
                The data shows a <span className="text-white font-medium">23% growth</span> in Q2 compared to Q1, 
                with Germany and France being the top performing regions. I've generated both a visualization 
                and the underlying SQL query for your reference.
              </p>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-medium">Revenue Trend</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const csv = 'month,revenue\n' + salesData.map(d => `${d.month},${d.revenue}`).join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = 'revenue_data.csv'; a.click();
                        URL.revokeObjectURL(url);
                        toast.success('Données exportées en CSV');
                      }}
                      className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                        tickFormatter={(v) => `$${v/1000}k`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.9)', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                        itemStyle={{ color: 'white' }}
                      />
                      <Bar dataKey="revenue" fill="white" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-white font-medium mb-6">Distribution by Product</h3>
                <div className="h-64 flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {pieData.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        <span className="text-xs text-white/60">{item.name}</span>
                        <span className="text-xs text-white/80 font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SQL Query */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-white/40" />
                  <span className="text-sm text-white/70 font-medium">Generated SQL</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`SELECT \n  DATE_TRUNC('month', order_date) as month,\n  SUM(revenue) as total_revenue,\n  COUNT(DISTINCT customer_id) as unique_customers\nFROM sales_data\nWHERE region = 'Europe'\n  AND order_date >= NOW() - INTERVAL '12 months'\nGROUP BY DATE_TRUNC('month', order_date)\nORDER BY month;`);
                    toast.success('SQL copié dans le presse-papier');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors text-sm"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
              <pre className="bg-black/50 rounded-xl p-4 text-xs text-white/70 font-mono overflow-x-auto">
{`SELECT 
  DATE_TRUNC('month', order_date) as month,
  SUM(revenue) as total_revenue,
  COUNT(DISTINCT customer_id) as unique_customers
FROM sales_data
WHERE region = 'Europe'
  AND order_date >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month;`}
              </pre>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}