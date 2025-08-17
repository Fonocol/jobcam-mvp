import { authConfig } from "@/auth.config";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authConfig);
  if (session?.user.role === 'RECRUITER' && session.user.companyId) {
    redirect(`/companies/${session.user.companyId}`);
  }
  else{
    redirect("/jobs");
  }
  
}