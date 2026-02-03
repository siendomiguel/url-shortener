import { ForgotPasswordForm } from "@/components/forgot-password-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10 relative">
      <div className="absolute top-8 left-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors group"
        >
          <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
            <ArrowLeft size={18} />
          </div>
          Volver al inicio
        </Link>
      </div>
      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
