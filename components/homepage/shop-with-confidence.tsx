import {
  GooglePayIcon,
  MastercardIcon,
  PayPalIcon,
  VisaIcon,
} from "@/components/homepage/payment-icons";

const paymentMethods = [
  { id: "visa", Icon: VisaIcon },
  { id: "mastercard", Icon: MastercardIcon },
  { id: "paypal", Icon: PayPalIcon },
  { id: "google-pay", Icon: GooglePayIcon },
] as const;

export function ShopWithConfidence() {
  return (
    <section className="border-t border-saltwater bg-white py-10">
      <div className="site-shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h2 className="section-heading">Shop with confidence</h2>
            <p className="max-w-xl text-sm text-slate-grey">
              Secure checkout powered by integrated payment services.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {paymentMethods.map(({ id, Icon }) => (
              <Icon key={id} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
