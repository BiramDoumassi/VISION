import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import { 
  User, Shield, Bell, Key, 
  CreditCard, Users, Building2, Code, Webhook,
  ChevronRight, Check, Copy, Eye, EyeOff,
  Trash2, Plus, Mail, Smartphone, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const tabs = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'security', label: 'Sécurité', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'team', label: 'Équipe', icon: Users },
  { id: 'api', label: 'API & Dev', icon: Key },
  { id: 'billing', label: 'Facturation', icon: CreditCard },
];

const teamMembers = [
  { name: 'Alice Martin', email: 'alice@company.com', role: 'Admin', status: 'active' },
  { name: 'Bob Dupont', email: 'bob@company.com', role: 'Data Manager', status: 'active' },
  { name: 'Claire Lefèvre', email: 'claire@company.com', role: 'Analyst', status: 'active' },
  { name: 'David Chen', email: 'david@company.com', role: 'Viewer', status: 'invited' },
];

const roleColors = {
  'Admin': 'bg-red-500/20 text-red-400',
  'Data Manager': 'bg-blue-500/20 text-blue-400',
  'Analyst': 'bg-emerald-500/20 text-emerald-400',
  'Viewer': 'bg-white/10 text-white/50',
};

const apiKeys = [
  { name: 'Production Key', key: 'vs_prod_xK9m...8fGz', created: '15 jan. 2026', lastUsed: 'Il y a 2h' },
  { name: 'Dev / Staging', key: 'vs_dev_aR3n...7cBv', created: '3 fév. 2026', lastUsed: 'Il y a 5 jours' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showKey, setShowKey] = useState({});
  const [preferences, setPreferences] = useState({
    ai_suggestions: true,
    realtime_sync: true,
    analytics: false,
    email_digest: true,
    slack_alerts: false,
    mobile_push: true,
  });

  const togglePref = (key) => setPreferences(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="min-h-screen bg-[#050505]">
      <Header title="Settings" subtitle="Gérez vos préférences et votre organisation" />

      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex gap-6">
          {/* Tab sidebar */}
          <motion.aside initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="w-48 shrink-0">
            <div className="glass rounded-2xl p-2 space-y-0.5">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.aside>

          {/* Content */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 space-y-5">

            {/* Profile */}
            {activeTab === 'profile' && (
              <>
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-white/80 mb-5">Informations personnelles</h3>
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold text-white/60 font-space">A</div>
                    <div>
                      <p className="text-sm font-medium text-white">Alice Martin</p>
                      <p className="text-xs text-white/40">alice@company.com</p>
                      <button className="text-xs text-white/30 hover:text-white/60 mt-1 transition-colors">Changer la photo</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/40 mb-1.5 block">Prénom</label>
                      <Input defaultValue="Alice" className="bg-white/5 border-white/10 text-white h-9" />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1.5 block">Nom</label>
                      <Input defaultValue="Martin" className="bg-white/5 border-white/10 text-white h-9" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-white/40 mb-1.5 block">Email</label>
                      <Input defaultValue="alice@company.com" className="bg-white/5 border-white/10 text-white h-9" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-white/40 mb-1.5 block">Organisation</label>
                      <Input defaultValue="Acme Corp" className="bg-white/5 border-white/10 text-white h-9" />
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end">
                    <Button onClick={() => toast.success('Profil enregistré avec succès')} className="bg-white text-black hover:bg-white/90 font-semibold h-9 px-6">
                      <Check className="w-4 h-4 mr-2" /> Enregistrer
                    </Button>
                  </div>
                </div>

                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-white/80 mb-4">Langue & Région</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[{ label: 'Langue', value: 'Français' }, { label: 'Fuseau horaire', value: 'Europe/Paris (UTC+2)' }].map(f => (
                      <div key={f.label}>
                        <label className="text-xs text-white/40 mb-1.5 block">{f.label}</label>
                        <div className="h-9 px-3 flex items-center bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 cursor-pointer hover:bg-white/8 transition-colors">
                          {f.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <>
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-white/80 mb-5">Mot de passe</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-white/40 mb-1.5 block">Mot de passe actuel</label>
                      <Input type="password" placeholder="••••••••" className="bg-white/5 border-white/10 text-white h-9" />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1.5 block">Nouveau mot de passe</label>
                      <Input type="password" placeholder="••••••••" className="bg-white/5 border-white/10 text-white h-9" />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1.5 block">Confirmer</label>
                      <Input type="password" placeholder="••••••••" className="bg-white/5 border-white/10 text-white h-9" />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => toast.success('Mot de passe modifié')} className="bg-white text-black hover:bg-white/90 font-semibold h-9 px-6">Changer le mot de passe</Button>
                  </div>
                </div>

                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-sm font-semibold text-white/80">Authentification à deux facteurs (2FA)</h3>
                      <p className="text-xs text-white/40 mt-0.5">Renforcez la sécurité de votre compte</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex gap-3">
                    {[
                      { icon: Smartphone, label: 'Authenticator App', active: true },
                      { icon: Mail, label: 'Email OTP', active: false },
                    ].map(m => (
                      <div key={m.label} className={`flex-1 flex items-center gap-3 p-3 rounded-xl border ${m.active ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-white/[0.02]'}`}>
                        <m.icon className={`w-4 h-4 ${m.active ? 'text-emerald-400' : 'text-white/30'}`} />
                        <span className={`text-xs font-medium ${m.active ? 'text-emerald-300' : 'text-white/40'}`}>{m.label}</span>
                        {m.active && <span className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">Actif</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-white/80 mb-4">Sessions actives</h3>
                  <div className="space-y-3">
                    {[
                      { device: 'Chrome — MacBook Pro', location: 'Paris, France', current: true, time: 'Session actuelle' },
                      { device: 'Safari — iPhone 15', location: 'Lyon, France', current: false, time: 'Il y a 2 jours' },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm text-white/70 font-medium">{s.device}</p>
                          <p className="text-xs text-white/30">{s.location} · {s.time}</p>
                        </div>
                        {s.current
                          ? <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full">Actuelle</span>
                          : <button onClick={() => toast.success('Session révoquée')} className="text-xs text-red-400/60 hover:text-red-400 transition-colors">Révoquer</button>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="glass rounded-2xl divide-y divide-white/5">
                {[
                  { key: 'ai_suggestions', label: 'Suggestions IA', desc: 'Recommandations automatiques pendant votre travail', icon: Globe },
                  { key: 'realtime_sync', label: 'Synchronisation temps réel', desc: 'Maintenir les données synchronisées sur tous les appareils', icon: Globe },
                  { key: 'email_digest', label: 'Digest email hebdomadaire', desc: 'Résumé de votre activité chaque lundi matin', icon: Mail },
                  { key: 'slack_alerts', label: 'Alertes Slack', desc: 'Notifications des incidents et anomalies dans Slack', icon: Globe },
                  { key: 'mobile_push', label: 'Notifications push mobile', desc: 'Alertes critiques sur votre téléphone', icon: Smartphone },
                  { key: 'analytics', label: 'Amélioration du produit', desc: "Partager des données d'usage anonymes pour améliorer VISION", icon: Globe },
                ].map(pref => (
                  <div key={pref.key} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-white/80">{pref.label}</p>
                      <p className="text-xs text-white/40">{pref.desc}</p>
                    </div>
                    <Switch checked={preferences[pref.key]} onCheckedChange={() => togglePref(pref.key)} />
                  </div>
                ))}
              </div>
            )}

            {/* Team */}
            {activeTab === 'team' && (
              <>
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold text-white/80">Membres de l&apos;équipe ({teamMembers.length})</h3>
                    <Button onClick={() => toast.success('Invitation envoyée')} className="bg-white text-black hover:bg-white/90 font-semibold h-8 px-4 text-xs gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Inviter
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {teamMembers.map(member => (
                      <div key={member.email} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold text-white/50">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm text-white/80 font-medium">{member.name}</p>
                            <p className="text-xs text-white/35">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {member.status === 'invited' && (
                            <span className="text-xs text-amber-400/70 bg-amber-500/10 px-2 py-0.5 rounded-full">Invitation en attente</span>
                          )}
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleColors[member.role]}`}>{member.role}</span>
                          <button className="text-white/20 hover:text-red-400/60 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-white/80 mb-4">Rôles & permissions</h3>
                  <div className="space-y-3">
                    {[
                      { role: 'Admin', perms: ['Accès total', 'Gestion utilisateurs', 'Paramètres org.'], color: roleColors['Admin'] },
                      { role: 'Data Manager', perms: ['Lecture/écriture données', 'Connecteurs', 'Pipelines'], color: roleColors['Data Manager'] },
                      { role: 'Analyst', perms: ['Lecture données', 'Requêtes AI', 'Rapports'], color: roleColors['Analyst'] },
                      { role: 'Viewer', perms: ['Visualisation uniquement', 'Export restreint'], color: roleColors['Viewer'] },
                    ].map(r => (
                      <div key={r.role} className="flex items-start justify-between py-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${r.color}`}>{r.role}</span>
                        <p className="text-xs text-white/35 text-right">{r.perms.join(' · ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* API */}
            {activeTab === 'api' && (
              <>
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold text-white/80">Clés API</h3>
                    <Button className="bg-white text-black hover:bg-white/90 font-semibold h-8 px-4 text-xs gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Nouvelle clé
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {apiKeys.map((k, i) => (
                      <div key={i} className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <div>
                          <p className="text-sm font-medium text-white/80">{k.name}</p>
                          <p className="text-xs text-white/30 mt-0.5">Créée le {k.created} · Utilisée {k.lastUsed}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-white/40 font-mono bg-white/5 px-2.5 py-1 rounded">
                            {showKey[i] ? 'vs_prod_xK9m7fGz...' : k.key}
                          </code>
                          <button onClick={() => setShowKey(s => ({ ...s, [i]: !s[i] }))} className="text-white/20 hover:text-white/60 transition-colors">
                            {showKey[i] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => { navigator.clipboard.writeText(k.key); toast.success('Clé API copiée'); }}
                            className="text-white/20 hover:text-white/60 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toast.error(`Clé "${k.name}" supprimée`)}
                            className="text-white/20 hover:text-red-400/60 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-white/80 mb-4">Webhooks</h3>
                  <div className="py-8 text-center border border-dashed border-white/10 rounded-xl">
                    <Webhook className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    <p className="text-sm text-white/40">Aucun webhook configuré</p>
                    <Button className="mt-4 border border-white/10 bg-transparent text-white/60 hover:bg-white/5 h-8 px-4 text-xs gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Ajouter un webhook
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Billing */}
            {activeTab === 'billing' && (
              <>
                <div className="glass rounded-2xl p-6 border border-white/10">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Offre actuelle</p>
                      <h3 className="text-2xl font-bold text-white font-space">VISION Business</h3>
                      <p className="text-white/50 mt-1">299 € / mois · Renouvellement le 15 juil. 2026</p>
                    </div>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full">Actif</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { label: 'Sources connectées', value: '7 / 10' },
                      { label: 'Stockage utilisé', value: '42 GB / 100 GB' },
                      { label: 'Utilisateurs', value: '4 / 10' },
                    ].map(s => (
                      <div key={s.label} className="bg-white/[0.02] rounded-xl p-3">
                        <p className="text-base font-semibold text-white font-space">{s.value}</p>
                        <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <Button className="border border-white/10 bg-transparent text-white hover:bg-white/5 font-medium h-9 px-6">
                    Passer à Enterprise <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-white/80 mb-4">Historique de facturation</h3>
                  <div className="space-y-2">
                    {[
                      { date: '15 juin 2026', amount: '299,00 €', status: 'Payé' },
                      { date: '15 mai 2026', amount: '299,00 €', status: 'Payé' },
                      { date: '15 avr. 2026', amount: '299,00 €', status: 'Payé' },
                    ].map((inv, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                        <span className="text-sm text-white/60">{inv.date}</span>
                        <span className="text-sm font-medium text-white/80">{inv.amount}</span>
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full">{inv.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Danger Zone */}
            <div className="glass rounded-2xl p-4 border border-red-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Supprimer le compte</p>
                  <p className="text-xs text-white/40">Suppression définitive de votre compte et de toutes les données</p>
                </div>
                <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-9">
                  Supprimer
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}