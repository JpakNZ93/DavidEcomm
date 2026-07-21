import type { ReactNode } from "react";

function PaymentIconFrame({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      className="flex h-12 min-w-[5.5rem] items-center justify-center rounded-md border border-gray-200 bg-white px-4"
      aria-label={label}
      role="img"
    >
      {children}
    </div>
  );
}

export function VisaIcon() {
  return (
    <PaymentIconFrame label="Visa">
      <svg viewBox="0 0 48 16" className="h-4 w-12" aria-hidden="true">
        <text
          x="0"
          y="12"
          fill="#1A1F71"
          fontFamily="Arial, sans-serif"
          fontSize="14"
          fontWeight="700"
          letterSpacing="0.08em"
        >
          VISA
        </text>
      </svg>
    </PaymentIconFrame>
  );
}

export function MastercardIcon() {
  return (
    <PaymentIconFrame label="Mastercard">
      <svg viewBox="0 0 40 24" className="h-6 w-10" aria-hidden="true">
        <circle cx="15" cy="12" r="9" fill="#EB001B" />
        <circle cx="25" cy="12" r="9" fill="#F79E1B" fillOpacity="0.95" />
      </svg>
    </PaymentIconFrame>
  );
}

export function PayPalIcon() {
  return (
    <PaymentIconFrame label="PayPal">
      <svg viewBox="0 0 72 18" className="h-4 w-16" aria-hidden="true">
        <text
          x="0"
          y="14"
          fill="#003087"
          fontFamily="Arial, sans-serif"
          fontSize="13"
          fontWeight="700"
        >
          Pay
        </text>
        <text
          x="24"
          y="14"
          fill="#009CDE"
          fontFamily="Arial, sans-serif"
          fontSize="13"
          fontWeight="700"
        >
          Pal
        </text>
      </svg>
    </PaymentIconFrame>
  );
}

export function GooglePayIcon() {
  return (
    <PaymentIconFrame label="Google Pay">
      <svg viewBox="0 0 72 18" className="h-4 w-16" aria-hidden="true">
        <text
          x="0"
          y="14"
          fill="#5F6368"
          fontFamily="Arial, sans-serif"
          fontSize="12"
          fontWeight="600"
        >
          G
        </text>
        <text
          x="12"
          y="14"
          fill="#4285F4"
          fontFamily="Arial, sans-serif"
          fontSize="12"
          fontWeight="600"
        >
          Pay
        </text>
      </svg>
    </PaymentIconFrame>
  );
}
