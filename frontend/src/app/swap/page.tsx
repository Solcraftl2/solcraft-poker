
import { PageHeader } from "@/components/shared/page-header";
import { SwapForm } from "@/components/swap/swap-form";
import { Card, CardContent } from "@/components/ui/card";

export default function SwapPage() {
  return (
    <>
      <PageHeader
        title="Swap Tokens"
        description="Exchange your cryptocurrencies seamlessly."
      />
      <div className="flex justify-center">
        <Card className="w-full max-w-lg shadow-xl">
          <CardContent className="p-0">
            <SwapForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
