// src/components/Reviews.tsx
import { component$, useSignal, useVisibleTask$, $, useStore } from '@builder.io/qwik';
import { server$ } from '@builder.io/qwik-city';
import { type Review } from '~/lib/turso';

// Props interface
interface ReviewsProps {
  reviewsData: Review[];
}

// Server actions
export const createReviewAction = server$(async function (
  name: string,
  review_text: string,
  rating: number,
  date: string,
  role: string
) {
  const response = await fetch(`${this.url.origin}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, review_text, rating, date, role }),
  });
  return response.ok;
});

export const updateReviewAction = server$(async function (
  id: number,
  name: string,
  review_text: string,
  rating: number,
  date: string,
  role: string
) {
  const response = await fetch(`${this.url.origin}/api/reviews`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name, review_text, rating, date, role }),
  });
  return response.ok;
});

export const deleteReviewAction = server$(async function (id: number) {
  const response = await fetch(`${this.url.origin}/api/reviews`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return response.ok;
});

export default component$<ReviewsProps>(({ reviewsData }) => {
  const reviews = useSignal<Review[]>([]);
  const openItem = useSignal<number | null>(null);
  const editingItem = useSignal<number | null>(null);
  const showAddForm = useSignal(false);

  const editForm = useStore({
    name: '',
    review_text: '',
    rating: 5,
    date: new Date().toISOString().split('T')[0],
    role: '',
  });

  const newForm = useStore({
    name: '',
    review_text: '',
    rating: 5,
    date: new Date().toISOString().split('T')[0],
    role: '',
  });

  useVisibleTask$(() => {
    reviews.value = reviewsData;
    if (reviews.value.length > 0) openItem.value = reviews.value[0].id ?? null;
  });

  const toggle = $((id: number) => {
    openItem.value = openItem.value === id ? null : id;
  });

  const startEdit = $((review: Review) => {
    editingItem.value = review.id!;
    editForm.name = review.name;
    editForm.review_text = review.review_text;
    editForm.rating = review.rating;
    editForm.date = review.date;
    editForm.role = review.role;
  });

  const cancelEdit = $(() => {
    editingItem.value = null;
    editForm.name = '';
    editForm.review_text = '';
    editForm.rating = 5;
    editForm.date = new Date().toISOString().split('T')[0];
    editForm.role = '';
  });

  const saveEdit = $(async () => {
    if (
      editingItem.value &&
      editForm.name &&
      editForm.review_text &&
      editForm.rating &&
      editForm.date &&
      editForm.role
    ) {
      const success = await updateReviewAction(
        editingItem.value,
        editForm.name,
        editForm.review_text,
        editForm.rating,
        editForm.date,
        editForm.role
      );
      if (success) {
        reviews.value = reviews.value.map((r) =>
          r.id === editingItem.value
            ? { ...r, ...editForm }
            : r
        );
        cancelEdit();
      }
    }
  });

  const deleteReview = $(async (id: number) => {
    if (confirm('Are you sure you want to delete this review?')) {
      const success = await deleteReviewAction(id);
      if (success) {
        reviews.value = reviews.value.filter((r) => r.id !== id);
        if (openItem.value === id) openItem.value = null;
      }
    }
  });

  const addReview = $(async () => {
    if (newForm.name && newForm.review_text && newForm.rating && newForm.date && newForm.role) {
      const success = await createReviewAction(
        newForm.name,
        newForm.review_text,
        newForm.rating,
        newForm.date,
        newForm.role
      );
      if (success) window.location.reload();
    }
  });

  const cancelAdd = $(() => {
    showAddForm.value = false;
    newForm.name = '';
    newForm.review_text = '';
    newForm.rating = 5;
    newForm.date = new Date().toISOString().split('T')[0];
    newForm.role = '';
  });

  return (
    <div class="reviews-container max-w-4xl mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Reviews Management</h2>
        <button
          onClick$={() => (showAddForm.value = true)}
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Review
        </button>
      </div>

      {showAddForm.value && (
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 class="font-semibold mb-3">Add New Review</h3>
          <div class="space-y-3">
            <input
              type="text"
              placeholder="Name"
              value={newForm.name}
              onInput$={(e) => (newForm.name = (e.target as HTMLInputElement).value)}
              class="w-full p-2 border rounded"
            />
            <select
              value={String(newForm.rating)}
              onChange$={(e) => (newForm.rating = Number((e.target as HTMLSelectElement).value))}
              class="w-full p-2 border rounded"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={String(num)}>
                  {`${num} Star${num > 1 ? 's' : ''}`}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={newForm.date}
              onInput$={(e) => (newForm.date = (e.target as HTMLInputElement).value)}
              class="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Role"
              value={newForm.role}
              onInput$={(e) => (newForm.role = (e.target as HTMLInputElement).value)}
              class="w-full p-2 border rounded"
            />
            <textarea
              placeholder="Review Text"
              value={newForm.review_text}
              onInput$={(e) => (newForm.review_text = (e.target as HTMLTextAreaElement).value)}
              class="w-full p-2 border rounded h-24"
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

      <div class="reviews-grid space-y-4">
        {reviews.value.length > 0 ? (
          reviews.value.map((review) => (
            <div key={String(review.id)} class="review-item border rounded-lg p-4 bg-white shadow-sm">
              {editingItem.value === review.id ? (
                <div class="space-y-3">
                  <input
                    type="text"
                    value={editForm.name}
                    onInput$={(e) => (editForm.name = (e.target as HTMLInputElement).value)}
                    class="w-full p-2 border rounded font-semibold"
                  />
                  <select
                    value={String(editForm.rating)}
                    onChange$={(e) => (editForm.rating = Number((e.target as HTMLSelectElement).value))}
                    class="w-full p-2 border rounded"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={String(num)}>
                        {`${num} Star${num > 1 ? 's' : ''}`}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={editForm.date}
                    onInput$={(e) => (editForm.date = (e.target as HTMLInputElement).value)}
                    class="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={editForm.role}
                    onInput$={(e) => (editForm.role = (e.target as HTMLInputElement).value)}
                    class="w-full p-2 border rounded"
                  />
                  <textarea
                    value={editForm.review_text}
                    onInput$={(e) => (editForm.review_text = (e.target as HTMLTextAreaElement).value)}
                    class="w-full p-2 border rounded h-24"
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
                <>
                  <div class="flex justify-between items-start">
                    <button
                      onClick$={() => toggle(review.id!)}
                      class="flex-1 text-left font-semibold hover:text-blue-600"
                    >
                      {`${review.name} - ${review.rating} Star${review.rating > 1 ? 's' : ''} (${review.role})`}
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
                    <div class="review-comment mt-3 pt-3 border-t">
                      <p class="text-gray-700">{review.review_text}</p>
                      <p class="text-sm text-gray-500">Date: {review.date}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        ) : (
          <div class="text-center py-8 text-gray-500">
            No reviews found. Click "Add Review" to create your first one.
          </div>
        )}
      </div>
    </div>
  );
});
