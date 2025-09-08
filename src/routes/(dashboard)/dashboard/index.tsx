// src/routes/dashboard/index.tsx
import { component$, useSignal } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { getClasses } from '~/lib/turso';

export const useClassesData = routeLoader$(async () => {
  try {
    const classes = await getClasses();
    return classes.map(classItem => ({
      id: classItem.id?.toString() || '',
      name: classItem.name?.toString() || '',
      instructor: classItem.instructor?.toString() || '',
      date: classItem.date?.toString() || '',
      description: classItem.description?.toString() || '',
      duration: classItem.duration?.toString() || '',
      price: classItem.price?.toString() || '',
      image: classItem.image?.toString() || '',
      url: classItem.url?.toString() || '',
      isActive: classItem.isActive
    }));
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
});

export default component$(() => {
  const activeTab = useSignal('images');

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
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-semibold mb-4">Upload Images</h3>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p class="text-gray-500">Drag & drop images here</p>
                  <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Browse Files
                  </button>
                </div>
              </div>
              <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-semibold mb-4">Recent Images</h3>
                <div class="space-y-2">
                  <div class="flex items-center justify-between py-2 border-b">
                    <span>image1.jpg</span>
                    <button class="text-red-600 hover:text-red-800">Delete</button>
                  </div>
                  <div class="flex items-center justify-between py-2 border-b">
                    <span>image2.png</span>
                    <button class="text-red-600 hover:text-red-800">Delete</button>
                  </div>
                </div>
              </div>
              <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-semibold mb-4">Image Stats</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span>Total Images:</span>
                    <span class="font-semibold">24</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Storage Used:</span>
                    <span class="font-semibold">2.4 GB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div>
            <h2 class="text-3xl font-bold mb-6">Reviews Management</h2>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-semibold mb-4">Recent Reviews</h3>
                <div class="space-y-4">
                  <div class="border-l-4 border-green-400 pl-4 py-2">
                    <div class="flex items-center mb-2">
                      <span class="text-yellow-500">★★★★★</span>
                      <span class="ml-2 font-semibold">John Doe</span>
                    </div>
                    <p class="text-gray-600">"Great service and amazing quality!"</p>
                  </div>
                  <div class="border-l-4 border-blue-400 pl-4 py-2">
                    <div class="flex items-center mb-2">
                      <span class="text-yellow-500">★★★★☆</span>
                      <span class="ml-2 font-semibold">Jane Smith</span>
                    </div>
                    <p class="text-gray-600">"Very satisfied with the results."</p>
                  </div>
                  <div class="border-l-4 border-red-400 pl-4 py-2">
                    <div class="flex items-center mb-2">
                      <span class="text-yellow-500">★★☆☆☆</span>
                      <span class="ml-2 font-semibold">Mike Johnson</span>
                    </div>
                    <p class="text-gray-600">"Could be better, had some issues."</p>
                  </div>
                </div>
              </div>
              <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-semibold mb-4">Review Analytics</h3>
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <span>Average Rating:</span>
                    <span class="text-2xl font-bold text-green-600">4.2</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span>Total Reviews:</span>
                    <span class="text-xl font-semibold">127</span>
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center">
                      <span class="w-12">5★</span>
                      <div class="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                        <div class="bg-green-500 h-2 rounded-full" style="width: 60%"></div>
                      </div>
                      <span class="text-sm">60%</span>
                    </div>
                    <div class="flex items-center">
                      <span class="w-12">4★</span>
                      <div class="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                        <div class="bg-blue-500 h-2 rounded-full" style="width: 25%"></div>
                      </div>
                      <span class="text-sm">25%</span>
                    </div>
                    <div class="flex items-center">
                      <span class="w-12">3★</span>
                      <div class="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                        <div class="bg-yellow-500 h-2 rounded-full" style="width: 10%"></div>
                      </div>
                      <span class="text-sm">10%</span>
                    </div>
                    <div class="flex items-center">
                      <span class="w-12">2★</span>
                      <div class="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                        <div class="bg-orange-500 h-2 rounded-full" style="width: 3%"></div>
                      </div>
                      <span class="text-sm">3%</span>
                    </div>
                    <div class="flex items-center">
                      <span class="w-12">1★</span>
                      <div class="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                        <div class="bg-red-500 h-2 rounded-full" style="width: 2%"></div>
                      </div>
                      <span class="text-sm">2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'faq':
        return (
          <div>
            <h2 class="text-3xl font-bold mb-6">FAQ Management</h2>

            {error.value && <p class="text-red-500 mb-4">{error.value}</p>}

            {!showForm.value && (
              <button
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-6"
                onClick$={$(() => (showForm.value = true))}
              >
                Add FAQ
              </button>
            )}

            {showForm.value && (
              <div class="mb-6 p-6 border rounded-lg bg-gray-50">
                <h3 class="text-xl font-semibold mb-4">
                  {editing.value ? 'Edit FAQ' : 'Add New FAQ'}
                </h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Question</label>
                    <input
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your question..."
                      value={question.value}
                      onInput$={(e) =>
                        (question.value = (e.target as HTMLInputElement).value)
                      }
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                    <textarea
                      rows={4}
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your answer..."
                      value={answer.value}
                      onInput$={(e) =>
                        (answer.value = (e.target as HTMLTextAreaElement).value)
                      }
                    ></textarea>
                  </div>
                  <div class="flex gap-2">
                    <button
                      class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      onClick$={handleSave}
                    >
                      {editing.value ? 'Update' : 'Save'} FAQ
                    </button>
                    <button
                      class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      onClick$={resetFormState}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div class="bg-white rounded-lg shadow-md">
              <div class="p-6 border-b border-gray-200">
                <h3 class="text-xl font-semibold">Existing FAQs</h3>
              </div>
              <div class="p-6">
                {faqs.value.length === 0 ? (
                  <p class="text-gray-500 text-center py-8">No FAQs available. Add your first FAQ above.</p>
                ) : (
                  <div class="space-y-4">
                    {faqs.value.map((faq) => (
                      <div key={faq.id} class="border border-gray-200 rounded-lg p-4">
                        <div class="flex justify-between items-start mb-2">
                          <h4 class="font-semibold text-lg">{faq.question}</h4>
                          <div class="space-x-2">
                            <button
                              class="text-blue-600 hover:text-blue-800"
                              onClick$={() => handleEdit(faq)}
                            >
                              Edit
                            </button>
                            <button
                              class="text-red-600 hover:text-red-800"
                              onClick$={() => handleDelete(faq.id!)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p class="text-gray-600">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'classes':
        return (
          <div>
            <h2 class="text-3xl font-bold mb-6">Classes Management</h2>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-semibold mb-2">Total Classes</h3>
                <p class="text-3xl font-bold text-blue-600">24</p>
              </div>
              <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-semibold mb-2">Active Students</h3>
                <p class="text-3xl font-bold text-green-600">156</p>
              </div>
              <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-semibold mb-2">This Month</h3>
                <p class="text-3xl font-bold text-purple-600">8</p>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold">Recent Classes</h3>
                <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add New Class
                </button>
              </div>
              
              <div class="overflow-x-auto">
                <table class="min-w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Beginner Yoga</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Sarah Johnson</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">12/15</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Mon, Wed 9:00 AM</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button class="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
                        <button class="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Advanced Pilates</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Mike Chen</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">8/10</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Tue, Thu 6:00 PM</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button class="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
                        <button class="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Meditation Basics</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Lisa Wang</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">15/20</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Fri 7:00 AM</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button class="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
                        <button class="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
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