import { component$, useSignal, $ } from "@builder.io/qwik";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { tursoClient } from "~/lib/turso";
import { LuTrash2, LuEdit } from "@qwikest/icons/lucide";

interface GalleryImage {
  id: number;
  filename: string;
  title?: string;
  alt?: string;
}

export const useGalleryImagesLoader = routeLoader$(async (event) => {
  try {
    const client = tursoClient(event);
    const result = await client.execute("SELECT id, filename, title, alt FROM gallery_images ORDER BY id ASC");
    return result.rows.map((row: any) => ({
      id: Number(row.id) || 0,
      filename: String(row.filename) || "",
      title: row.title ? String(row.title) : undefined,
      alt: row.alt ? String(row.alt) : undefined,
    })) as GalleryImage[];
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return [];
  }
});

const saveImage$ = server$(async function (imageData: { id?: number; title?: string; alt?: string; filename: string; file: File }, { request }) {
  const client = tursoClient({ request });
  try {
    const imageBuffer = Buffer.from(await imageData.file.arrayBuffer());
    if (imageData.id) {
      await client.execute({
        sql: "UPDATE gallery_images SET title = ?, filename = ?, alt = ?, image_data = ? WHERE id = ?",
        args: [imageData.title || null, imageData.filename, imageData.alt || null, imageBuffer, imageData.id],
      });
      return { success: true };
    } else {
      await client.execute({
        sql: "INSERT INTO gallery_images (title, filename, alt, image_data) VALUES (?, ?, ?, ?)",
        args: [imageData.title || null, imageData.filename, imageData.alt || null, imageBuffer],
      });
      return { success: true };
    }
  } catch (error) {
    console.error("Save error:", error);
    return { success: false, error: "Failed to save image" };
  }
});

const deleteImage$ = server$(async function (id: number, { request }) {
  const client = tursoClient({ request });
  try {
    await client.execute({
      sql: "DELETE FROM gallery_images WHERE id = ?",
      args: [id],
    });
    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, error: "Failed to delete image" };
  }
});

