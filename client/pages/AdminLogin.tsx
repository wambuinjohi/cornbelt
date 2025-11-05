import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { LogIn } from "lucide-react";

interface LoginFormData {
  email: string;
  password: string;
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api.php?action=admin_login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      let result: any = null;
      let responseText: string | null = null;

      // Always attempt to parse JSON, but fall back gracefully
      try {
        result = await response.clone().json();
      } catch (e) {
        try {
          responseText = await response.clone().text();
        } catch (e2) {
          responseText = null;
        }
      }

      if (!response.ok) {
        // Prefer explicit error from JSON, then raw text, then status
        const errMsg =
          result && typeof result === "object" && "error" in result
            ? result.error
            : responseText
            ? responseText
            : `Login failed (status ${response.status})`;
        throw new Error(errMsg);
      }

      // Store token in localStorage
      localStorage.setItem("adminToken", result?.token);
      localStorage.setItem("adminUser", JSON.stringify(result?.user));

      toast.success("Login successful!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-background p-8 rounded-lg border border-primary/10 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Admin Login
            </h1>
            <p className="text-muted-foreground">
              Sign in to access the admin dashboard
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@cornbeltmill.com"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                rules={{
                  required: "Password is required",
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            First time here?{" "}
            <Link
              to="/admin/setup"
              className="text-primary hover:underline font-semibold"
            >
              Create an admin account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
