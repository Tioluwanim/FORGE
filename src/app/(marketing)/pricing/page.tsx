import Link from "next/link";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    tagline: "Learn the fundamentals, no card required.",
    features: [
      "1 language track",
      "Limited code executions / day",
      "Core roadmap & documentation",
      "Community AI mentor hints",
    ],
  },
  {
    name: "Pro",
    price: "$19",
    tagline: "For serious, sustained practice.",
    featured: true,
    features: [
      "All 3 language tracks",
      "Unlimited code executions",
      "Full AI mentor access",
      "Production & debugging labs",
      "Portfolio-ready project history",
    ],
  },
  {
    name: "Teams",
    price: "Custom",
    tagline: "Cohort-based upskilling with shared visibility.",
    features: [
      "Everything in Pro",
      "Team progress dashboards",
      "Seat management",
      "Priority support",
    ],
  },
  {
    name: "Education",
    price: "Custom",
    tagline: "For universities and bootcamps.",
    features: [
      "Everything in Teams",
      "Cohort curriculum alignment",
      "Instructor visibility",
      "Discounted seat pricing",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-ember">Pricing</p>
        <h1 className="mt-3 font-display text-4xl font-medium text-text">
          Start free. Upgrade when the friction is worth it.
        </h1>
      </div>

      <div className="mt-16 grid gap-5 md:grid-cols-4">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-col rounded-md border p-6 ${
              plan.featured ? "border-ember bg-ember/[0.04]" : "border-hairline bg-surface"
            }`}
          >
            <p className="font-display text-lg text-text">{plan.name}</p>
            <p className="mt-3 font-display text-3xl text-text">{plan.price}</p>
            <p className="mt-1 text-xs text-text-faint">
              {plan.price !== "Custom" && plan.price !== "$0" ? "per month" : "\u00A0"}
            </p>
            <p className="mt-3 text-sm text-text-muted">{plan.tagline}</p>
            <ul className="mt-6 flex-1 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-text-muted">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-pass" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className={`mt-6 rounded-md px-4 py-2.5 text-center text-sm font-medium ${
                plan.featured
                  ? "bg-ember text-void hover:bg-ember-glow"
                  : "border border-hairline text-text hover:border-text-faint"
              }`}
            >
              {plan.price === "Custom" ? "Contact us" : "Get started"}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
