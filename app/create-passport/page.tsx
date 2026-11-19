import { CreatePassportDemo } from "@/components/interactive/CreatePassportDemo";
import { AppShellMarker } from "@/components/layout/AppShellMarker";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata("createPassport");

export default function CreatePassportPage() {
  return (
    <>
      <AppShellMarker />
      <CreatePassportDemo />
    </>
  );
}
