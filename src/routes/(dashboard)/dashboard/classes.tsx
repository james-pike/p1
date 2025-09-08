// ~/components/ClassesAdmin.tsx
import { component$, useSignal, $ } from '@builder.io/qwik';
import { Form, useNavigate } from '@builder.io/qwik-city';

type Class = {
  id: number;
  name: string;
  description?: string;
  image?: string;
  url?: string;
  isActive: boolean;
};

interface ClassesAdminProps {
  classesData: Class[];
}

export default component$<ClassesAdminProps>(({ classesData }) => {
  const showAddForm = useSignal(false);
  const editingClass = useSignal<Class | null>(null);
  const nav = useNavigate();

  // Form signals
  const name = useSignal('');
  const description = useSignal('');
  const image = useSignal('');
  const url = useSignal('');
  const isActive = useSignal(true);

  const resetForm = $(() => {
    name.value = '';
    description.value = '';
    image.value = '';
    url.value = '';
    isActive.value = true;
    editingClass.value = null;
    showAddForm.value = false;
  });

  const startEdit = $((cls: Class) => {
    editingClass.value = cls;
    name.value = cls.name;
    description.value = cls.description || '';
    image.value = cls.image || '';
    url.value = cls.url || '';
    isActive.value = cls.isActive;
    showAddForm.value = true;
  });

  const handleSubmit = $(async () => {
    // Form will be handled by the action, so we just reset after
    setTimeout(() => {
      resetForm();
    }, 100);
  });

  return (
    <div class="space-y-6">
      {/* Add/Edit Form */}
      {showAddForm.value && (
        <div class="bg-white p-6 rounded-lg shadow-md border">
          <h3 class="text-xl font-semibold mb-4">
            {editingClass.value ? 'Edit Class' : 'Add New Class'}
          </h3>
          
          <Form class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Class Name *
              </label>
              <input
                type="text"
                bind:value={name}
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter class name"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                bind:value={description}
                rows={3}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter class description"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                bind:value={image}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Class URL
              </label>
              <input
                type="url"
                bind:value={url}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/class-info"
              />
            </div>

            <div class="flex items-center">
              <input
                type="checkbox"
                bind:checked={isActive}
                id="isActive"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="isActive" class="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>

            <div class="flex space-x-2">
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick$={handleSubmit}
              >
                {editingClass.value ? 'Update' : 'Add'} Class
              </button>
              
              <button
                type="button"
                onClick$={resetForm}
                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </Form>
        </div>
      )}

      {/* Add Button */}
      {!showAddForm.value && (
        <button
          onClick$={() => showAddForm.value = true}
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Add New Class
        </button>
      )}

      {/* Classes List */}
      <div class="bg-white rounded-lg shadow-md">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800">
            Classes ({classesData.length})
          </h3>
        </div>

        {classesData.length === 0 ? (
          <div class="p-6 text-center text-gray-500">
            No classes found. Add your first class above.
          </div>
        ) : (
          <div class="divide-y divide-gray-200">
            {classesData.map((cls) => (
              <div key={cls.id} class="p-6 hover:bg-gray-50">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2">
                      <h4 class="text-lg font-medium text-gray-900">
                        {cls.name}
                      </h4>
                      <span
                        class={`px-2 py-1 text-xs rounded-full ${
                          cls.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {cls.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    {cls.description && (
                      <p class="mt-2 text-gray-600">{cls.description}</p>
                    )}
                    
                    <div class="mt-2 flex space-x-4 text-sm text-gray-500">
                      <span>ID: {cls.id}</span>
                      {cls.url && (
                        <a
                          href={cls.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="text-blue-600 hover:text-blue-800"
                        >
                          View Class →
                        </a>
                      )}
                    </div>
                  </div>

                  {cls.image && (
                    <img
                      src={cls.image}
                      alt={cls.name}
                      class="ml-4 w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                </div>

                <div class="mt-4 flex space-x-2">
                  <button
                    onClick$={() => startEdit(cls)}
                    class="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  
                  <Form>
                    <input type="hidden" name="id" value={cls.id} />
                    <input type="hidden" name="isActive" value={(!cls.isActive).toString()} />
                    <button
                      type="submit"
                      class={`px-3 py-1 text-sm rounded-md ${
                        cls.isActive
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {cls.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </Form>
                  
                  <Form>
                    <input type="hidden" name="id" value={cls.id} />
                    <button
                      type="submit"
                      class="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                      onClick$={(e) => {
                        if (!confirm('Are you sure you want to delete this class?')) {
                          e.preventDefault();
                        }
                      }}
                    >
                      Delete
                    </button>
                  </Form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});