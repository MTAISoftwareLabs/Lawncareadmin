import { ReactNode } from "react";
import { MemberGuard } from "@/components/MemberGuard";
import { MemberLayout } from "@/components/MemberLayout";
import { PremiumPaywall } from "@/components/member/PremiumPaywall";
import { useSubscription } from "@/hooks/useSubscription";

export type EmbeddedPageProps = {
  embedded?: boolean;
};

interface MemberPageWrapperProps {
  children: ReactNode;
  guestAllowed?: boolean;
  /** Match mobile app: premium subscription required (login first if needed). */
  premiumRequired?: boolean;
  paywallTitle?: string;
  paywallDescription?: string;
}

function MemberPremiumGate({
  children,
  premiumRequired,
  paywallTitle,
  paywallDescription,
}: {
  children: ReactNode;
  premiumRequired: boolean;
  paywallTitle?: string;
  paywallDescription?: string;
}) {
  const { isPremium } = useSubscription();

  if (!premiumRequired || isPremium) {
    return <>{children}</>;
  }

  return (
    <PremiumPaywall title={paywallTitle} description={paywallDescription} />
  );
}

export function MemberPageWrapper({
  children,
  guestAllowed = false,
  premiumRequired = false,
  paywallTitle,
  paywallDescription,
}: MemberPageWrapperProps) {
  return (
    <MemberGuard guestAllowed={guestAllowed}>
      <MemberLayout>
        <MemberPremiumGate
          premiumRequired={premiumRequired}
          paywallTitle={paywallTitle}
          paywallDescription={paywallDescription}
        >
          {children}
        </MemberPremiumGate>
      </MemberLayout>
    </MemberGuard>
  );
}

export function PageShell({
  embedded,
  children,
}: {
  embedded?: boolean;
  children: ReactNode;
}) {
  return <div className={embedded ? "" : "min-h-screen bg-background"}>{children}</div>;
}

export function PageContainer({
  embedded,
  children,
  className = "",
}: {
  embedded?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={embedded ? className : `container mx-auto px-4 py-8 ${className}`.trim()}>
      {children}
    </div>
  );
}
