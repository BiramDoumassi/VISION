// Règles de décision affichées dans le Policy Center. En mode serveur, la version de l'API fait foi (GET /api/policy).
import type { Txt } from "./demo";
export type Policy = { tier: number; rules: ({ id: string } & Txt)[]; roles: ({ role: string } & Txt)[] };
export const LOCAL_POLICY: Policy = {
  tier: 2,
  rules: [
    { id: "human-decision", fr: "Toute décision est prise et signée par un humain identifié ; VISION AI propose sans jamais exécuter.", en: "Every decision is made and signed by an identified human; VISION AI suggests and never executes." },
    { id: "ledger-append-only", fr: "Le Decision Ledger est en ajout seul : rien n'est modifié ni supprimé.", en: "The Decision Ledger is append-only: nothing is edited or deleted." },
    { id: "order-is-request", fr: "Une commande est une demande envoyée au fournisseur, sans paiement, tracée comme une décision.", en: "An order is a request sent to the supplier, with no payment, logged as a decision." },
    { id: "sanctions-gate", fr: "Un fournisseur situé dans un pays sous restriction en vigueur ne peut pas être sélectionné pour une commande.", en: "A supplier in a country under an active restriction cannot be selected for an order." },
    { id: "reason-required", fr: "Le motif est obligatoire pour toute décision.", en: "A rationale is required for every decision." },
  ],
  roles: [],
};
