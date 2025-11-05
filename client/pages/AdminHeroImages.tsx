import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
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
import { ArrowLeft, Upload, Trash2, Eye, FileUp, Download } from "lucide-react";

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
      const response = await (await import('@/lib/adminApi')).default("/api/admin/hero-images", { headers: { Authorization: `Bearer ${token}` } });
      if (!response || !response.ok) {
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
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          // Extract base64 data
          const base64Data = (reader.result as string).split(",")[1];

          const token = localStorage.getItem("adminToken");
          const adminFetch = (await import('@/lib/adminApi')).default;
          const response = await adminFetch("/api/admin/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fileData: base64Data,
              fileName: file.name,
            }),
          });

          if (!response || !response.ok) {
            throw new Error("Failed to upload file");
          }

          const result = await response.json();
          resolve(result.imageUrl);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsDataURL(file);
    });
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
      const adminFetch = (await import('@/lib/adminApi')).default;
      const response = await adminFetch("/api/admin/hero-images", {
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

      if (!response || !response.ok) {
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
        error instanceof Error ? error.message : "Failed to add image",
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
      const adminFetch = (await import('@/lib/adminApi')).default;
      const response = await adminFetch(`/api/admin/hero-images/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response || !response.ok) {
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
      const adminFetch = (await import('@/lib/adminApi')).default;
      const response = await adminFetch(`/api/admin/hero-images/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ displayOrder: newOrder }),
      });

      if (!response || !response.ok) {
        throw new Error("Failed to update image order");
      }

      toast.success("Order updated!");
      fetchImages();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    }
  };

  const handleToggleActive = async (id: number, newActive: boolean) => {
    try {
      if (newActive) {
        const ok = confirm(
          "Marking this image active will unset other active images. Continue?",
        );
        if (!ok) return;
      }

      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/hero-images/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle active");
      }

      toast.success("Updated");
      fetchImages();
    } catch (error) {
      console.error("Error toggling active:", error);
      toast.error("Failed to update");
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
    <AdminLayout>
      <div className="container mx-auto px-4 md:px-6 py-12">
        <h1 className="text-3xl font-bold text-primary">
          Manage Hero Slider Images
        </h1>
        <p className="text-muted-foreground mt-2">
          Add, edit, and organize hero slider images
        </p>
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
                {/* File Upload */}
                <FormItem>
                  <FormLabel>Upload Image (Max 5MB)</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={isSaving}
                        className="block w-full text-sm text-muted-foreground
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary file:text-primary-foreground
                          hover:file:bg-primary/90
                          cursor-pointer"
                      />
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground">
                          Selected: {selectedFile.name} (
                          {(selectedFile.size / 1024).toFixed(2)} KB)
                        </p>
                      )}
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Supported formats: JPG, PNG, WebP, SVG. Max size: 5MB
                      </p>
                    </div>
                  </FormControl>
                </FormItem>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-primary/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-primary/5 text-muted-foreground">
                      OR
                    </span>
                  </div>
                </div>

                {/* Image URL */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  rules={{
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message:
                        "Must be a valid URL starting with http:// or https://",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Or paste Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          disabled={isSaving || !!selectedFile}
                          onChange={(e) => {
                            field.onChange(e);
                            if (!selectedFile) setPreviewUrl(e.target.value);
                          }}
                          value={field.value || ""}
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

                <Button
                  type="submit"
                  disabled={
                    isSaving || (!selectedFile && !form.getValues("imageUrl"))
                  }
                  className="w-full gap-2"
                >
                  <FileUp className="w-4 h-4" />
                  {isSaving ? (
                    <>
                      {uploadProgress > 0 && uploadProgress < 100
                        ? `Uploading... ${uploadProgress}%`
                        : "Processing..."}
                    </>
                  ) : (
                    "Add Image"
                  )}
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
                        <p className="text-xs text-muted-foreground">
                          Alt Text:
                        </p>
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
                              handleUpdateOrder(
                                image.id,
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-16 px-2 py-1 border border-primary/10 rounded text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={!!image.isActive}
                            onChange={() =>
                              handleToggleActive(image.id, !image.isActive)
                            }
                            className="w-4 h-4"
                          />
                          <span className="text-xs text-muted-foreground">
                            Active
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Actions: View / Download / Delete */}
                    <div className="flex gap-2">
                      <a
                        href={image.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border rounded bg-white/5 hover:bg-white/10 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </a>

                      <a
                        href={image.imageUrl}
                        download
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 border rounded bg-white/5 hover:bg-white/10 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>

                      <Button
                        onClick={() => handleDeleteImage(image.id)}
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
