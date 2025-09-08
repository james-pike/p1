// src/routes/reviews/index.tsx
import { component$, useSignal, $ } from '@builder.io/qwik';
import { routeLoader$, server$ } from '@builder.io/qwik-city';
import { tursoClient } from '~/lib/turso';

interface ReviewRow {
  id: number;
  name: string;
  review: string;
  rating: number;
  date: string;
  role: string;
}

interface Review {
  id: number;
  name: string;
  review: string;
  rating: number;
  date: string;
  role: string;
}

export const useReviewsLoader = routeLoader$(async (event) => {
  try {
    const client = tursoClient(event);
    const result = await client.execute('SELECT * FROM reviews ORDER BY id ASC');
    return result.rows.map((row: any) => ({
      id: Number(row.id) || 0,
      name: String(row.name) || '',
      review: String(row.review) || '',
      rating: Number(row.rating) || 0,
      date: String(row.date) || '', // Ensure date is in a valid format
      role: String(row.role) || '',
    })) as Review[];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
});

const saveReview$ = server$(async function(reviewData: { id?: string; name: string; review: string; rating: number; date: string; role: string }, { request }) {
  const client = tursoClient({ request });
  try {
    if (reviewData.id) {
      // Update existing review
      await client.execute({
        sql: 'UPDATE reviews SET name = ?, review = ?, rating = ?, date = ?, role = ? WHERE id = ?',
        args: [reviewData.name, reviewData.review, reviewData.rating, reviewData.date, reviewData.role, parseInt(reviewData.id)],
      });
      return { success: true };
    } else {
      // Create new review
      const result = await client.execute({
        sql: 'INSERT INTO reviews (name, review, rating, date, role) VALUES (?, ?, ?, ?, ?) RETURNING id',
        args: [reviewData.name, reviewData.review, reviewData.rating, reviewData.date, reviewData.role],
      });
      return { success: true, id: result.rows[0].id };
    }
  } catch (error) {
    console.error('Save error:', error);
    return { success: false, error: 'Failed to save review' };
  }
});

const deleteReview$ = server$(async function(id: string, { request }) {
  const client = tursoClient({ request });
  try {
    await client.execute({
      sql: 'DELETE FROM reviews WHERE id = ?',
      args: [parseInt(id)],
    });
    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: 'Failed to delete review' };
  }
});

export default component$(() => {
  const reviews = useReviewsLoader();
  const showForm = useSignal(false);
  const editingReview = useSignal<{ id: number; name: string; review: string; rating: number; date: string; role: string } | null>(null);
  const isLoading = useSignal(false);
  const error = useSignal<string>('');
  const success = useSignal<string>('');

  const handleSubmit = $(async (event: SubmitEvent) => {
    event.preventDefault();
    isLoading.value = true;
    error.value = '';
    success.value = '';

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const reviewData = {
      id: editingReview.value?.id.toString(),
      name: formData.get('name') as string,
      review: formData.get('review') as string,
      rating: parseInt(formData.get('rating') as string) || 0,
      date: formData.get('date') as string, // Expecting YYYY-MM-DD from date input
      role: formData.get('role') as string,
    };

    try {
      const result = await saveReview$(reviewData);
      if (result.success) {
        success.value = editingReview.value ? 'Review updated successfully!' : 'Review created successfully!';
        setTimeout(() => {
          showForm.value = false;
          editingReview.value = null;
          window.location.reload();
        }, 1500);
      } else {
        error.value = result.error || 'Something went wrong';
      }
    } catch (err) {
      error.value = 'Network error occurred';
      console.error('Save error:', err);
    } finally {
      isLoading.value = false;
    }
  });

  const handleDelete = $(async (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      const result = await deleteReview$(id);
      if (result.success) {
        success.value = 'Review deleted successfully!';
        setTimeout(() => window.location.reload(), 1500);
      } else {
        alert(result.error || 'Failed to delete review');
      }
    }
  });

  const handleEdit = $((review: Review) => {
    editingReview.value = { ...review }; // Copy review object
    showForm.value = true;
    error.value = '';
    success.value = '';
  });

  const cancelForm = $(() => {
    editingReview.value = null;
    showForm.value = false;
    error.value = '';
    success.value = '';
  });

  return (
    <div class="flex">
      {/* Sidebar would go here if added back */}
      <div class="ml-64 w-full"> {/* Adjust if using Sidebar */}
        <div class="container mx-auto px-4 py-8">
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold">Review Management</h1>
            <button
              onClick$={() => (showForm.value ? cancelForm() : (showForm.value = true))}
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              {showForm.value ? 'Cancel' : 'Add New Review'}
            </button>
          </div>

          {showForm.value && (
            <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 class="text-xl font-bold mb-4">{editingReview.value ? 'Edit Review' : 'Add New Review'}</h2>
              <form onSubmit$={handleSubmit} class="space-y-4">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text" id="name" name="name" required value={editingReview.value?.name || ''}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label for="review" class="block text-sm font-medium text-gray-700 mb-1">Review</label>
                  <textarea
                    id="review" name="review" required rows={3} value={editingReview.value?.review || ''}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label for="rating" class="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                  <input
                    type="number" id="rating" name="rating" min="1" max="5" required
                    value={editingReview.value?.rating || ''}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label for="date" class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date" id="date" name="date" required
                    value={editingReview.value?.date.split('T')[0] || ''} // Extract YYYY-MM-DD
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input
                    type="text" id="role" name="role" required value={editingReview.value?.role || ''}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {error.value && <div class="text-red-600 text-sm bg-red-50 p-2 rounded">{error.value}</div>}
                {success.value && <div class="text-green-600 text-sm bg-green-50 p-2 rounded">{success.value}</div>}
                <div class="flex gap-2">
                  <button
                    type="submit" disabled={isLoading.value}
                    class={`flex-1 py-2 px-4 rounded-md font-medium ${
                      isLoading.value ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                    } text-white transition-colors`}
                  >
                    {isLoading.value ? 'Processing...' : editingReview.value ? 'Update Review' : 'Add Review'}
                  </button>
                  <button
                    type="button" onClick$={cancelForm}
                    class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.value.map((review) => (
              <div key={review.id} class="bg-white rounded-lg shadow-md p-4">
                <h2 class="text-xl font-semibold mb-2">{review.name}</h2>
                <p class="text-gray-600 mb-2">Rating: {review.rating}/5</p>
                <p class="text-gray-600 mb-2">Date: {new Date(review.date).toLocaleDateString()}</p>
                <p class="text-gray-600 mb-2">Role: {review.role}</p>
                <p class="text-gray-700 mb-4">{review.review}</p>
                <div class="flex gap-2">
                  <button
                    onClick$={() => handleEdit(review)}
                    class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick$={() => handleDelete(review.id.toString())}
                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {reviews.value.length === 0 && (
            <div class="text-center py-12">
              <p class="text-gray-500 text-lg">No reviews available yet.</p>
              <button
                onClick$={() => showForm.value = true}
                class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Add Your First Review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});