// src/components/Faqs.tsx
import { component$, useSignal, useVisibleTask$, $, useStore } from '@builder.io/qwik';
import { routeLoader$, server$ } from '@builder.io/qwik-city';
import { tursoClient, getFaqs, type Faq } from '~/lib/turso';

export const useFaqsLoader = routeLoader$(async (event) => {
  const client = tursoClient(event);
  return await getFaqs(client);
});

// Server actions for CRUD operations
export const createFaqAction = server$(async function(question: string, answer: string) {
  console.log('createFaqAction called with:', { question, answer });
  const response = await fetch(`${this.url.origin}/api/faqs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer }),
  });
  console.log('Create API response status:', response.status);
  return response.ok;
});

export const updateFaqAction = server$(async function(id: number, question: string, answer: string) {
  console.log('updateFaqAction called with:', { id, question, answer });
  const response = await fetch(`${this.url.origin}/api/faqs`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, question, answer }),
  });
  console.log('Update API response status:', response.status);
  console.log('API response ok:', response.ok);
  return response.ok;
});

export const deleteFaqAction = server$(async function(id: number) {
  console.log('deleteFaqAction called with:', { id });
  const response = await fetch(`${this.url.origin}/api/faqs`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  console.log('Delete API response status:', response.status);
  return response.ok;
});

export default component$(() => {
  const loaderData = useFaqsLoader();
  const faqs = useSignal<Faq[]>([]);
  const openItem = useSignal<number | null>(null);
  const editingItem = useSignal<number | null>(null);
  const showAddForm = useSignal(false);
  
  const editForm = useStore({
    question: '',
    answer: '',
  });
  
  const newForm = useStore({
    question: '',
    answer: '',
  });

  useVisibleTask$(() => {
    faqs.value = loaderData.value;
    if (faqs.value.length > 0) openItem.value = faqs.value[0].id ?? null;
  });

  const toggle = $((id: number) => {
    openItem.value = openItem.value === id ? null : id;
  });

  const startEdit = $((faq: Faq) => {
    editingItem.value = faq.id!;
    editForm.question = faq.question;
    editForm.answer = faq.answer;
  });

  const cancelEdit = $(() => {
    editingItem.value = null;
    editForm.question = '';
    editForm.answer = '';
  });

  const saveEdit = $(async () => {
    console.log('saveEdit called', { editingItem: editingItem.value, question: editForm.question, answer: editForm.answer });
    
    if (editingItem.value && editForm.question && editForm.answer) {
      console.log('Calling updateFaqAction...');
      try {
        const success = await updateFaqAction(editingItem.value, editForm.question, editForm.answer);
        console.log('updateFaqAction result:', success);
        
        if (success) {
          // Update local state
          faqs.value = faqs.value.map(faq => 
            faq.id === editingItem.value 
              ? { ...faq, question: editForm.question, answer: editForm.answer }
              : faq
          );
          editingItem.value = null;
          editForm.question = '';
          editForm.answer = '';
          console.log('Edit completed successfully');
        } else {
          console.error('Update failed');
        }
      } catch (error) {
        console.error('Error in updateFaqAction:', error);
      }
    } else {
      console.log('Missing required fields:', { 
        editingItem: editingItem.value, 
        question: editForm.question, 
        answer: editForm.answer 
      });
    }
  });

  const deleteFaq = $(async (id: number) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      const success = await deleteFaqAction(id);
      if (success) {
        faqs.value = faqs.value.filter(faq => faq.id !== id);
        if (openItem.value === id) openItem.value = null;
      }
    }
  });

  const addFaq = $(async () => {
    if (newForm.question && newForm.answer) {
      const success = await createFaqAction(newForm.question, newForm.answer);
      if (success) {
        // Refresh the data (in a real app, you might want to return the new FAQ from the API)
        window.location.reload();
      }
    }
  });

  const cancelAdd = $(() => {
    showAddForm.value = false;
    newForm.question = '';
    newForm.answer = '';
  });

  return (
    <div class="faq-container max-w-4xl mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Frequently Asked Questions</h2>
        <button 
          onClick$={() => showAddForm.value = true}
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add FAQ
        </button>
      </div>

      {/* Add new FAQ form */}
      {showAddForm.value && (
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 class="font-semibold mb-3">Add New FAQ</h3>
          <div class="space-y-3">
            <input
              type="text"
              placeholder="Question"
              value={newForm.question}
              onInput$={(e) => newForm.question = (e.target as HTMLInputElement).value}
              class="w-full p-2 border rounded"
            />
            <textarea
              placeholder="Answer"
              value={newForm.answer}
              onInput$={(e) => newForm.answer = (e.target as HTMLTextAreaElement).value}
              class="w-full p-2 border rounded h-24"
            />
            <div class="flex gap-2">
              <button
                onClick$={addFaq}
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

      {/* FAQ List */}
      <div class="faq-grid space-y-4">
        {faqs.value.map((faq) => (
          <div key={faq.id} class="faq-item border rounded-lg p-4 bg-white shadow-sm">
            {editingItem.value === faq.id ? (
              /* Edit mode */
              <div class="space-y-3">
                <input
                  type="text"
                  value={editForm.question}
                  onInput$={(e) => editForm.question = (e.target as HTMLInputElement).value}
                  class="w-full p-2 border rounded font-semibold"
                />
                <textarea
                  value={editForm.answer}
                  onInput$={(e) => editForm.answer = (e.target as HTMLTextAreaElement).value}
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
              /* Display mode */
              <>
                <div class="flex justify-between items-start">
                  <button 
                    onClick$={() => toggle(faq.id!)} 
                    class="flex-1 text-left font-semibold hover:text-blue-600"
                  >
                    {faq.question}
                  </button>
                  <div class="flex gap-2 ml-4">
                    <button
                      onClick$={() => startEdit(faq)}
                      class="text-blue-500 hover:text-blue-700 text-sm px-2 py-1"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick$={() => deleteFaq(faq.id!)}
                      class="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {openItem.value === faq.id && (
                  <div class="faq-answer mt-3 pt-3 border-t">
                    {faq.isHtml ? (
                      <div dangerouslySetInnerHTML={faq.answer} />
                    ) : (
                      <p class="text-gray-700">{faq.answer}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {faqs.value.length === 0 && (
        <div class="text-center py-8 text-gray-500">
          No FAQs found. Click "Add FAQ" to create your first one.
        </div>
      )}
    </div>
  );
});