export default component$(() => {
  const images = useGalleryImagesLoader();
  const showForm = useSignal(false);
  const editingImage = useSignal<GalleryImage | null>(null);
  const isLoading = useSignal(false);
  const error = useSignal("");
  const success = useSignal("");

  const handleSubmit = $(async (event: Event) => {
    event.preventDefault();
    isLoading.value = true;
    error.value = "";
    success.value = "";

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const imageData = {
      id: editingImage.value?.id,
      title: formData.get("title") as string,
      alt: formData.get("alt") as string,
      filename: formData.get("filename") as string,
      file: formData.get("file") as File,
    };

    if (!imageData.filename) {
      error.value = "Filename is required";
      isLoading.value = false;
      return;
    }

    try {
      const result = await saveImage$(imageData);
      if (result.success) {
        success.value = editingImage.value ? "Image updated successfully!" : "Image added successfully!";
        setTimeout(() => {
          showForm.value = false;
          editingImage.value = null;
          window.location.reload(); // Refresh to update loader data
        }, 1500);
      } else {
        error.value = result.error || "Something went wrong";
      }
    } catch (err) {
      error.value = "Network error occurred";
      console.error("Save error:", err);
    } finally {
      isLoading.value = false;
    }
  });

  const handleDelete = $(async (id: number) => {
    if (confirm("Are you sure you want to delete this image?")) {
      const result = await deleteImage$(id);
      if (result.success) {
        success.value = "Image deleted successfully!";
        setTimeout(() => window.location.reload(), 1500);
      } else {
        error.value = result.error || "Failed to delete image";
      }
    }
  });

  const handleEdit = $((image: GalleryImage) => {
    editingImage.value = { ...image };
    showForm.value = true;
    error.value = "";
    success.value = "";
  });

  const cancelForm = $(() => {
    editingImage.value = null;
    showForm.value = false;
    error.value = "";
    success.value = "";
  });

  return (
    <section class="relative overflow-hidden py-12 md:py-16">
      <div class="relative max-w-6xl mx-auto px-5 sm:px-6">
        <div class="text-center mb-12">
          <h1 class="!text-5xl md:!text-5xl font-bold mb-6">
            <span class="bg-gradient-to-r from-primary-600 via-tertiary-600 to-primary-700 bg-clip-text text-transparent">
              Manage Gallery Images
            </span>
          </h1>
          <p class="text-xl text-primary-700 dark:text-primary-300 max-w-3xl mx-auto">
            Add, edit, or remove images from the gallery. Upload new images with optional titles and alt text to showcase your pottery creations.
          </p>
        </div>

        <div class="flex justify-end mb-6">
          <button
            onClick$={() => (showForm.value ? cancelForm() : (showForm.value = true))}
            class="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200"
          >
            {showForm.value ? "Cancel" : "Add New Image"}
          </button>
        </div>

        {showForm.value && (
          <div class="bg-white/35 backdrop-blur-sm border-2 border-primary-200 dark:border-secondary-700 rounded-2xl p-6 mb-8 max-w-lg mx-auto">
            <h2 class="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
              {editingImage.value ? "Edit Image" : "Add New Image"}
            </h2>
            <form onSubmit$={handleSubmit} class="space-y-4" encType="multipart/form-data">
              <div>
                <label for="filename" class="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                  Filename (e.g., image1.jpeg)
                </label>
                <input
                  type="text"
                  id="filename"
                  name="filename"
                  value={editingImage.value?.filename || ""}
                  class="w-full px-3 py-2 border border-primary-200 dark:border-secondary-700 rounded-md bg-white/50 dark:bg-secondary-800/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label for="title" class="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                  Title (optional)
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editingImage.value?.title || ""}
                  class="w-full px-3 py-2 border border-primary-200 dark:border-secondary-700 rounded-md bg-white/50 dark:bg-secondary-800/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label for="alt" class="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                  Alt Text (optional)
                </label>
                <input
                  type="text"
                  id="alt"
                  name="alt"
                  value={editingImage.value?.alt || ""}
                  class="w-full px-3 py-2 border border-primary-200 dark:border-secondary-700 rounded-md bg-white/50 dark:bg-secondary-800/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label for="file" class="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                  Image File
                </label>
                <input
                  type="file"
                  id="file"
                  name="file"
                  accept="image/*"
                  required={!editingImage.value}
                  class="w-full px-3 py-2 border border-primary-200 dark:border-secondary-700 rounded-md bg-white/50 dark:bg-secondary-800/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              {error.value && (
                <div class="text-red-600 text-sm bg-red-50 dark:bg-red-900/50 p-2 rounded">
                  {error.value}
                </div>
              )}
              {success.value && (
                <div class="text-green-600 text-sm bg-green-50 dark:bg-green-900/50 p-2 rounded">
                  {success.value}
                </div>
              )}
              <div class="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading.value}
                  class={`flex-1 py-2 px-4 rounded-md font-medium ${isLoading.value ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-700 hover:to-primary-800"} text-white transition-all duration-200`}
                >
                  {isLoading.value ? "Processing..." : editingImage.value ? "Update Image" : "Add Image"}
                </button>
                <button
                  type="button"
                  onClick$={cancelForm}
                  class="px-4 py-2 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-secondary-700 rounded-md hover:bg-primary-50 dark:hover:bg-secondary-800/50 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {images.value.length === 0 ? (
          <div class="text-center py-12">
            <p class="text-primary-700 dark:text-primary-300 text-lg">
              No images available yet. Add your first image above!
            </p>
          </div>
        ) : (
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.value.map((image) => (
              <div
                key={image.id}
                class="break-inside-avoid group backdrop-blur-sm border-2 border-primary-200 dark:border-secondary-700 rounded-2xl bg-white/35 dark:bg-secondary-800/35 transition-all duration-300 hover:shadow-xl hover:border-secondary-200 hover:bg-white/45"
                style={{
                  minHeight: "280px",
                  transitionProperty: "transform, opacity, margin, box-shadow, background-color, border-color",
                }}
              >
                <div
                  class="h-40 w-full rounded-t-2xl bg-gray-100 overflow-hidden"
                  style={{
                    backgroundImage: `url('/images/${image.filename}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                  role="img"
                  aria-label={image.title || "Gallery image"}
                />
                <div class="flex flex-col p-4">
                  <div class="flex flex-row items-center justify-between gap-4 mb-3">
                    <h3 class="text-base font-bold text-secondary-900 dark:text-secondary-100 line-clamp-1">
                      {image.title || "Untitled Image"}
                    </h3>
                    <div class="flex gap-2">
                      <button
                        onClick$={() => handleEdit(image)}
                        class="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-sm font-medium rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200"
                        aria-label={`Edit ${image.title || "image"}`}
                      >
                        <LuEdit class="w-4 h-4" />
                      </button>
                      <button
                        onClick$={() => handleDelete(image.id)}
                        class="px-3 py-1 bg-gradient-to-r from-red-400 to-red-500 text-white text-sm font-medium rounded-xl hover:from-red-500 hover:to-red-600 transition-all duration-200"
                        aria-label={`Delete ${image.title || "image"}`}
                      >
                        <LuTrash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p class="text-primary-700 dark:text-primary-300 text-sm text-center line-clamp-4">
                    Filename: {image.filename}
                    <br />
                    Alt: {image.alt || "None"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
});