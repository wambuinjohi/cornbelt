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
      // Try Node/Express endpoint first (used in dev). If it fails with a 'Missing \"table\"' error or 404, fall back to PHP endpoint.
      // Try PHP endpoint first (typical for Apache deployments), then Node endpoint as fallback
      const tryEndpoints = [
        { url: "/api.php?action=admin_login", usePhpFallback: true },
        { url: "/api/admin/login", usePhpFallback: false },
      ];

      let lastError: any = null;
      let successResult: any = null;

      for (const ep of tryEndpoints) {
        try {
          const response = await fetch(ep.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          const contentType = response.headers.get("content-type") || "";

          let result: any = null;
          let responseText: string | null = null;
          try {
            if (contentType.includes("application/json")) {
              result = await response.clone().json();
            } else {
              responseText = await response.clone().text();
            }
          } catch (e) {
            try {
              responseText = await response.clone().text();
            } catch (e2) {
              responseText = null;
            }
          }

          // If the response indicates the generic php emulation 'missing table' or similar, or returned HTML/404, try next
          const serverErr = result?.error || responseText || null;
          const serverErrLower =
            typeof serverErr === "string" ? serverErr.toLowerCase() : "";
          const looksLikeTableError =
            serverErrLower.includes("table") ||
            serverErrLower.includes("table name") ||
            serverErrLower.includes("missing");
          const looksLikeHtml =
            typeof responseText === "string" && responseText.trim().startsWith("<");

          if (!response.ok) {
            // If this looks like a routing/mapping error (404) or the response is HTML (served index.html) or a generic table error,
            // treat it as a miss and continue to the next endpoint (try both php and node in order)
            if (
              response.status === 404 ||
              response.status === 502 ||
              looksLikeTableError ||
              looksLikeHtml ||
              contentType.includes("text/html")
            ) {
              lastError = { status: response.status, message: serverErr };
              continue; // try next endpoint
            }

            // Otherwise treat as permanent error — normalize to string
            let errMsgStr = `Login failed (status ${response.status})`;
            if (result && typeof result === "object" && "error" in result) {
              if (typeof result.error === "string") errMsgStr = result.error;
              else errMsgStr = JSON.stringify(result.error);
            } else if (responseText) {
              errMsgStr = responseText;
            }
            throw new Error(errMsgStr);
          }

          // success — ensure we parse JSON result if possible
          let successObj: any = null;
          if (result) successObj = result;
          else if (responseText) {
            try {
              successObj = JSON.parse(responseText);
            } catch {
              successObj = null;
            }
          }

          // If the success response does not look like a token payload, treat as failure
          if (!successObj || !successObj.token) {
            lastError = { status: response.status, message: successObj || responseText };
            continue;
          }

          successResult = successObj;
          break;
        } catch (err) {
          lastError = err;
          // if this was the first endpoint, continue to try php fallback
          continue;
        }
      }

      if (!successResult) {
        // Normalize lastError into a readable message
        let msg = "Login failed";
        try {
          if (!lastError) msg = "Login failed";
          else if (typeof lastError === "string") msg = lastError;
          else if (lastError instanceof Error) msg = lastError.message;
          else if (lastError && typeof lastError === "object") msg = JSON.stringify(lastError);
        } catch (e) {
          msg = "Login failed";
        }
        throw new Error(msg);
      }

      // Store token in localStorage
      localStorage.setItem("adminToken", successResult?.token);
      localStorage.setItem("adminUser", JSON.stringify(successResult?.user));

      toast.success("Login successful!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      // Build readable message for toast
      let msg = "Failed to login";
      if (error instanceof Error) msg = error.message;
      else if (error && typeof error === "object") {
        try {
          msg = JSON.stringify(error);
        } catch {
          msg = String(error);
        }
      } else if (typeof error === "string") msg = error;
      // Truncate very long messages
      if (msg && msg.length > 1000) msg = msg.slice(0, 1000) + "...";
      toast.error(msg || "Failed to login");
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
