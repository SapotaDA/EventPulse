const CATEGORY_PLACEHOLDERS = {
    'Movies': [
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
        'https://images.unsplash.com/photo-1478720568477-152d9b164e26',
        'https://images.unsplash.com/photo-1517604401157-538e96834c4f'
    ],
    'Concerts': [
        'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
        'https://images.unsplash.com/photo-1459749411177-042180ce5372'
    ],
    'Festivals': [
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
        'https://images.unsplash.com/photo-1514525253361-bee045d2343e'
    ],
    'Tech': [
        'https://images.unsplash.com/photo-1518770660439-4636190af475',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b'
    ],
    'Other': [
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329',
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622',
        'https://images.unsplash.com/photo-1472653525502-bb5698198bc2'
    ]
};

export const getPlaceholderImage = (category, title = '') => {
    const list = CATEGORY_PLACEHOLDERS[category] || CATEGORY_PLACEHOLDERS['Other'];
    // Use title length to pick a consistent image from the list
    const index = title.length % list.length;
    return `${list[index]}?auto=format&fit=crop&w=800&q=80`;
};

export const handleImageError = (e, category, title) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = getPlaceholderImage(category, title);
};
