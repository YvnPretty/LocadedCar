import TapPaymentClient from "./TapPaymentClient";

export default async function TapPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TapPaymentClient sessionId={id} />;
}
