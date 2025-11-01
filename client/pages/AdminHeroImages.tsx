import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, Upload, Trash2, Eye, FileUp } from "lucide-react";

interface HeroImage {
  id: number;
  filename: string;
  imageUrl: string;
  altText: string;
  displayOrder: number;
  createdAt: string;
}

interface FormData {
  imageUrl?: string;
  altText: string;
  displayOrder: number;
}

export default function AdminHeroImages() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<HeroImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<FormData>({
    defaultValues: {
      imageUrl: "",
      altText: "",
      displayOrder: 0,
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    fetchImages();
  }, [navigate]);

  const fetchImages = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/hero-images", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }

      const data = await response.json();
      setImages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to load images");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("adminToken");
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    const result = await response.json();
    return result.imageUrl;
  };

  const onSubmit = async (data: FormData) => {
    if (!selectedFile && !data.imageUrl) {
      toast.error("Please select a file or provide an image URL");
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = data.imageUrl;

      // Upload file if selected
      if (selectedFile) {
        setUploadProgress(50);
        imageUrl = await uploadFile(selectedFile);
        setUploadProgress(100);
      }

      // Save image metadata
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/hero-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageUrl,
          altText: data.altText,
          displayOrder: data.displayOrder,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add image");
      }

      toast.success("Image added successfully!");
      form.reset();
      setPreviewUrl(null);
      setSelectedFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchImages();
    } catch (error) {
      console.error("Error adding image:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add image"
      );
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/hero-images/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      toast.success("Image deleted successfully!");
      fetchImages();
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  const handleUpdateOrder = async (id: number, newOrder: number) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/hero-images/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ displayOrder: newOrder }),
      });

      if (!response.ok) {
        throw new Error("Failed to update image order");
      }

      toast.success("Order updated!");
      fetchImages();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/10 bg-primary/5">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <Button
            onClick={() => navigate("/admin/dashboard")}
            variant="ghost"
            size="sm"
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-primary">
            Manage Hero Slider Images
          </h1>
          <p className="text-muted-foreground mt-2">
            Add, edit, and organize hero slider images
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Image Form */}
          <div className="bg-primary/5 p-8 rounded-lg border border-primary/10">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Upload className="w-6 h-6 text-primary" />
              Add New Image
            </h2>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Image URL */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  rules={{
                    required: "Image URL is required",
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "Must be a valid URL starting with http:// or https://",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          disabled={isSaving}
                          onChange={(e) => {
                            field.onChange(e);
                            setPreviewUrl(e.target.value);
                          }}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preview */}
                {previewUrl && (
                  <div className="relative w-full h-48 bg-black rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setPreviewUrl(null)}
                    />
                  </div>
                )}

                {/* Alt Text */}
                <FormField
                  control={form.control}
                  name="altText"
                  rules={{
                    required: "Alt text is required for accessibility",
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alt Text</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Describe the image content"
                          disabled={isSaving}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Display Order */}
                <FormField
                  control={form.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order (0 = first)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          disabled={isSaving}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSaving} className="w-full">
                  {isSaving ? "Adding..." : "Add Image"}
                </Button>
              </form>
            </Form>
          </div>

          {/* Images List */}
          <div className="bg-primary/5 p-8 rounded-lg border border-primary/10">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary" />
              Current Images ({images.length})
            </h2>

            {images.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No images yet. Add one using the form on the left.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="bg-background p-4 rounded-lg border border-primary/10"
                  >
                    {/* Image Thumbnail */}
                    <div className="relative w-full h-24 bg-black rounded mb-3 overflow-hidden">
                      <img
                        src={image.imageUrl}
                        alt={image.altText}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Image Info */}
                    <div className="space-y-2 mb-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Alt Text:</p>
                        <p className="text-foreground font-medium">
                          {image.altText}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Display Order:
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={image.displayOrder}
                            onChange={(e) =>
                              handleUpdateOrder(image.id, parseInt(e.target.value) || 0)
                            }
                            className="w-16 px-2 py-1 border border-primary/10 rounded text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      onClick={() => handleDeleteImage(image.id)}
                      variant="destructive"
                      size="sm"
                      className="w-full gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
