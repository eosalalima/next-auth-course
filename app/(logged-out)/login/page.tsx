"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { passwordSchema } from "@/validation/passwordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginWithCredentials, preLoginCheck } from "./actions";
import { useRouter } from "next/dist/client/components/navigation";
import Link from "next/link";
import { useState } from "react";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    InputOTPSeparator,
} from "@/components/ui/input-otp";
import { toast } from "sonner";

const formSchema = z.object({
    email: z.email("Invalid email address"),
    password: passwordSchema,
});

export default function Login() {
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState("");
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        const preLoginCheckResponse = await preLoginCheck({
            email: data.email,
            password: data.password,
        });

        if (preLoginCheckResponse?.error) {
            form.setError("root", {
                message: preLoginCheckResponse.message,
            });
            return;
        }

        if (preLoginCheckResponse?.twoFactorActivated) {
            setStep(2);
        } else {
            const response = await loginWithCredentials({
                email: data.email,
                password: data.password,
            });

            if (response?.error) {
                form.setError("root", {
                    message: response.message,
                });
            } else {
                router.push("/my-account");
            }
        }
    };

    const email = form.watch("email");

    const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const response = await loginWithCredentials({
            email: form.getValues("email"),
            password: form.getValues("password"),
            token: otp,
        });

        if (response?.error) {
            toast.error(response.message);
            return;
        } else {
            router.push("/my-account");
        }
    };

    return (
        <main className="flex justify-center items-center min-h-screen ">
            {step === 1 && (
                <Card className="w-[350px]">
                    <CardHeader>
                        <CardTitle>Login</CardTitle>
                        <CardDescription>
                            Login to your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)}>
                                <fieldset
                                    disabled={form.formState.isSubmitting}
                                    className="flex flex-col gap-4"
                                >
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="password"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {form.formState.errors.root && (
                                        <FormMessage>
                                            {form.formState.errors.root.message}
                                        </FormMessage>
                                    )}

                                    <Button type="submit">Login</Button>
                                </fieldset>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <div className="text-muted-foreground text-sm">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/register"
                                className="text-primary underline"
                            >
                                Register
                            </Link>
                        </div>
                        <div className="text-muted-foreground text-sm">
                            Forgot password?{" "}
                            <Link
                                href={`/password-reset${
                                    email
                                        ? `?email=${encodeURIComponent(email)}`
                                        : ""
                                }`}
                                className="text-primary underline"
                            >
                                Reset my password
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            )}
            {step === 2 && (
                <Card className="w-[350px]">
                    <CardHeader>
                        <CardTitle>One-Time Passcode</CardTitle>
                        <CardDescription>
                            Enter the one-time passcode displayed in your Google
                            Authenticator app.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            className="flex flex-col gap-2"
                            onSubmit={handleOTPSubmit}
                        >
                            <InputOTP
                                className="mt-3"
                                maxLength={6}
                                value={otp}
                                onChange={setOtp}
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup>
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                            <Button type="submit" disabled={otp.length !== 6}>
                                Verify OTP
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}
        </main>
    );
}
