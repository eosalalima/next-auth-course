import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { validateResetToken } from "./validate-reset-token";
import Link from "next/link";
import UpdatePasswordForm from "./update-password-form";

export default async function UpdatePassword({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {
    const searchParamsValues = await searchParams;
    const { token } = searchParamsValues;

    const tokenIsValid = token ? await validateResetToken(token) : false;

    return (
        <main className="flex justify-center items-center min-h-screen">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>
                        {tokenIsValid
                            ? "Update Your Password"
                            : "Your password reset link is invalid or has expired"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {tokenIsValid ? (
                        <UpdatePasswordForm token={token ?? ""} />
                    ) : (
                        <Link className="underline" href="/password-reset">
                            Request another password reset link
                        </Link>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
