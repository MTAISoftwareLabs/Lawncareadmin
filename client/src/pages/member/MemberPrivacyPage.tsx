import { useQuery } from "@tanstack/react-query";
import { MemberLayout } from "@/components/MemberLayout";
import { MemberGuard } from "@/components/MemberGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface PrivacySection {
  heading: string;
  text: string;
}

function PrivacyContent({ title }: { title: string }) {
  const { data, isLoading } = useQuery<{ data: PrivacySection[] }>({
    queryKey: ["/api/privacy-content"],
  });

  const sections = data?.data ?? [];

  return (
    <MemberLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">Managed from the admin dashboard</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : sections.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No content published yet.
            </CardContent>
          </Card>
        ) : (
          sections.map((section, index) => (
            <Card key={`${section.heading}-${index}`}>
              <CardHeader>
                <CardTitle className="text-lg">{section.heading}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap dark:prose-invert">
                  {section.text}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </MemberLayout>
  );
}

export function MemberPrivacyPage() {
  return (
    <MemberGuard guestAllowed>
      <PrivacyContent title="Privacy policy" />
    </MemberGuard>
  );
}

export function MemberRulesPage() {
  return (
    <MemberGuard guestAllowed>
      <PrivacyContent title="Community rules" />
    </MemberGuard>
  );
}
