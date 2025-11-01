import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { X, Plus, Edit2, Trash2 } from "lucide-react";

interface Testimonial {
  id?: number;
  fullName: string;
  location: string;
  testimonialText: string;
  imageUrl?: string;
  rating: number;
  displayOrder: number;
  isPublished: boolean;
}

export default function AdminTestimonials() {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Testimonial>({
    fullName: "",
    location: "",
    testimonialText: "",
    rating: 5,
    displayOrder: 0,
    isPublished: true,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Image upload state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Delete modal state
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchTestimonials();
  }, [navigate]);

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/testimonials", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching testimonials:", err);
      setError("Failed to load testimonials");
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(",")[1];
          const token = localStorage.getItem("adminToken");
          const response = await fetch("/api/admin/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ fileData: base64Data, fileName: file.name }),
          });

          if (!response.ok) throw new Error("Failed to upload file");

          const result = await response.json();
          resolve(result.imageUrl);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.fullName || !formData.testimonialText) {
      setError("Full name and testimonial text are required");
      return;
    }

    setIsSaving(true);
    setUploadProgress(0);

    try {
      // If a file is selected, upload it first
      let imageUrl = formData.imageUrl || null;
      if (selectedFile) {
        setUploadProgress(30);
        imageUrl = await uploadFile(selectedFile);
        setUploadProgress(100);
      }

      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/admin/testimonials/${editingId}`
        : "/api/admin/testimonials";

      const payload = { ...formData, imageUrl };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save testimonial");
      }

      setSuccess(
        editingId ? "Testimonial updated successfully" : "Testimonial added successfully",
      );

      // Reset form
      setShowForm(false);
      setEditingId(null);
      setFormData({
        fullName: "",
        location: "",
        testimonialText: "",
        rating: 5,
        displayOrder: 0,
        isPublished: true,
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      fetchTestimonials();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setFormData(testimonial);
    setEditingId(testimonial.id || null);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/admin/testimonials/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });

      if (!response.ok) throw new Error("Failed to delete testimonial");

      setSuccess("Testimonial deleted successfully");
      fetchTestimonials();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      fullName: "",
      location: "",
      testimonialText: "",
      rating: 5,
      displayOrder: 0,
      isPublished: true,
    });
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Manage Testimonials
                </h1>
                <p className="text-muted-foreground">
                  Create, edit, and manage customer testimonials
                </p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Testimonial
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                {success}
              </div>
            )}

            {/* Form Modal */}
            {showForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">
                      {editingId ? "Edit Testimonial" : "Add New Testimonial"}
                    </h2>
                    <button
                      onClick={handleCancel}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fullName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            location: e.target.value,
                          })
                        }
                        placeholder="e.g., Nairobi, Kenya"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Testimonial Text *
                      </label>
                      <textarea
                        value={formData.testimonialText}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            testimonialText: e.target.value,
                          })
                        }
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    {/* File Upload or Image URL */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Upload Image (optional, max 5MB)
                      </label>
                      <div className="space-y-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            // Validate
                            if (!file.type.startsWith("image/")) {
                              setError("Please select a valid image file");
                              return;
                            }
                            if (file.size > 5 * 1024 * 1024) {
                              setError("File size must be less than 5MB");
                              return;
                            }
                            setSelectedFile(file);
                            const reader = new FileReader();
                            reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }}
                          disabled={isSaving}
                          className="block w-full text-sm text-muted-foreground
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-lg file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary file:text-primary-foreground
                            hover:file:bg-primary/90
                            cursor-pointer"
                        />

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-primary/10"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-primary/5 text-muted-foreground">OR</span>
                          </div>
                        </div>

                        <input
                          type="url"
                          value={formData.imageUrl || ""}
                          onChange={(e) => {
                            setFormData({ ...formData, imageUrl: e.target.value });
                            if (!selectedFile) setPreviewUrl(e.target.value);
                          }}
                          placeholder="https://cornbelt.co.ke/testimonials/..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                          disabled={isSaving || !!selectedFile}
                        />

                        {previewUrl && (
                          <div className="relative w-full h-48 bg-black rounded-lg overflow-hidden">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" onError={() => setPreviewUrl(null)} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Rating
                        </label>
                        <select
                          value={formData.rating}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rating: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {[1, 2, 3, 4, 5].map((i) => (
                            <option key={i} value={i}>
                              {"★".repeat(i)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Display Order
                        </label>
                        <input
                          type="number"
                          value={formData.displayOrder}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              displayOrder: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isPublished"
                        checked={formData.isPublished}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isPublished: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      <label htmlFor="isPublished" className="text-sm">
                        Published
                      </label>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        {editingId ? "Update" : "Add"} Testimonial
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Testimonials List */}

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete testimonial?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this testimonial? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading testimonials...</p>
              </div>
            ) : testimonials.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-muted-foreground mb-4">
                  No testimonials yet. Add your first one!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          {testimonial.fullName}
                        </h3>
                        {testimonial.location && (
                          <p className="text-sm text-muted-foreground">
                            {testimonial.location}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            testimonial.isPublished
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {testimonial.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4 italic">
                      "{testimonial.testimonialText}"
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-500">
                            ★
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(testimonial)}
                          className="p-2 hover:bg-gray-100 rounded text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            testimonial.id && handleDelete(testimonial.id)
                          }
                          className="p-2 hover:bg-gray-100 rounded text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
      </div>
    </AdminLayout>
  );
}
