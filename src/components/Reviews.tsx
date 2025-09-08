// src/components/Reviews.tsx
import { component$, useSignal, useStore, useVisibleTask$, $ } from '@builder.io/qwik';
import { server$ } from '@builder.io/qwik-city';
import type { Review } from '~/lib/turso';
import { tursoClient, getReviews, createReview, updateReview, deleteReview } from '~/lib/turso';

interface ReviewsProps {
  reviewsData: Review[];
}

// Server actions
export const createReviewAction = server$(async function (name: string, review: string, rating: number, date: string, role: string) {
  const response = await fetch(`${this.url.origin}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, review, rating, date, role }),
  });
  return response.ok;
});

export const updateReviewAction = server$(async function (id: number, name: string, review: string, rating: number, date: string, role: string) {
  const response = await fetch(`${this.url.origin}/api/reviews`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name, review, rating, date, role }),
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
  const editingItem = useSignal<number | null>(null);
  const showAddForm = useSignal(false);

  const editForm = useStore({ name: '', review: '', rating: 0, date: '', role: '' });
  const newForm = useStore({ name: '', review: '', rating: 0, date: '', role: '' });

  useVisibleTask$(() => {
    reviews.value = reviewsData;
  });

  const startEdit = $((r: Review) => {
    editingItem.value = r.id!;
    editForm.name = r.name;
    editForm.review = r.review;
    editForm.rating = r.rating;
    editForm.date = r.date;
    editForm.role = r.role;
  });

  const cancelEdit = $(() => editingItem.value = null);

  const saveEdit = $(async () => {
    if (editingItem.value != null) {
      const success = await updateReviewAction(
        editingItem.value,
        editForm.name,
        editForm.review,
        editForm.rating,
        editForm.date,
        editForm.role
      );
      if (success) {
        reviews.value = reviews.value.map(r =>
          r.id === editingItem.value ? { ...r, ...editForm } : r
        );
        editingItem.value = null;
      }
    }
  });

  const deleteItem = $(async (id: number) => {
    if (confirm('Delete this review?')) {
      const success = await deleteReviewAction(id);
      if (success) reviews.value = reviews.value.filter(r => r.id !== id);
    }
  });

  const addReview = $(async () => {
    if (newForm.name && newForm.review) {
      const success = await createReviewAction(
        newForm.name, newForm.review, newForm.rating, newForm.date, newForm.role
      );
      if (success) window.location.reload();
    }
  });

  return (
    <div class="max-w-4xl mx-auto p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Reviews</h2>
        <button onClick$={() => showAddForm.value = true} class="bg-blue-500 text-white px-4 py-2 rounded">Add Review</button>
      </div>

      {showAddForm.value && (
        <div class="bg-gray-50 p-4 rounded mb-6">
          <input type="text" placeholder="Name" value={newForm.name} onInput$={e => newForm.name = (e.target as HTMLInputElement).value} class="w-full mb-2 p-2 border rounded" />
          <textarea placeholder="Review" value={newForm.review} onInput$={e => newForm.review = (e.target as HTMLTextAreaElement).value} class="w-full mb-2 p-2 border rounded h-24" />
          <input type="number" placeholder="Rating" value={newForm.rating} onInput$={e => newForm.rating = Number((e.target as HTMLInputElement).value)} class="w-full mb-2 p-2 border rounded" />
          <input type="text" placeholder="Date" value={newForm.date} onInput$={e => newForm.date = (e.target as HTMLInputElement).value} class="w-full mb-2 p-2 border rounded" />
          <input type="text" placeholder="Role" value={newForm.role} onInput$={e => newForm.role = (e.target as HTMLInputElement).value} class="w-full mb-2 p-2 border rounded" />
          <div class="flex gap-2">
            <button onClick$={addReview} class="bg-green-500 text-white px-4 py-2 rounded">Save</button>
            <button onClick$={() => showAddForm.value = false} class="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
          </div>
        </div>
      )}

      <div class="space-y-4">
        {reviews.value.map(r => (
          <div key={r.id} class="border p-4 rounded bg-white">
            {editingItem.value === r.id ? (
              <>
                <input type="text" value={editForm.name} onInput$={e => editForm.name = (e.target as HTMLInputElement).value} class="w-full mb-2 p-2 border rounded" />
                <textarea value={editForm.review} onInput$={e => editForm.review = (e.target as HTMLTextAreaElement).value} class="w-full mb-2 p-2 border rounded h-24" />
                <input type="number" value={editForm.rating} onInput$={e => editForm.rating = Number((e.target as HTMLInputElement).value)} class="w-full mb-2 p-2 border rounded" />
                <input type="text" value={editForm.date} onInput$={e => editForm.date = (e.target as HTMLInputElement).value} class="w-full mb-2 p-2 border rounded" />
                <input type="text" value={editForm.role} onInput$={e => editForm.role = (e.target as HTMLInputElement).value} class="w-full mb-2 p-2 border rounded" />
                <div class="flex gap-2">
                  <button onClick$={saveEdit} class="bg-green-500 text-white px-3 py-1 rounded">Save</button>
                  <button onClick$={cancelEdit} class="bg-gray-500 text-white px-3 py-1 rounded">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <p class="font-semibold">{r.name} ({r.role})</p>
                <p>{r.review}</p>
                <p class="text-sm text-gray-500">Rating: {r.rating} | Date: {r.date}</p>
                <div class="flex gap-2 mt-2">
                  <button onClick$={() => startEdit(r)} class="text-blue-500">Edit</button>
                  <button onClick$={() => deleteItem(r.id!)} class="text-red-500">Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});
