import { OnboardingForm, ProtectedPage } from "../../src/components/auth-forms";
export default function OnboardingPage() {
  return (
    <ProtectedPage requireOnboarding={false}>
      <OnboardingForm />
    </ProtectedPage>
  );
}
