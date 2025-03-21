'use client';

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email({
    message: "Geçerli bir email adresi giriniz.",
  }),
  password: z.string().min(1, {
    message: "Şifre alanı boş bırakılamaz.",
  }),
});

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    // Determine if this is likely an admin user
    const isAdminEmail = values.email.includes("admin") || values.email === "admin@example.com";
    
    // Determine the callback URL based on user role and existing callbackUrl
    const targetCallbackUrl = callbackUrl || (isAdminEmail ? "/admin/dashboard" : "/user/dashboard");
    
    console.log("Login attempt with:", { 
      email: values.email, 
      callbackUrl: targetCallbackUrl
    });
  
    try {
      console.log("About to call signIn with credentials");
      
      // Use redirect: true to let NextAuth handle the session and redirect
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: true, // Changed to true - let NextAuth handle redirects
        callbackUrl: targetCallbackUrl,
      });
      
      // This code won't execute if redirect: true since the page will navigate away
      console.log("SignIn result (should not see this if redirect worked):", result);
      
      toast.success("Giriş başarılı! Yönlendiriliyorsunuz...");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Giriş sırasında bir hata oluştu");
      setIsLoading(false);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="ornek@email.com" {...field} />
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
              <FormLabel>Şifre</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600" disabled={isLoading}>
          {isLoading ? "Giriş yapılıyor..." : "Giriş yap"}
        </Button>
      </form>
    </Form>
  );
}