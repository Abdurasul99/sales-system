"use client";
import { useState, useEffect } from "react";
import { OnboardingWizard } from "./OnboardingWizard";

export function OnboardingCheck({ hasProducts, organizationId }: { hasProducts: boolean; organizationId: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!hasProducts) {
      // Small delay so page renders first
      const t = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(t);
    }
  }, [hasProducts]);

  if (!show) return null;
  return <OnboardingWizard organizationId={organizationId} onComplete={() => setShow(false)} />;
}
