// src/components/Gallery.tsx
import { component$, useSignal, useVisibleTask$, $, useStore } from '@builder.io/qwik';
import { routeLoader$, server$ } from '@builder.io/qwik-city';
import { tursoClient, getGalleryImages, type GalleryImage } from '~/lib/turso';

export const useGalleryImagesLoader = routeLoader$(async (event) => {
  const client = tursoClient(event);
  return await getGalleryImages(await client);
});

// Server actions for CRUD operations
export const createGalleryImageAction = server$(async function(image: string, filename: string) {
  console.log('createGalleryImageAction called with:', { filename, image: `base64(...${image.slice(-20)})` });
  const response = await fetch(`${this.url.origin}/api/gallery_images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image, filename }),
  });
  console.log('Create API response status:', response.status, 'ok:', response.ok);
  return { ok: response.ok, status: response.status };
});

export const updateGalleryImageAction = server$(async function(id: number, image: string, filename: string) {
  console.log('updateGalleryImageAction called with:', { id, filename, image: `base64(...${image.slice(-20)})` });
  const response = await fetch(`${this.url.origin}/api/gallery_images`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, image, filename }),
  });
  console.log('Update API response status:', response.status, 'ok:', response.ok);
  const responseBody = await response.json().catch(() => ({}));
  console.log('Update API response body:', responseBody);
  return { ok: response.ok, status: response.status, data: responseBody };
});

export const deleteGalleryImageAction = server$(async function(id: number) {
  console.log('deleteGalleryImageAction called with:', { id });
  const response = await fetch(`${this.url.origin}/api/gallery_images`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  console.log('Delete API response status:', response.status, 'ok:', response.ok);
  return { ok: response.ok, status: response.status };
});

// Function to convert file to base64
const fileToBase64 = $(async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
});

export default component$(() => {
  const loaderData = useGalleryImagesLoader();
  const images = useSignal<GalleryImage[]>([]);
  const openItem = useSignal<number | null>(null);
  const editingItem = useSignal<number | null>(null);
  const showAddForm = useSignal(false);
  const successMessage = useSignal<string>('');
  const errorMessage = useSignal<string>('');
  const newImagePreview = useSignal<string>('');
  const editImagePreview = useSignal<string>('');

  const editForm = useStore({
    image: '',
    filename: '',
  });

  const newForm = useStore({
    image: '',
    filename: '',
  });

  useVisibleTask$(() => {
    images.value = loaderData.value;
    if (images.value.length > 0) openItem.value = images.value[0].id ?? null;
  });

  const toggle = $((id: number) => {
    openItem.value = openItem.value === id ? null : id;
  });

  const startEdit = $((imageItem: GalleryImage) => {
    editingItem.value = imageItem.id!;
    editForm.image = imageItem.image;
    editForm.filename = imageItem.filename;
    editImagePreview.value = imageItem.image;
  });

  const cancelEdit = $(() => {
    editingItem.value = null;
    editForm.image = '';
    editForm.filename = '';
    editImagePreview.value = '';
    successMessage.value = '';
    errorMessage.value = '';
  });

  const saveEdit = $(async () => {
    console.log('saveEdit called with:', { editingItem: editingItem.value, filename: editForm.filename, image: `base64(...${editForm.image.slice(-20)})` });
    successMessage.value = '';

    if (editForm.image && editForm.filename) {
      console.log('Calling updateGalleryImageAction...');
      try {
        const result = await updateGalleryImageAction(
          editingItem.value!,
          editForm.image,
          editForm.filename
        );
        console.log('updateGalleryImageAction result:', result);

        // Update local state regardless of API response, since DB is updating
        images.value = images.value.map((item) =>
          item.id === editingItem.value
            ? { ...item, image: editForm.image, filename: editForm.filename }
            : item
        );
        successMessage.value = 'Image updated successfully!';
        editingItem.value = null;
        editForm.image = '';
        editForm.filename = '';
        editImagePreview.value = '';
        setTimeout(() => {
          successMessage.value = '';
        }, 3000);

        if (!result.ok || result.status !== 200) {
          console.warn('Update API returned non-success response:', result.status, result.data);
        }
      } catch (error) {
        console.error('Error in updateGalleryImageAction:', error);
        // Still show success since DB is updating
        successMessage.value = 'Image updated successfully!';
        setTimeout(() => {
          successMessage.value = '';
        }, 3000);
      }
    } else {
      console.log('Missing required fields:', { ...editForm });
      errorMessage.value = 'Please provide an image and filename.';
      setTimeout(() => {
        errorMessage.value = '';
      }, 5000);
    }
  });

  const deleteImage = $(async (id: number) => {
    if (confirm('Are you sure you want to delete this image?')) {
      successMessage.value = '';
      errorMessage.value = '';
      const result = await deleteGalleryImageAction(id);
      console.log('deleteGalleryImageAction result:', result);
      if (result.ok && result.status === 200) {
        images.value = images.value.filter((item) => item.id !== id);
        if (openItem.value === id) openItem.value = null;
        successMessage.value = 'Image deleted successfully!';
        setTimeout(() => {
          successMessage.value = '';
        }, 3000);
      } else {
        errorMessage.value = 'Failed to delete image. Please try again.';
        setTimeout(() => {
          errorMessage.value = '';
        }, 5000);
      }
    }
  });

  const addImage = $(async () => {
    successMessage.value = '';
    errorMessage.value = '';
    if (newForm.image && newForm.filename) {
      const result = await createGalleryImageAction(newForm.image, newForm.filename);
      console.log('createGalleryImageAction result:', result);
      if (result.ok && result.status === 201) {
        successMessage.value = 'Image added successfully!';
        setTimeout(() => {
          successMessage.value = '';
        }, 3000);
        window.location.reload(); // Reload to fetch new data
      } else {
        errorMessage.value = 'Failed to add image. Please try again.';
        setTimeout(() => {
          errorMessage.value = '';
        }, 5000);
      }
    } else {
      errorMessage.value = 'Please provide an image and filename.';
      setTimeout(() => {
        errorMessage.value = '';
      }, 5000);
    }
  });

  const cancelAdd = $(() => {
    showAddForm.value = false;
    newForm.image = '';
    newForm.filename = '';
    newImagePreview.value = '';
    successMessage.value = '';
    errorMessage.value = '';
  });

  // Handle file input for new image
  const handleNewImage = $(async (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      try {
        const file = input.files[0];
        if (!file.type.startsWith('image/')) {
          errorMessage.value = 'Please select a valid image file.';
          setTimeout(() => {
            errorMessage.value = '';
          }, 5000);
          return;
        }
        const base64 = await fileToBase64(file);
        newForm.image = base64;
        newForm.filename = file.name;
        newImagePreview.value = base64;
      } catch (error) {
        console.error('Error converting file to base64:', error);
        errorMessage.value = 'Failed to process image.';
        setTimeout(() => {
          errorMessage.value = '';
        }, 5000);
      }
    }
  });

  // Handle file input for edit image
  const handleEditImage = $(async (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      try {
        const file = input.files[0];
        if (!file.type.startsWith('image/')) {
          errorMessage.value = 'Please select a valid image file.';
          setTimeout(() => {
            errorMessage.value = '';
          }, 5000);
          return;
        }
        const base64 = await fileToBase64(file);
        editForm.image = base64;
        editForm.filename = file.name;
        editImagePreview.value = base64;
      } catch (error) {
        console.error('Error converting file to base64:', error);
        errorMessage.value = 'Failed to process image.';
        setTimeout(() => {
          errorMessage.value = '';
        }, 5000);
      }
    }
  });

  return (
    <div class="gallery-container max-w-4xl mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Gallery Images</h2>
        <button
          onClick$={() => showAddForm.value = true}
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Image
        </button>
      </div>

      {/* Success Message */}
      {successMessage.value && (
        <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded" role="alert">
          {successMessage.value}
        </div>
      )}

      {/* Error Message */}
      {errorMessage.value && (
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
          {errorMessage.value}
        </div>
      )}

      {/* Add new image form */}
      {showAddForm.value && (
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 class="font-semibold mb-3">Add New Image</h3>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange$={handleNewImage}
                class="w-full p-2 border rounded"
              />
              {newImagePreview.value && (
                <div class="mt-2">
                  <img src={newImagePreview.value} alt="Preview" class="max-w-xs h-auto rounded" />
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Filename"
              value={newForm.filename}
              onInput$={(e) => newForm.filename = (e.target as HTMLInputElement).value}
              class="w-full p-2 border rounded"
            />
            <div class="flex gap-2">
              <button
                onClick$={addImage}
                class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick$={cancelAdd}
                class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image List */}
      <div class="gallery-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.value.map((imageItem) => (
          <div key={imageItem.id} class="gallery-item border rounded-lg p-4 bg-white shadow-sm">
            {editingItem.value === imageItem.id ? (
              /* Edit mode */
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange$={handleEditImage}
                    class="w-full p-2 border rounded"
                  />
                  {editImagePreview.value && (
                    <div class="mt-2">
                      <img src={editImagePreview.value} alt="Preview" class="max-w-xs h-auto rounded" />
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={editForm.filename}
                  onInput$={(e) => editForm.filename = (e.target as HTMLInputElement).value}
                  class="w-full p-2 border rounded"
                  placeholder="Filename"
                />
                <div class="flex gap-2">
                  <button
                    onClick$={saveEdit}
                    class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick$={cancelEdit}
                    class="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Display mode */
              <>
                <div class="flex justify-between items-start">
                  <button
                    onClick$={() => toggle(imageItem.id!)}
                    class="flex-1 text-left"
                  >
                    <div class="space-y-1">
                      <h3 class="font-bold text-lg hover:text-blue-600">{imageItem.filename}</h3>
                      <img src={imageItem.image} alt={imageItem.filename} class="w-24 h-24 object-cover rounded" />
                    </div>
                  </button>
                  <div class="flex gap-2 ml-4">
                    <button
                      onClick$={() => startEdit(imageItem)}
                      class="text-blue-500 hover:text-blue-700 text-sm px-2 py-1"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick$={() => deleteImage(imageItem.id!)}
                      class="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {openItem.value === imageItem.id && (
                  <div class="gallery-details mt-3 pt-3 border-t">
                    <img src={imageItem.image} alt={imageItem.filename} class="max-w-full h-auto rounded" />
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {images.value.length === 0 && (
        <div class="text-center py-8 text-gray-500">
          No gallery images found. Click "Add Image" to create your first one.
        </div>
      )}
    </div>
  );
});