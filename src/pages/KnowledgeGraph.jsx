import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import {
  Search, ZoomIn, ZoomOut,
  Maximize2, Download, Share2, Sparkles,
  Users, Building2, FileText, Package
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const entityTypes = [
  { type: 'company', label: 'Companies', count: 234, icon: Building2, color: '#ffffff' },
  { type: 'person', label: 'People', count: 1289, icon: Users, color: '#888888' },
  { type: 'document', label: 'Documents', count: 45892, icon: FileText, color: '#555555' },
  { type: 'product', label: 'Products', count: 567, icon: Package, color: '#333333' }
];

const relationships = [
  { from: 'Acme Corp', to: 'John Smith', relation: 'employs', strength: 95 },
  { from: 'John Smith', to: 'Q4 Report', relation: 'authored', strength: 88 },
  { from: 'Acme Corp', to: 'Product X', relation: 'produces', strength: 100 },
  { from: 'Product X', to: 'Contract 2024', relation: 'mentioned_in', strength: 72 }
];

export default function KnowledgeGraph() {
  const canvasRef = useRef(null);
  const [selectedEntity, setSelectedEntity] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth * 2;
    const height = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    // Create nodes
    const nodes = [];
    const nodeCount = 50;
    
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * (width / 2 - 100) + 50,
        y: Math.random() * (height / 2 - 100) + 50,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 8 + 4,
        type: ['company', 'person', 'document', 'product'][Math.floor(Math.random() * 4)]
      });
    }

    // Create connections
    const connections = [];
    for (let i = 0; i < nodeCount * 1.5; i++) {
      const a = Math.floor(Math.random() * nodeCount);
      const b = Math.floor(Math.random() * nodeCount);
      if (a !== b) {
        connections.push([a, b]);
      }
    }

    const animate = () => {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width / 2, height / 2);

      // Draw connections
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 0.5;
      connections.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(nodes[a].x, nodes[a].y);
        ctx.lineTo(nodes[b].x, nodes[b].y);
        ctx.stroke();
      });

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Apply forces
        nodes.forEach((other, j) => {
          if (i !== j) {
            const dx = other.x - node.x;
            const dy = other.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
              node.vx -= dx / dist * 0.02;
              node.vy -= dy / dist * 0.02;
            }
          }
        });

        // Update position
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.99;
        node.vy *= 0.99;

        // Bounce off walls
        if (node.x < 20 || node.x > width / 2 - 20) node.vx *= -1;
        if (node.y < 20 || node.y > height / 2 - 20) node.vy *= -1;

        // Draw node
        const colors = { company: '#ffffff', person: '#888888', document: '#555555', product: '#aaaaaa' };
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = colors[node.type];
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, 0.05)`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header 
        title="Knowledge Graph" 
        subtitle="AI-powered entity relationships" 
      />
      
      <div className="p-6">
        {/* Entity Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {entityTypes.map((entity, i) => (
            <motion.div
              key={entity.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-4 cursor-pointer hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entity.color }}
                />
                <entity.icon className="w-4 h-4 text-white/40" />
              </div>
              <p className="text-xl font-semibold text-white font-space">{entity.count.toLocaleString()}</p>
              <p className="text-xs text-white/40">{entity.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Graph Canvas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 glass rounded-2xl p-4 overflow-hidden"
          >
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  placeholder="Search entities..."
                  className="w-64 pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toast.info('Zoom avant')} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"><ZoomIn className="w-4 h-4" /></button>
                <button onClick={() => toast.info('Zoom arrière')} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"><ZoomOut className="w-4 h-4" /></button>
                <button onClick={() => toast.info('Mode plein écran')} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"><Maximize2 className="w-4 h-4" /></button>
                <button
                  onClick={() => {
                    const data = JSON.stringify({ entities: entityTypes, relationships }, null, 2);
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = 'knowledge_graph.json'; a.click();
                    URL.revokeObjectURL(url);
                    toast.success('Graphe exporté en JSON');
                  }}
                  className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="relative h-[500px] bg-[#050505] rounded-xl overflow-hidden">
              <canvas ref={canvasRef} className="w-full h-full" />
              
              {/* Legend */}
              <div className="absolute bottom-4 left-4 glass rounded-lg p-3">
                <div className="flex items-center gap-4">
                  {entityTypes.map((entity) => (
                    <div key={entity.type} className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: entity.color }}
                      />
                      <span className="text-[10px] text-white/50">{entity.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Relationships Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="w-4 h-4 text-white/40" />
              <h3 className="text-white font-medium">AI Relationships</h3>
            </div>

            <div className="space-y-3">
              {relationships.map((rel, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-white/70">{rel.from}</span>
                    <span className="text-[10px] text-white/30">→</span>
                    <span className="text-xs text-white/70">{rel.to}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/40 uppercase">{rel.relation.replace('_', ' ')}</span>
                    <span className="text-[10px] text-white/50">{rel.strength}%</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-white/40" />
                <span className="text-xs text-white/60">AI Suggestion</span>
              </div>
              <p className="text-xs text-white/40">
                Consider linking "Product X" with customer feedback documents for better context.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}