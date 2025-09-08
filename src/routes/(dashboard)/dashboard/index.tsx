// src/routes/dashboard/index.tsx
import { component$, useSignal } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import Faqs from '~/components/FAQ';
import Reviews from '~/components/Reviews';
import { tursoClient, getFaqs, getReviews, type Faq, type Review } from '~/lib/turso';

// Route loader for FAQs
export const useFaqsLoader = routeLoader$(async (event) => {
  const client = tursoClient(event);
  return await getFaqs(await client);
});

// Route loader for Reviews
export const useReviewsLoader = routeLoader$<Review[]>(async (event) => {
  const client = await tursoClient(event);
  const reviews = await getReviews(client);
  console.log("Fetched reviews:", reviews); // 👈 debug
  return reviews;
});

export default component$(() => {
  const activeTab = useSignal('faq');
  const faqsData = useFaqsLoader();
  const reviewsData = useReviewsLoader();

  const tabs = [
    { id: 'images', label: 'Images' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'faq', label: 'FAQ' },
    { id: 'classes', label: 'Classes' },
  ];

  const renderTabContent = () => {
    switch (activeTab.value) {
      case 'images':
        return (
          <div>
            <h2 class="text-3xl font-bold mb-6">Images Management</h2>
            {/* Content to be implemented */}
          </div>
        );

      case 'reviews':
        return <Reviews reviewsData={reviewsData.value} />;

      case 'faq':
        return <Faqs faqsData={faqsData.value} />;

      case 'classes':
        return (
          <div>
            <h2 class="text-3xl font-bold mb-6">Classes Management</h2>
            {/* Content to be implemented */}
          </div>
        );

      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-8">Dashboard</h1>
        
        {/* Tab Navigation */}
        <div class="bg-white rounded-lg shadow-md mb-8">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick$={() => {
                    activeTab.value = tab.id;
                  }}
                  class={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab.value === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab Content */}
          <div class="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
});