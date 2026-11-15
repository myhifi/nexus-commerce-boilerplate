import { createUser } from "@/features/admin/user-actions";
import { UserForm } from "@/features/admin/components/UserForm";

export default function NewUserPage() {
  return <UserForm action={createUser} />;
}