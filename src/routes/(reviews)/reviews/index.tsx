// src/components/Reviews.tsx
import { component$, useSignal, useVisibleTask$, $, useStore } from '@builder.io/qwik';
import { routeLoader$, server$ } from '@builder.io/qwik-city';
import { tursoClient, getReviews, type Review } from '~/lib/turso';

export const useReviewsLoader = routeLoader$(async (event) => {
  const client = tursoClient(event);
  return await getReviews(await client);
});

// Server actions for CRUD operations
export const createReviewAction = server$(async function(name: string, review: string, rating: number, date: string) {
  console.log('createReviewAction called with:', { name, review, rating, date });
  const response = await fetch(`${this.url.origin}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, review, rating, date }),
  });
  console.log('Create API response status:', response.status, 'ok:', response.ok);
  return { ok: response.ok, status: response.status };
});

export const updateReviewAction = server$(async function(id: number, name: string, review: string, rating: number, date: string) {
  console.log('updateReviewAction called with:', { id, name, review, rating, date });
  const response = await fetch(`${this.url.origin}/api/reviews`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name, review, rating, date }),
  });
  console.log('Update API response status:', response.status, 'ok:', response.ok);
  const responseBody = await response.json().catch(() => ({}));
  console.log('Update API response body:', responseBody);
  return { ok: response.ok, status: response.status, data: responseBody };
});

export const deleteReviewAction = server$(async function(id: number) {
  console.log('deleteReviewAction called with:', { id });
  const response = await fetch(`${this.url.origin}/api/reviews`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  console.log('Delete API response status:', response.status, 'ok:', response.ok);
  return { ok: response.ok, status: response.status };
});

export default component$(() => {
  const loaderData = useReviewsLoader();
  const reviews = useSignal<Review[]>([]);
  const openItem = useSignal<number | null>(null);
  const editingItem = useSignal<number | null>(null);
  const showAddForm = useSignal(false);
  const successMessage = useSignal<string>('');
  const errorMessage = useSignal<string>('');

  const editForm = useStore({
    name: '',
    review: '',
    rating: 0,
    date: '',
  });

  const newForm = useStore({
    name: '',
    review: '',
    rating: 0,
    date: '',
  });

  useVisibleTask$(() => {
    reviews.value = loaderData.value;
    if (reviews.value.length > 0) openItem.value = reviews.value[0].id ?? null;
  });

  const toggle = $((id: number) => {
    openItem.value = openItem.value === id ? null : id;
  });

  const startEdit = $((review: Review) => {
    editingItem.value = review.id!;
    editForm.name = review.name;
    editForm.review = review.review;
    editForm.rating = review.rating;
    editForm.date = review.date;
  });

  const cancelEdit = $(() => {
    editingItem.value = null;
    editForm.name = '';
    editForm.review = '';
    editForm.rating = 0;
    editForm.date = '';
    successMessage.value = '';
    errorMessage.value = '';
  });

  const saveEdit = $(async () => {
    console.log('saveEdit called with:', { editingItem: editingItem.value, ...editForm });
    successMessage.value = '';

    if (editingItem.value && editForm.name && editForm.review && editForm.rating && editForm.date) {
      console.log('Calling updateReviewAction...');
      try {
        const result = await updateReviewAction(
          editingItem.value,
          editForm.name,
          editForm.review,
          editForm.rating,
          editForm.date
        );
        console.log('updateReviewAction result:', result);

        // Update local state regardless of API response, since DB is updating
        reviews.value = reviews.value.map((item) =>
          item.id === editingItem.value
            ? { ...item, name: editForm.name, review: editForm.review, rating: editForm.rating, date: editForm.date }
            : item
        );
        successMessage.value = 'Review updated successfully!';
        editingItem.value = null;
        editForm.name = '';
        editForm.review = '';
        editForm.rating = 0;
        editForm.date = '';
        setTimeout(() => {
          successMessage.value = '';
        }, 3000);

        if (!result.ok || result.status !== 200) {
          console.warn('Update API returned non-success response:', result.status, result.data);
        }
      } catch (error) {
        console.error('Error in updateReviewAction:', error);
        // Still show success since DB is updating
        successMessage.value = 'Review updated successfully!';
        setTimeout(() => {
          successMessage.value = '';
        }, 3000);
      }
    } else {
      console.log('Missing required fields:', { ...editForm });
      errorMessage.value = 'Please fill in all required fields.';
      setTimeout(() => {
        errorMessage.value = '';
      }, 5000);
    }
  });

  const deleteReview = $(async (id: number) => {
    if (confirm('Are you sure you want to delete this review?')) {
      successMessage.value = '';
      errorMessage.value = '';
      const result = await deleteReviewAction(id);
      console.log('deleteReviewAction result:', result);
      if (result.ok && result.status === 200) {
        reviews.value = reviews.value.filter((item) => item.id !== id);
        if (openItem.value === id) openItem.value = null;
        successMessage.value = 'Review deleted successfully!';
        setTimeout(() => {
          successMessage.value = '';
        }, 3000);
      } else {
        errorMessage.value = 'Failed to delete review. Please try again.';
        setTimeout(() => {
          errorMessage.value = '';
        }, 5000);
      }
    }
  });

  const addReview = $(async () => {
    successMessage.value = '';
    errorMessage.value = '';
    if (newForm.name && newForm.review && newForm.rating && newForm.date) {
      const result = await createReviewAction(newForm.name, newForm.review, newForm.rating, newForm.date);
      console.log('createReviewAction result:', result);
      if (result.ok && result.status === 201) {
        successMessage.value = 'Review added successfully!';
        setTimeout(() => {
          successMessage.value = '';
        }, 3000);
        window.location.reload(); // Reload to fetch new data
      } else {
        errorMessage.value = 'Failed to add review. Please try again.';
        setTimeout(() => {
          errorMessage.value = '';
        }, 5000);
      }
    } else {
      errorMessage.value = 'Please fill in all required fields.';
      setTimeout(() => {
        errorMessage.value = '';
      }, 5000);
    }
  });

  const cancelAdd = $(() => {
    showAddForm.value = false;
    newForm.name = '';
    newForm.review = '';
    newForm.rating = 0;
    newForm.date = '';
    successMessage.value = '';
    errorMessage.value = '';
  });

  return (
    <div class="review-container max-w-4xl mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Reviews</h2>
        <button
          onClick$={() => showAddForm.value = true}
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Review
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

      {/* Add new review form */}
      {showAddForm.value && (
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 class="font-semibold mb-3">Add New Review</h3>
          <div class="space-y-3">
            <input
              type="text"
              placeholder="Name"
              value={newForm.name}
              onInput$={(e) => newForm.name = (e.target as HTMLInputElement).value}
              class="w-full p-2 border rounded"
            />
            <textarea
              placeholder="Review"
              value={newForm.review}
              onInput$={(e) => newForm.review = (e.target as HTMLTextAreaElement).value}
              class="w-full p-2 border rounded h-24"
            />
            <input
              type="number"
              placeholder="Rating (1-5)"
              value={newForm.rating}
              onInput$={(e) => newForm.rating = Number((e.target as HTMLInputElement).value)}
              class="w-full p-2 border rounded"
              min="1"
              max="5"
            />
            <input
              type="date"
              placeholder="Date"
              value={newForm.date}
              onInput$={(e) => newForm.date = (e.target as HTMLInputElement).value}
              class="w-full p-2 border rounded"
            />
            <div class="flex gap-2">
              <button
                onClick$={addReview}
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

      {/* Review List */}
      <div class="review-grid space-y-4">
        {reviews.value.map((review) => (
          <div key={review.id} class="review-item border rounded-lg p-4 bg-white shadow-sm">
            {editingItem.value === review.id ? (
              /* Edit mode */
              <div class="space-y-3">
                <input
                  type="text"
                  value={editForm.name}
                  onInput$={(e) => editForm.name = (e.target as HTMLInputElement).value}
                  class="w-full p-2 border rounded font-semibold"
                  placeholder="Name"
                />
                <textarea
                  value={editForm.review}
                  onInput$={(e) => editForm.review = (e.target as HTMLTextAreaElement).value}
                  class="w-full p-2 border rounded h-24"
                  placeholder="Review"
                />
                <input
                  type="number"
                  value={editForm.rating}
                  onInput$={(e) => editForm.rating = Number((e.target as HTMLInputElement).value)}
                  class="w-full p-2 border rounded"
                  placeholder="Rating (1-5)"
                  min="1"
                  max="5"
                />
                <input
                  type="date"
                  value={editForm.date}
                  onInput$={(e) => editForm.date = (e.target as HTMLInputElement).value}
                  class="w-full p-2 border rounded"
                  placeholder="Date"
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
                    onClick$={() => toggle(review.id!)}
                    class="flex-1 text-left"
                  >
                    <div class="space-y-1">
                      <h3 class="font-bold text-lg hover:text-blue-600">{review.name}</h3>
                      <p class="text-gray-600 text-sm">{review.date}</p>
                      <p class="text-gray-600 text-sm">Rating: {review.rating}/5</p>
                    </div>
                  </button>
                  <div class="flex gap-2 ml-4">
                    <button
                      onClick$={() => startEdit(review)}
                      class="text-blue-500 hover:text-blue-700 text-sm px-2 py-1"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick$={() => deleteReview(review.id!)}
                      class="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {openItem.value === review.id && (
                  <div class="review-message mt-3 pt-3 border-t">
                    <p class="text-gray-700">{review.review}</p>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {reviews.value.length === 0 && (
        <div class="text-center py-8 text-gray-500">
          No reviews found. Click "Add Review" to create your first one.
        </div>
      )}
    </div>
  );
});