// src/components/Faqs.tsx
import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { tursoClient, getFaqs, type Faq } from '~/lib/turso';

export const useFaqsLoader = routeLoader$(async (event) => {
  const client = tursoClient(event);
  return await getFaqs(client);
});

export default component$(() => {
  const loaderData = useFaqsLoader();
  const faqs = useSignal<Faq[]>([]);
  const openItem = useSignal<number | null>(null);

  useVisibleTask$(() => {
    faqs.value = loaderData.value;
    if (faqs.value.length > 0) openItem.value = faqs.value[0].id ?? null;
  });

  const toggle = (id: number) => {
    openItem.value = openItem.value === id ? null : id;
  };

  return (
    <div class="faq-grid">
      {faqs.value.map((faq) => (
        <div key={faq.id} class="faq-item border rounded-lg p-4 mb-2">
          <button onClick$={() => toggle(faq.id!)} class="w-full text-left font-semibold">
            {faq.question}
          </button>
          {openItem.value === faq.id && (
            <div class="faq-answer mt-2">
              {faq.isHtml ? (
                <div dangerouslySetInnerHTML={faq.answer} />
              ) : (
                <p>{faq.answer}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
});
