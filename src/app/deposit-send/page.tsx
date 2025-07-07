import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DepositForm } from "@/components/deposit-send/deposit-form";
import { SendForm } from "@/components/deposit-send/send-form";

export default function DepositSendPage() {
  return (
    <>
      <PageHeader
        title="Deposit & Send"
        description="Securely manage your crypto assets."
      />
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardContent className="p-0">
          <Tabs defaultValue="deposit" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-t-lg rounded-b-none h-14">
              <TabsTrigger value="deposit" className="text-base py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-tl-md rounded-tr-none rounded-bl-none rounded-br-none">
                Deposit
              </TabsTrigger>
              <TabsTrigger value="send" className="text-base py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-tr-md rounded-tl-none rounded-br-none rounded-bl-none">
                Send
              </TabsTrigger>
            </TabsList>
            <TabsContent value="deposit" className="p-6 md:p-8">
              <DepositForm />
            </TabsContent>
            <TabsContent value="send" className="p-6 md:p-8">
              <SendForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
