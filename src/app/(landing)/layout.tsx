import Header from "@/components/Header";
import Wrapper from "@/components/Wrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Header />
      <Wrapper>{children}</Wrapper>
    </div>
  );
}
