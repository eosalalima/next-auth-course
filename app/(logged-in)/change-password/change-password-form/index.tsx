"use client";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { passwordMatchSchema } from "@/validation/passwordMatchSchema";
import { passwordSchema } from "@/validation/passwordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { ChangePassword } from "./actions";
import { toast } from "sonner";
import { redirect } from "next/navigation";

const formSchema = z.object({
    currentPassword: passwordSchema
}).and(passwordMatchSchema);

export default function ChangePasswordForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentPassword: "",
            password: "",
            confirmPassword: ""
        }
    });
    
    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        const response = await ChangePassword({
            currentPassword: data.currentPassword,
            password: data.password,
            passwordConfirm: data.confirmPassword
        });

        if (response?.error) {
            form.setError("root", { message: response.message });            
        } else {            
            toast.success("Password changed successfully!");
            form.reset();
            redirect("/my-account");
        }

        console.log(response);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <fieldset disabled={form.formState.isSubmitting} className="flex flex-col gap-4">
                    <FormField 
                        control={form.control}                                    
                        name="currentPassword" 
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                    <Input {...field} type="password" />
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
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <Input {...field} type="password" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}                            
                    />
                    {
                        !!form.formState.errors.root?.message && (
                            <FormMessage>{form.formState.errors.root?.message}</FormMessage>
                        )                        
                    }
                    <Button type="submit">
                        Change Password
                    </Button>     
                </fieldset>                   
            </form>
        </Form>
    );
}
