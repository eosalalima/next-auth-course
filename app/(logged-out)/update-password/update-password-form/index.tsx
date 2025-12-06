"use client";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { passwordMatchSchema } from "@/validation/passwordMatchSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { toast } from "sonner";
import { redirect } from "next/navigation";
import { updatePassword } from "./actions";
import Link from "next/link";

const formSchema = passwordMatchSchema;

type Props = {
    token: string;
};

export default function UpdatePasswordForm({ token }: Props) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        const response = await updatePassword({
            token,
            password: data.password,
            passwordConfirm: data.confirmPassword,
        });

        if (response?.tokenInvalid) {
            window.location.reload();
        }

        if (response?.error) {
            form.setError("root", { message: response.message });
        } else {
            toast.success("Password changed successfully!");
            form.reset();
            redirect("/my-account");
        }

        console.log(response);
    };

    return form.formState.isSubmitSuccessful ? (
        <div>
            Your password has been updated successfully. You can now log in{" "}
            <Link className="underline" href="/login">
                Click here to login to your account
            </Link>
        </div>
    ) : (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <fieldset
                    disabled={form.formState.isSubmitting}
                    className="flex flex-col gap-4"
                >
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                    <Input {...field} type="password" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                    <Input {...field} type="password" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {!!form.formState.errors.root?.message && (
                        <FormMessage>
                            {form.formState.errors.root?.message}
                        </FormMessage>
                    )}
                    <Button type="submit">Update Password</Button>
                </fieldset>
            </form>
        </Form>
    );
}
