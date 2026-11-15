import { getSettings } from "@/features/admin/queries";
import { SettingsForm } from "@/features/admin/components/SettingsForm";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const settings = await getSettings();

  return (
    <SettingsForm 
      initialSettings={settings} 
      saved={saved === "true"} 
    />
  );
}