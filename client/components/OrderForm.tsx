import { useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

interface OrderFormData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  product: string;
  size: string;
  quantity: string;
  deliveryDate: string;
  notes: string;
}

export default function OrderForm({
  isOpen,
  onClose,
  productName,
}: OrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OrderFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      product: productName || "Jirani Maize Meal",
      size: "2kg",
      quantity: "1",
      deliveryDate: "",
      notes: "",
    },
  });

  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          quantity: parseInt(data.quantity),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit order");
      }

      form.reset();
      toast.success("Order submitted successfully! We'll contact you shortly.");
      onClose();
    } catch (error) {
      console.error("Order form error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit order",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary/10">
          <h2 className="text-2xl font-bold text-foreground">
            Place Your Order
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-6 space-y-6 max-h-96 overflow-y-auto"
          >
            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              rules={{
                required: "Full name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              rules={{
                required: "Phone number is required",
                pattern: {
                  value:
                    /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
                  message: "Invalid phone number format",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+254 (0) 123 456 789"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              rules={{
                required: "Location is required",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location/City *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nairobi"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Product */}
            <FormField
              control={form.control}
              name="product"
              rules={{
                required: "Product is required",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Jirani Maize Meal">
                        Jirani Maize Meal
                      </SelectItem>
                      <SelectItem value="Tabasamu Maize Meal">
                        Tabasamu Maize Meal
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Size */}
            <FormField
              control={form.control}
              name="size"
              rules={{
                required: "Size is required",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Size *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="2kg">2kg</SelectItem>
                      <SelectItem value="25kg">25kg</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantity */}
            <FormField
              control={form.control}
              name="quantity"
              rules={{
                required: "Quantity is required",
                pattern: {
                  value: /^[0-9]+$/,
                  message: "Must be a valid number",
                },
                validate: (value) => {
                  const num = parseInt(value);
                  return num > 0 ? true : "Quantity must be greater than 0";
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Delivery Date */}
            <FormField
              control={form.control}
              name="deliveryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Delivery Date</FormLabel>
                  <FormControl>
                    <Input type="date" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Notes/Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special instructions or notes..."
                      disabled={isSubmitting}
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-primary/10 bg-primary/5">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
