// Policy Center minimal : qui peut faire quoi, et sous quelles règles. Lu par l'interface, appliqué par l'API.
export const reasonRequired = () => (process.env.POLICY_REASON_REQUIRED ?? "true") === "true";

export const POLICY = () => ({
  tier: 2,
  rules: [
    { id: "human-decision", fr: "Toute décision est prise et signée par un humain identifié ; VISION AI propose sans jamais exécuter.", en: "Every decision is made and signed by an identified human; VISION AI suggests and never executes." },
    { id: "ledger-append-only", fr: "Le Decision Ledger et le journal d'audit sont en ajout seul : rien n'est modifié ni supprimé.", en: "The Decision Ledger and audit log are append-only: nothing is edited or deleted." },
    { id: "order-is-request", fr: "Une commande est une demande envoyée au fournisseur, sans paiement, tracée comme une décision.", en: "An order is a request sent to the supplier, with no payment, logged as a decision." },
    { id: "sanctions-gate", fr: "Un fournisseur situé dans un pays sous restriction en vigueur ne peut pas être sélectionné pour une commande.", en: "A supplier in a country under an active restriction cannot be selected for an order." },
    ...(reasonRequired() ? [{ id: "reason-required", fr: "Le motif est obligatoire pour toute décision.", en: "A rationale is required for every decision." }] : []),
  ],
  roles: [
    { role: "viewer", fr: "Consulter le globe, les fiches, l'historique ; poser des questions à VISION AI", en: "View the globe, sheets and history; ask VISION AI" },
    { role: "analyst", fr: "Importer les données client ; ouvrir et clore des incidents", en: "Import client data; open and close incidents" },
    { role: "decider", fr: "Signer des décisions ; envoyer des demandes de commande ; ouvrir des incidents", en: "Sign decisions; send order requests; open incidents" },
    { role: "admin", fr: "Tous les droits ; journal d'audit ; restrictions export ; import des données Monde", en: "All rights; audit log; export restrictions; world data import" },
  ],
});
