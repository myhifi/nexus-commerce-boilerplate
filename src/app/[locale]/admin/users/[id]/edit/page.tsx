import { notFound } from "next/navigation";
import { getAdminUserById } from "@/features/admin/queries";
import { updateUser } from "@/features/admin/user-actions";
import { UserForm } from "@/features/admin/components/UserForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditUserPage({ params }: Props) {
  const { id } = await params;

  const user = await getAdminUserById(id);

  if (!user) {
    notFound();
  }

  const updateActionWithId = updateUser.bind(null, user.id);
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };

  return (
    <UserForm 
      user={safeUser} 
      action={updateActionWithId} 
    />
  );
}