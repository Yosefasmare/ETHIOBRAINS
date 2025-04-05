import SubscriptionRequierd from "@/components/SubscriptionRequired";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
      <SubscriptionRequierd > 
        {children}
      </SubscriptionRequierd>
  
  );
}
