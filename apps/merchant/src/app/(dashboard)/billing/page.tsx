import { PLANS } from "@/lib/billing";

export default function BillingPage() {
  return (
    <section>
      <h1>Billing</h1>
      <ul>
        {Object.entries(PLANS).map(([key, value]) => (
          <li key={key}>
            {value.name}: {value.amount === 0 ? "Free" : `$${value.amount}/month`} ({String(value.orderLimit)}{" "}
            orders)
          </li>
        ))}
      </ul>
    </section>
  );
}
