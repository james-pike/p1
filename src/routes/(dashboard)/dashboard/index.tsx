// src/routes/dashboard/index.tsx
import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  const adminSections = [
    {
      id: 'events',
      title: 'Events Management',
      description: 'Manage workshops, classes, and special events',
      href: '/dashboard/events',
      icon: '📅',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'classes',
      title: 'Classes Management',
      description: 'Add, edit, and manage pottery classes',
      href: '/dashboard/classes',
      icon: '🏺',
      color: 'from-amber-500 to-amber-600'
    },
    {
      id: 'reviews',
      title: 'Reviews Management',
      description: 'Manage customer reviews and testimonials',
      href: '/dashboard/reviews',
      icon: '⭐',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'faq',
      title: 'FAQ Management',
      description: 'Manage frequently asked questions',
      href: '/dashboard/faq',
      icon: '❓',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'gallery',
      title: 'Gallery Management',
      description: 'Upload and manage pottery gallery images',
      href: '/dashboard/gallery',
      icon: '🖼️',
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 'newsletter',
      title: 'Newsletter Management',
      description: 'Create and manage newsletter content',
      href: '/dashboard/newsletter',
      icon: '📧',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-4 py-8">
        {/* Header */}
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your pottery studio's content and settings
          </p>
        </div>

        {/* Admin Cards Grid */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {adminSections.map((section) => (
            <Link
              key={section.id}
              href={section.href}
              class="group block"
            >
              <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 overflow-hidden">
                {/* Gradient Header */}
                <div class={`bg-gradient-to-r ${section.color} p-6 text-white`}>
                  <div class="flex items-center space-x-3">
                    <span class="text-3xl">{section.icon}</span>
                    <h3 class="text-xl font-semibold">{section.title}</h3>
                  </div>
                </div>
                
                {/* Content */}
                <div class="p-6">
                  <p class="text-gray-600 mb-4">
                    {section.description}
                  </p>
                  
                  <div class="flex items-center text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                    <span>Manage</span>
                    <svg class="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats Section */}
        <div class="mt-16 bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">
            Quick Overview
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">--</div>
              <div class="text-sm text-gray-600">Active Events</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-amber-600">--</div>
              <div class="text-sm text-gray-600">Classes</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">--</div>
              <div class="text-sm text-gray-600">Reviews</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-purple-600">--</div>
              <div class="text-sm text-gray-600">FAQ Items</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});