// src/components/admin/FaqAdmin.tsx
import { component$, useSignal, $, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { getFaqs, createFaq, updateFaq, deleteFaq } from "~/lib/turso";

interface Faq {
  id?: number;
  question: string;
  answer: string;
}

export default component$(() => {
  const faqs = useSignal<Faq[]>([]);
  const editing = useStore<{ id: number | null; question: string; answer: string }>({
    id: null,
    question: "",
    answer: "",
  });

  // Load FAQs on component mount
  useVisibleTask$(async () => {
    faqs.value = await getFaqs();
  });

  const startEdit = $((faq: Faq) => {
    editing.id = faq.id || null;
    editing.question = faq.question;
    editing.answer = faq.answer;
  });

  const cancelEdit = $(() => {
    editing.id = null;
    editing.question = "";
    editing.answer = "";
  });

  const saveFaq = $(async () => {
    if (editing.id === null) {
      await createFaq(editing.question, editing.answer);
    } else {
      await updateFaq(editing.id, editing.question, editing.answer);
    }
    faqs.value = await getFaqs(); // Refresh list
    cancelEdit();
  });

  const removeFaq = $(async (id?: number) => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this FAQ?")) {
      await deleteFaq(id);
      faqs.value = await getFaqs();
    }
  });

  return (
    <section class="max-w-4xl mx-auto p-6 space-y-6">
      <h2 class="text-3xl font-bold">FAQ Admin Panel</h2>

      {/* Form */}
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-3">
        <input
          type="text"
          placeholder="Question"
          class="w-full p-2 border rounded"
          value={editing.question}
          onInput$={(e) => (editing.question = (e.target as HTMLInputElement).value)}
        />
        <textarea
          placeholder="Answer"
          class="w-full p-2 border rounded"
          rows={4}
          value={editing.answer}
          onInput$={(e) => (editing.answer = (e.target as HTMLTextAreaElement).value)}
        />

        <div class="flex gap-2">
          <button class="bg-green-600 text-white px-4 py-2 rounded" onClick$={saveFaq}>
            {editing.id === null ? "Add FAQ" : "Save FAQ"}
          </button>
          {editing.id !== null && (
            <button class="bg-gray-500 text-white px-4 py-2 rounded" onClick$={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div class="space-y-3">
        {faqs.value.map((faq) => (
          <div key={faq.id} class="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded">
            <div>
              <strong>{faq.question}</strong>
              <p>{faq.answer}</p>
            </div>
            <div class="flex gap-2">
              <button class="bg-blue-600 text-white px-3 py-1 rounded" onClick$={() => startEdit(faq)}>
                Edit
              </button>
              <button class="bg-red-600 text-white px-3 py-1 rounded" onClick$={() => removeFaq(faq.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});
