// src/components/Banners.tsx
import { component$, useSignal, useVisibleTask$, $, useStore } from '@builder.io/qwik';
import { routeLoader$, server$ } from '@builder.io/qwik-city';
import { tursoClient, getBanners, type Banner } from '~/lib/turso';

export const useBannersLoader = routeLoader$(async (event) => {
  const client = tursoClient(event);
  return await getBanners(await client);
});

// Server actions for CRUD operations
export const createBannerAction = server$(async function(title: string, subtitle: string, message: string) {
  console.log('createBannerAction called with:', { title, subtitle, message });
  const response = await fetch(`${this.url.origin}/api/banners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, subtitle, message }),
  });
  console.log('Create API response status:', response.status);
  return response.ok;
});

export const updateBannerAction = server$(async function(id: number, title: string, subtitle: string, message: string) {
  console.log('updateBannerAction called with:', { id, title, subtitle, message });
  const response = await fetch(`${this.url.origin}/api/banners`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, title, subtitle, message }),
  });
  console.log('Update API response status:', response.status);
  console.log('API response ok:', response.ok);
  return response.ok;
});

export const deleteBannerAction = server$(async function(id: number) {
  console.log('deleteBannerAction called with:', { id });
  const response = await fetch(`${this.url.origin}/api/banners`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  console.log('Delete API response status:', response.status);
  return response.ok;
});

export default component$(() => {
  const loaderData = useBannersLoader();
  const banners = useSignal<Banner[]>([]);
  const openItem = useSignal<number | null>(null);
  const editingItem = useSignal<number | null>(null);
  const showAddForm = useSignal(false);
  
  const editForm = useStore({
    title: '',
    subtitle: '',
    message: '',
  });
  
  const newForm = useStore({
    title: '',
    subtitle: '',
    message: '',
  });

  useVisibleTask$(() => {
    banners.value = loaderData.value;
    if (banners.value.length > 0) openItem.value = banners.value[0].id ?? null;
  });

  const toggle = $((id: number) => {
    openItem.value = openItem.value === id ? null : id;
  });

  const startEdit = $((banner: Banner) => {
    editingItem.value = banner.id!;
    editForm.title = banner.title;
    editForm.subtitle = banner.subtitle;
    editForm.message = banner.message;
  });

  const cancelEdit = $(() => {
    editingItem.value = null;
    editForm.title = '';
    editForm.subtitle = '';
    editForm.message = '';
  });

  const saveEdit = $(async () => {
    console.log('saveEdit called', { editingItem: editingItem.value, title: editForm.title, subtitle: editForm.subtitle, message: editForm.message });
    
    if (editingItem.value && editForm.title && editForm.subtitle && editForm.message) {
      console.log('Calling updateBannerAction...');
      try {
        const success = await updateBannerAction(editingItem.value, editForm.title, editForm.subtitle, editForm.message);
        console.log('updateBannerAction result:', success);
        
        if (success) {
          // Update local state
          banners.value = banners.value.map(banner => 
            banner.id === editingItem.value 
              ? { ...banner, title: editForm.title, subtitle: editForm.subtitle, message: editForm.message }
              : banner
          );
          editingItem.value = null;
          editForm.title = '';
          editForm.subtitle = '';
          editForm.message = '';
          console.log('Edit completed successfully');
        } else {
          console.error('Update failed');
        }
      } catch (error) {
        console.error('Error in updateBannerAction:', error);
      }
    } else {
      console.log('Missing required fields:', { 
        editingItem: editingItem.value, 
        title: editForm.title,
        subtitle: editForm.subtitle, 
        message: editForm.message 
      });
    }
  });

  const deleteBanner = $(async (id: number) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      const success = await deleteBannerAction(id);
      if (success) {
        banners.value = banners.value.filter(banner => banner.id !== id);
        if (openItem.value === id) openItem.value = null;
      }
    }
  });

  const addBanner = $(async () => {
    if (newForm.title && newForm.subtitle && newForm.message) {
      const success = await createBannerAction(newForm.title, newForm.subtitle, newForm.message);
      if (success) {
        // Refresh the data (in a real app, you might want to return the new banner from the API)
        window.location.reload();
      }
    }
  });

  const cancelAdd = $(() => {
    showAddForm.value = false;
    newForm.title = '';
    newForm.subtitle = '';
    newForm.message = '';
  });

  return (
    <div class="banner-container max-w-4xl mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Banners</h2>
        <button 
          onClick$={() => showAddForm.value = true}
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Banner
        </button>
      </div>

      {/* Add new banner form */}
      {showAddForm.value && (
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 class="font-semibold mb-3">Add New Banner</h3>
          <div class="space-y-3">
            <input
              type="text"
              placeholder="Title"
              value={newForm.title}
              onInput$={(e) => newForm.title = (e.target as HTMLInputElement).value}
              class="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Subtitle"
              value={newForm.subtitle}
              onInput$={(e) => newForm.subtitle = (e.target as HTMLInputElement).value}
              class="w-full p-2 border rounded"
            />
            <textarea
              placeholder="Message"
              value={newForm.message}
              onInput$={(e) => newForm.message = (e.target as HTMLTextAreaElement).value}
              class="w-full p-2 border rounded h-24"
            />
            <div class="flex gap-2">
              <button
                onClick$={addBanner}
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

      {/* Banner List */}
      <div class="banner-grid space-y-4">
        {banners.value.map((banner) => (
          <div key={banner.id} class="banner-item border rounded-lg p-4 bg-white shadow-sm">
            {editingItem.value === banner.id ? (
              /* Edit mode */
              <div class="space-y-3">
                <input
                  type="text"
                  value={editForm.title}
                  onInput$={(e) => editForm.title = (e.target as HTMLInputElement).value}
                  class="w-full p-2 border rounded font-semibold"
                  placeholder="Title"
                />
                <input
                  type="text"
                  value={editForm.subtitle}
                  onInput$={(e) => editForm.subtitle = (e.target as HTMLInputElement).value}
                  class="w-full p-2 border rounded"
                  placeholder="Subtitle"
                />
                <textarea
                  value={editForm.message}
                  onInput$={(e) => editForm.message = (e.target as HTMLTextAreaElement).value}
                  class="w-full p-2 border rounded h-24"
                  placeholder="Message"
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
                    onClick$={() => toggle(banner.id!)} 
                    class="flex-1 text-left"
                  >
                    <div class="space-y-1">
                      <h3 class="font-bold text-lg hover:text-blue-600">{banner.title}</h3>
                      <p class="text-gray-600 text-sm">{banner.subtitle}</p>
                    </div>
                  </button>
                  <div class="flex gap-2 ml-4">
                    <button
                      onClick$={() => startEdit(banner)}
                      class="text-blue-500 hover:text-blue-700 text-sm px-2 py-1"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick$={() => deleteBanner(banner.id!)}
                      class="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {openItem.value === banner.id && (
                  <div class="banner-message mt-3 pt-3 border-t">
                    {banner.isHtml ? (
                      <div dangerouslySetInnerHTML={banner.message} />
                    ) : (
                      <p class="text-gray-700">{banner.message}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {banners.value.length === 0 && (
        <div class="text-center py-8 text-gray-500">
          No banners found. Click "Add Banner" to create your first one.
        </div>
      )}
    </div>
  );
});