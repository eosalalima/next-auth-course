import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Register() {
    return <main className="flex justify-center items-center min-h-screen ">
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>Register for a new account.</CardDescription>
            </CardHeader>
        </Card>
    </main>;
}