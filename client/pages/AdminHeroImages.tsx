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
import { ArrowLeft, Upload, Trash2, Eye, FileUp, Download, Archive, RotateCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HeroImage {
  id: number;
  filename: string;
  imageUrl: string;
  altText: string;
  displayOrder: number;
  createdAt: string;
  isActive?: boolean;
  isArchived?: boolean;
}

interface FormData {
  imageUrl?: string;
  altText: string;
  displayOrder: number;
}

// Fallback images when database is empty
const FALLBACK_IMAGES: HeroImage[] = [
  {
    id: -1,
    filename: "fallback-1.jpg",
    imageUrl:
      "https://cdn.builder.io/api/v1/image/assets%2Fffba8e3c2b3042bab528316b71e4306e%2Ff21188f906c3408783bc64a9665d33e0?format=webp&width=1200",
    altText: "Cornbelt Flour Mill exterior",
    displayOrder: 0,
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: -2,
    filename: "fallback-2.jpg",
    imageUrl:
      "https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2F0d117e54429f404bb6e71a4b18a98876?format=webp&width=800",
    altText: "Cornbelt products display",
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    isActive: false,
  },
  {
    id: -3,
    filename: "fallback-3.jpg",
    imageUrl:
      "https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2F9e37a8d9c5764cbe9c1a6a45fb44d6b8?format=webp&width=800",
    altText: "Cornbelt facility and signage",
    displayOrder: 2,
    createdAt: new Date().toISOString(),
    isActive: false,
  },
  {
    id: -4,
    filename: "fallback-4.jpg",
    imageUrl:
      "https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2F85026c8a3cf94c89a4204f2ddfec1703?format=webp&width=800",
    altText: "Cornbelt marketing campaign",
    displayOrder: 3,
    createdAt: new Date().toISOString(),
    isActive: false,
  },
  {
    id: -5,
    filename: "fallback-5.jpg",
    imageUrl:
      "https://cdn.builder.io/api/v1/image/assets%2F1ffce8bff4d5493bafecc479d3963466%2Fa2d86d9f4ad945de88fded66d899beed?format=webp&width=800",
    altText: "Jirani maize meal promotion",
    displayOrder: 4,
    createdAt: new Date().toISOString(),
    isActive: false,
  },
];

// Compress image before upload to avoid "request entity too large" errors
async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          "image/jpeg",
          quality,
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

export default function AdminHeroImages() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<HeroImage[]>([]);
  const [archivedImages, setArchivedImages] = useState<HeroImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isFallback, setIsFallback] = useState(false);

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
      const response = await (
        await import("@/lib/adminApi")
      ).default("/api/admin/hero-images", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response || !response.ok) {
        throw new Error("Failed to fetch images");
      }

      const data = await response.json();
      const imageList = Array.isArray(data) ? data : [];

      // Separate active and archived images
      const activeImages = imageList.filter((img: HeroImage) => !img.isArchived);
      const archived = imageList.filter((img: HeroImage) => img.isArchived);

      // Use fallback images if database is empty
      if (activeImages.length === 0) {
        console.log("[Hero Images] Database empty, using fallback images");
        setImages(FALLBACK_IMAGES);
        setIsFallback(true);
        // Cache fallback images in localStorage
        localStorage.setItem(
          "heroImagesCache",
          JSON.stringify(FALLBACK_IMAGES),
        );
      } else {
        setImages(activeImages);
        setIsFallback(false);
        // Cache fetched images in localStorage for offline access
        localStorage.setItem("heroImagesCache", JSON.stringify(activeImages));
      }

      setArchivedImages(archived);
    } catch (error) {
      console.error("Error fetching images:", error);
      // Try to load from localStorage cache on error
      const cached = localStorage.getItem("heroImagesCache");
      if (cached) {
        try {
          const cachedImages = JSON.parse(cached);
          console.log("[Hero Images] Loaded from cache due to error");
          setImages(cachedImages);
          setIsFallback(cachedImages.some((img: HeroImage) => img.id < 0));
          toast.warning("Showing cached images. Server may be unavailable.");
        } catch {
          setImages(FALLBACK_IMAGES);
          setIsFallback(true);
          toast.error("Failed to load images. Showing defaults.");
        }
      } else {
        setImages(FALLBACK_IMAGES);
        setIsFallback(true);
        toast.error("Failed to load images. Showing defaults.");
      }
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
    return new Promise(async (resolve, reject) => {
      try {
        // Compress the image to reduce payload size
        setUploadProgress(25);
        const compressedBlob = await compressImage(file);
        setUploadProgress(50);

        // Convert compressed blob to base64
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64Data = (reader.result as string).split(",")[1];

            const token = localStorage.getItem("adminToken");
            const adminFetch = (await import("@/lib/adminApi")).default;
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

            setUploadProgress(75);

            if (!response || !response.ok) {
              const errorData = await response?.json().catch(() => null);
              console.error("Upload error response:", errorData);

              if (response?.status === 413) {
                throw new Error(
                  "Image file is too large. Please use a smaller image or compress it.",
                );
              }

              throw new Error(
                errorData?.error || "Failed to upload file"
              );
            }

            const result = await response.json();
            setUploadProgress(90);
            resolve(result.imageUrl);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => {
          reject(new Error("Failed to read compressed file"));
        };

        reader.readAsDataURL(compressedBlob);
      } catch (error) {
        reject(error);
      }
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
        setUploadProgress(25);
        imageUrl = await uploadFile(selectedFile);
        setUploadProgress(100);
      }

      // Save image metadata
      const token = localStorage.getItem("adminToken");
      const adminFetch = (await import("@/lib/adminApi")).default;
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

  const handleArchiveImage = async (id: number) => {
    // Don't allow archiving fallback images
    if (id < 0) {
      toast.error("Cannot archive fallback images. Add a real image first.");
      return;
    }

    if (!confirm("Are you sure you want to archive this image? You can recover it later from the Archive tab.")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const adminFetch = (await import("@/lib/adminApi")).default;
      const response = await adminFetch(`/api/admin/hero-images/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isArchived: true }),
      });

      if (!response || !response.ok) {
        throw new Error("Failed to archive image");
      }

      toast.success("Image archived successfully! You can restore it from the Archive tab.");
      fetchImages();
    } catch (error) {
      console.error("Error archiving image:", error);
      toast.error("Failed to archive image");
    }
  };

  const handleRestoreImage = async (id: number) => {
    // Don't allow restoring fallback images
    if (id < 0) {
      toast.error("Cannot restore fallback images.");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const adminFetch = (await import("@/lib/adminApi")).default;
      const response = await adminFetch(`/api/admin/hero-images/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isArchived: false }),
      });

      if (!response || !response.ok) {
        throw new Error("Failed to restore image");
      }

      toast.success("Image restored successfully!");
      fetchImages();
    } catch (error) {
      console.error("Error restoring image:", error);
      toast.error("Failed to restore image");
    }
  };

  const handleUpdateOrder = async (id: number, newOrder: number) => {
    // Don't allow updating fallback images
    if (id < 0) {
      toast.error("Cannot modify fallback images. Add a real image first.");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const adminFetch = (await import("@/lib/adminApi")).default;
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
    // Don't allow toggling fallback images
    if (id < 0) {
      toast.error("Cannot modify fallback images. Add a real image first.");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const adminFetch = (await import("@/lib/adminApi")).default;
      const response = await adminFetch(`/api/admin/hero-images/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newActive }),
      });

      if (!response || !response.ok) {
        throw new Error("Failed to update visibility");
      }

      toast.success(
        newActive ? "Image shown in slider" : "Image hidden from slider",
      );
      fetchImages();
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast.error("Failed to update visibility");
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
          Add, edit, and organize hero slider images. Deleted images can be recovered from the Archive.
        </p>

        {isFallback && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ℹ️ <strong>No custom images found.</strong> Showing default
              fallback images. Add your own images using the form below.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
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
                        (will be automatically compressed)
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

          {/* Images List with Tabs */}
          <div className="bg-primary/5 p-8 rounded-lg border border-primary/10">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Active ({images.length})
                </TabsTrigger>
                <TabsTrigger value="archived" className="flex items-center gap-2">
                  <Archive className="w-4 h-4" />
                  Archive ({archivedImages.length})
                </TabsTrigger>
              </TabsList>

              {/* Active Images Tab */}
              <TabsContent value="active" className="mt-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Current Images
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
                        className={`bg-background p-4 rounded-lg border ${
                          image.id < 0
                            ? "border-yellow-200 bg-yellow-50/50"
                            : "border-primary/10"
                        }`}
                      >
                        {image.id < 0 && (
                          <div className="mb-2 text-xs font-medium text-yellow-800 bg-yellow-100 px-2 py-1 rounded w-fit">
                            Fallback Image
                          </div>
                        )}

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
                                disabled={image.id < 0}
                                className="w-16 px-2 py-1 border border-primary/10 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-2">
                              Visibility:
                            </p>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                image.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {image.isActive ? "Visible" : "Hidden"}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                          {/* Visibility Controls */}
                          <div className="flex gap-2">
                            {image.isActive ? (
                              <Button
                                onClick={() => handleToggleActive(image.id, false)}
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-2"
                                disabled={image.id < 0}
                              >
                                Hide from Slider
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleToggleActive(image.id, true)}
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-2"
                                disabled={image.id < 0}
                              >
                                Show in Slider
                              </Button>
                            )}
                          </div>

                          {/* View/Download/Archive */}
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

                            {image.id >= 0 && (
                              <Button
                                onClick={() => handleArchiveImage(image.id)}
                                variant="destructive"
                                size="sm"
                                className="gap-2"
                              >
                                <Archive className="w-4 h-4" />
                                Archive
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Archived Images Tab */}
              <TabsContent value="archived" className="mt-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Archived Images
                </h2>

                {archivedImages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No archived images. Images you archive will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {archivedImages.map((image) => (
                      <div
                        key={image.id}
                        className="bg-background p-4 rounded-lg border border-orange-200 bg-orange-50/50"
                      >
                        <div className="mb-2 text-xs font-medium text-orange-800 bg-orange-100 px-2 py-1 rounded w-fit">
                          Archived
                        </div>

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
                            <p className="text-foreground font-medium">
                              {image.displayOrder}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                          {/* View/Download/Restore */}
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
                              onClick={() => handleRestoreImage(image.id)}
                              className="gap-2"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Restore
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
