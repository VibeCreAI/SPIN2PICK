import { PASTEL_COLORS } from '../utils/colorUtils';
import { Item, Title, TitleCategory, TitleManager } from '../utils/titleUtils';

// Import the comprehensive kids activities list
import { FALLBACK_ACTIVITY_PAIRS } from '../utils/emojiUtils';

const getKidsActivities = (): { name: string; emoji: string }[] => {
  // Use first 49 activities for optimal wheel performance and consistency
  return FALLBACK_ACTIVITY_PAIRS.slice(0, 49);
};

// Helper function to create items with colors
const createItems = (names: string[], startIndex: number = 0): Item[] => {
  return names.map((name, index) => ({
    id: `item-${startIndex + index + 1}`,
    name,
    color: PASTEL_COLORS[(startIndex + index) % PASTEL_COLORS.length],
    emoji: '' // Will be populated by emoji utils if needed
  }));
};

// Helper function to create items from activity pairs (with emojis)
const createItemsFromPairs = (pairs: { name: string; emoji: string }[], startIndex: number = 0): Item[] => {
  return pairs.map((pair, index) => ({
    id: `item-${startIndex + index + 1}`,
    name: pair.name,
    color: PASTEL_COLORS[(startIndex + index) % PASTEL_COLORS.length],
    emoji: pair.emoji
  }));
};

// 1. 🍽️ What's for Lunch? - 75 meal options
const lunchItems = createItems([
  // Quick & Easy (15 items)
  'Grilled Cheese Sandwich', 'Caesar Salad', 'Chicken Wrap', 'Tomato Soup', 'Club Sandwich',
  'Greek Yogurt Bowl', 'Avocado Toast', 'Quesadilla', 'Fruit Smoothie', 'Bagel with Cream Cheese',
  'Tuna Salad', 'Chicken Noodle Soup', 'Pita with Hummus', 'Scrambled Eggs', 'BLT Sandwich',
  
  // International (20 items)
  'Sushi Rolls', 'Pad Thai', 'Chicken Tikka Masala', 'Fish Tacos', 'Greek Gyro',
  'Italian Pasta', 'Chinese Fried Rice', 'Mexican Burrito', 'Thai Green Curry', 'Japanese Ramen',
  'Korean Bibimbap', 'Indian Dal', 'Vietnamese Pho', 'Spanish Paella', 'Turkish Kebab',
  'French Croissant', 'German Schnitzel', 'Moroccan Tagine', 'Lebanese Falafel', 'Brazilian Açaí Bowl',
  
  // Healthy Options (20 items)
  'Quinoa Salad', 'Grilled Chicken Breast', 'Buddha Bowl', 'Vegetable Stir Fry', 'Salmon Fillet',
  'Kale Smoothie', 'Brown Rice Bowl', 'Lentil Soup', 'Chickpea Salad', 'Grilled Vegetables',
  'Sweet Potato', 'Protein Smoothie Bowl', 'Spinach Salad', 'Turkey Lettuce Wraps', 'Roasted Chickpeas',
  'Edamame', 'Cauliflower Rice', 'Zucchini Noodles', 'Baked Cod', 'Mixed Nuts',
  
  // Comfort Food (20 items)
  'Pizza Slice', 'Hamburger', 'Mac and Cheese', 'Chicken Nuggets', 'French Fries',
  'Grilled Cheese', 'Meatball Sub', 'Chili', 'Mashed Potatoes', 'Fried Chicken',
  'Hot Dog', 'Pancakes', 'Waffles', 'Ice Cream', 'Chocolate Cake',
  'Donuts', 'Cookies', 'Brownies', 'Apple Pie', 'Milkshake'
]);

// 2. 🏃 Afternoon Activities - 80 age-neutral activities
const activityItems = createItems([
  // Indoor Activities (25 items)
  'Read a Book', 'Watch a Movie', 'Play Board Games', 'Do a Puzzle', 'Listen to Music',
  'Write in a Journal', 'Draw or Paint', 'Bake Something', 'Learn a New Skill', 'Organize a Room',
  'Video Call a Friend', 'Practice an Instrument', 'Do Yoga', 'Meditate', 'Craft Project',
  'Play Video Games', 'Take Photos', 'Learn a Language', 'Write Poetry', 'Code Something',
  'Plan a Trip', 'Research a Topic', 'Declutter Space', 'Rearrange Furniture', 'Try New Recipes',
  
  // Outdoor Activities (25 items)
  'Take a Walk', 'Go for a Run', 'Ride a Bike', 'Visit a Park', 'Have a Picnic',
  'Go Swimming', 'Play Tennis', 'Go Hiking', 'Garden', 'Fly a Kite',
  'Play Frisbee', 'Go to Beach', 'Visit Zoo', 'Go Fishing', 'Play Basketball',
  'Go Camping', 'Star Gazing', 'Bird Watching', 'Photography Walk', 'Play Golf',
  'Rock Climbing', 'Kayaking', 'Go Skateboarding', 'Play Soccer', 'Visit Museum',
  
  // Social Activities (15 items)
  'Meet Friends', 'Host a Dinner', 'Game Night', 'Go Shopping', 'Visit Family',
  'Attend an Event', 'Go to Concert', 'Join a Club', 'Volunteer', 'Take a Class',
  'Attend Workshop', 'Go to Theater', 'Visit Gallery', 'Coffee Date', 'Potluck Party',
  
  // Creative & Learning (15 items)
  'Learn Photography', 'Try Calligraphy', 'Make Jewelry', 'Pottery Class', 'Dancing',
  'Singing', 'Write Stories', 'Create Videos', 'Design Graphics', 'Learn Magic Tricks',
  'Practice Public Speaking', 'Learn Card Games', 'Origami', 'Scrapbooking', 'Podcasting'
]);

// 3. 🎲 Random Numbers - configurable ranges
const numberItems = createItems([
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
  '31', '32', '33', '34', '35', '36', '37', '38', '39', '40',
  '41', '42', '43', '44', '45', '46', '47', '48', '49', '50',
  '51', '52', '53', '54', '55', '56', '57', '58', '59', '60',
  '61', '62', '63', '64', '65', '66', '67', '68', '69', '70',
  '71', '72', '73', '74', '75', '76', '77', '78', '79', '80',
  '81', '82', '83', '84', '85', '86', '87', '88', '89', '90',
  '91', '92', '93', '94', '95', '96', '97', '98', '99', '100'
]);

// 4. 😈 Truth or Dare - age-appropriate options (60 items)
const truthOrDareItems = createItems([
  // Light Truths (20 items)
  'What\'s your biggest fear?', 'What\'s your favorite memory?', 'What\'s your hidden talent?',
  'What\'s your most embarrassing moment?', 'What\'s your biggest dream?', 'What\'s your favorite food?',
  'What\'s your biggest pet peeve?', 'What\'s your favorite movie?', 'What\'s your worst habit?',
  'What\'s your favorite song?', 'What\'s your biggest regret?', 'What\'s your favorite book?',
  'What\'s your dream job?', 'What\'s your favorite season?', 'What\'s your worst date story?',
  'What\'s your favorite hobby?', 'What\'s your biggest accomplishment?', 'What\'s your favorite travel destination?',
  'What\'s your most prized possession?', 'What\'s your favorite childhood memory?',
  
  // Fun Dares (20 items)
  'Sing your favorite song', 'Do 10 jumping jacks', 'Tell a joke', 'Do your best dance move',
  'Act like your favorite animal', 'Speak in an accent for 2 minutes', 'Do a cartwheel',
  'Make up a short poem', 'Do 5 push-ups', 'Imitate someone in the room',
  'Hop on one foot for 30 seconds', 'Make a funny face', 'Do your best impression',
  'Spin around 10 times', 'Walk backwards for 1 minute', 'Do a magic trick',
  'Pretend to be a robot', 'Sing Happy Birthday opera style', 'Do a silly walk',
  'Make up a superhero name and pose',
  
  // Creative Challenges (20 items)
  'Draw something with your eyes closed', 'Tell a story using only questions',
  'Create a commercial for a random object', 'Speak only in rhymes for 3 minutes',
  'Act out a movie scene', 'Make up a song about the weather', 'Do standup comedy for 2 minutes',
  'Describe your day as a nature documentary', 'Create a dance for doing chores',
  'Tell a story where every sentence starts with the next letter of the alphabet',
  'Act like you\'re teaching a class', 'Pretend to be a news reporter',
  'Create a motivational speech about pizza', 'Act out your morning routine in slow motion',
  'Pretend to be from the future describing today', 'Create a workout routine using household items',
  'Act like you\'re in a silent movie', 'Describe colors to someone who\'s never seen them',
  'Create a cooking show for making a sandwich', 'Act like different emotions for 30 seconds each'
]);

// 5. ⚽ Team Picker - roles and assignments (50 items)
const teamItems = createItems([
  // Sports Positions (15 items)
  'Team Captain', 'Goalkeeper', 'Forward', 'Defender', 'Midfielder',
  'Point Guard', 'Center', 'Pitcher', 'Catcher', 'Quarterback',
  'Running Back', 'Wide Receiver', 'Libero', 'Setter', 'Spiker',
  
  // Project Roles (15 items)
  'Project Leader', 'Creative Director', 'Researcher', 'Presenter', 'Note Taker',
  'Time Keeper', 'Resource Manager', 'Quality Controller', 'Coordinator', 'Motivator',
  'Problem Solver', 'Innovation Lead', 'Communications Lead', 'Data Analyst', 'Facilitator',
  
  // Group Activities (10 items)
  'Team A', 'Team B', 'Team C', 'Team D', 'Red Team',
  'Blue Team', 'Green Team', 'Yellow Team', 'Alpha Team', 'Beta Team',
  
  // Fun Roles (10 items)
  'Game Master', 'Rule Keeper', 'Cheerleader', 'DJ', 'Photographer',
  'Snack Manager', 'Party Planner', 'Joke Teller', 'Energy Booster', 'Peace Keeper'
]);

// 6. 🍰 Dessert Roulette - sweet treats (60 items)
const dessertItems = createItems([
  // Classic Desserts (20 items)
  'Chocolate Cake', 'Vanilla Ice Cream', 'Apple Pie', 'Strawberry Shortcake', 'Chocolate Chip Cookies',
  'Brownies', 'Cheesecake', 'Tiramisu', 'Crème Brûlée', 'Fruit Tart',
  'Peach Cobbler', 'Lemon Bars', 'Carrot Cake', 'Red Velvet Cake', 'Banana Bread',
  'Pumpkin Pie', 'Key Lime Pie', 'Chocolate Mousse', 'Panna Cotta', 'Flan',
  
  // International Sweets (20 items)
  'Macarons', 'Baklava', 'Churros', 'Gelato', 'Mochi Ice Cream',
  'Cannoli', 'Tres Leches Cake', 'Dulce de Leche', 'Brigadeiro',
  'Gulab Jamun', 'Kheer', 'Mango Sticky Rice', 'Turkish Delight', 'Profiteroles',
  'Éclair', 'Mille-feuille', 'Sachertorte', 'Black Forest Cake', 'Pavlova', 'Sticky Toffee Pudding',
  
  // Modern Treats (20 items)
  'Cake Pops', 'Cupcakes', 'Donuts', 'Cronuts', 'Unicorn Cake',
  'Galaxy Cake', 'Lava Cake', 'Fried Ice Cream', 'Bubble Waffles', 'Rolled Ice Cream',
  'Nitrogen Ice Cream', 'Cotton Candy', 'Funnel Cake', 'Deep Fried Oreos', 'Chocolate Lava Cookies',
  'Salted Caramel Brownies', 'Matcha Cheesecake', 'Lavender Honey Cake', 'Rose Petal Macarons', 'Avocado Chocolate Mousse'
]);

// 7. 📚 Book Genres - reading discovery (70 items)
const bookGenreItems = createItems([
  // Fiction Genres (25 items)
  'Mystery', 'Romance', 'Science Fiction', 'Fantasy', 'Thriller',
  'Historical Fiction', 'Literary Fiction', 'Young Adult', 'Crime', 'Horror',
  'Adventure', 'Comedy', 'Drama', 'Magical Realism', 'Dystopian',
  'Urban Fantasy', 'Paranormal Romance', 'Cozy Mystery', 'Space Opera', 'Steampunk',
  'Cyberpunk', 'Time Travel', 'Alternate History', 'Gothic', 'Contemporary Fiction',
  
  // Non-Fiction Genres (25 items)
  'Biography', 'Autobiography', 'Self-Help', 'Health & Fitness', 'Business',
  'Psychology', 'Philosophy', 'History', 'Science', 'Travel',
  'Cooking', 'Art', 'Music', 'Sports', 'Politics',
  'Religion', 'Spirituality', 'Memoirs', 'True Crime', 'Essays',
  'Reference', 'How-To', 'Personal Development', 'Relationships', 'Parenting',
  
  // Specialized Genres (20 items)
  'Graphic Novels', 'Poetry', 'Short Stories', 'Anthology', 'Classic Literature',
  'Children\'s Books', 'Picture Books', 'Educational', 'Textbooks', 'Academic',
  'Technical Manuals', 'Journals', 'Diaries', 'Letters', 'Plays',
  'Screenplays', 'Comics', 'Manga', 'Light Novels', 'Audio Books'
]);

// 8. 🌍 Travel Destinations - dream vacation picker (80 items)
const travelItems = createItems([
  // European Destinations (20 items)
  'Paris, France', 'Rome, Italy', 'Barcelona, Spain', 'London, England', 'Amsterdam, Netherlands',
  'Prague, Czech Republic', 'Vienna, Austria', 'Berlin, Germany', 'Athens, Greece', 'Dublin, Ireland',
  'Stockholm, Sweden', 'Copenhagen, Denmark', 'Oslo, Norway', 'Helsinki, Finland', 'Reykjavik, Iceland',
  'Zurich, Switzerland', 'Brussels, Belgium', 'Lisbon, Portugal', 'Budapest, Hungary', 'Warsaw, Poland',
  
  // Asian Destinations (20 items)
  'Tokyo, Japan', 'Seoul, South Korea', 'Bangkok, Thailand', 'Singapore', 'Hong Kong',
  'Beijing, China', 'Shanghai, China', 'Mumbai, India', 'Delhi, India', 'Kathmandu, Nepal',
  'Manila, Philippines', 'Jakarta, Indonesia', 'Kuala Lumpur, Malaysia', 'Ho Chi Minh City, Vietnam',
  'Hanoi, Vietnam', 'Phnom Penh, Cambodia', 'Yangon, Myanmar', 'Colombo, Sri Lanka', 'Dhaka, Bangladesh',
  'Islamabad, Pakistan',
  
  // American Destinations (20 items)
  'New York City, USA', 'Los Angeles, USA', 'Chicago, USA', 'Miami, USA', 'Las Vegas, USA',
  'San Francisco, USA', 'Seattle, USA', 'Boston, USA', 'Toronto, Canada', 'Vancouver, Canada',
  'Mexico City, Mexico', 'Cancun, Mexico', 'Rio de Janeiro, Brazil', 'Buenos Aires, Argentina',
  'Lima, Peru', 'Santiago, Chile', 'Bogotá, Colombia', 'Caracas, Venezuela', 'Quito, Ecuador',
  'La Paz, Bolivia',
  
  // Other Destinations (20 items)
  'Sydney, Australia', 'Melbourne, Australia', 'Auckland, New Zealand', 'Cairo, Egypt', 'Cape Town, South Africa',
  'Marrakech, Morocco', 'Nairobi, Kenya', 'Lagos, Nigeria', 'Casablanca, Morocco', 'Tunis, Tunisia',
  'Dubai, UAE', 'Tel Aviv, Israel', 'Istanbul, Turkey', 'Tbilisi, Georgia', 'Yerevan, Armenia',
  'Baku, Azerbaijan', 'Tashkent, Uzbekistan', 'Almaty, Kazakhstan', 'Bishkek, Kyrgyzstan', 'Dushanbe, Tajikistan'
]);

// 9. 💡 Creativity Prompts - writing and art inspiration (75 items)
const creativityItems = createItems([
  // Writing Prompts (25 items)
  'Write about a character who can taste colors', 'A world where lying is impossible', 'The last bookstore on Earth',
  'A letter never meant to be sent', 'A day when gravity stopped working', 'The secret life of your pet',
  'A conversation between two houseplants', 'Time travel, but you can only go backwards', 'A superhero with a useless power',
  'The autobiography of a forgotten object', 'A world where emotions have colors', 'Dreams that predict the future',
  'A character who ages backwards', 'The day music disappeared', 'A library that contains every possible book',
  'A world where memories can be traded', 'The last human on a planet of robots', 'A character who can only speak in questions',
  'The day all mirrors stopped working', 'A society where art is currency', 'Time moves differently for everyone',
  'A character who can hear thoughts but only lies', 'The world\'s worst fortune teller', 'A town where no one ever leaves',
  'The museum of lost things',
  
  // Art Prompts (25 items)
  'Draw your mood as a landscape', 'Create art using only circles', 'Design a house for your future self',
  'Illustrate a song without using musical notes', 'Paint with unconventional tools', 'Draw your favorite smell',
  'Create a self-portrait using only shadows', 'Design packaging for happiness', 'Illustrate a memory from childhood',
  'Draw what silence looks like', 'Create art inspired by your favorite texture', 'Design a flag for your imagination',
  'Illustrate the inside of a computer', 'Draw your day as a weather pattern', 'Create art using only warm colors',
  'Design a vehicle for your dreams', 'Illustrate the concept of time', 'Draw your favorite word',
  'Create a map of a fictional place', 'Design clothes for a specific emotion', 'Illustrate what love sounds like',
  'Draw the view from a bird\'s perspective', 'Create art inspired by your least favorite color', 'Design a robot companion',
  'Illustrate the feeling of déjà vu',
  
  // Mixed Creative Challenges (25 items)
  'Write a haiku about your morning coffee', 'Design and name a new planet', 'Create a commercial for an impossible product',
  'Write dialogue between opposing forces in nature', 'Design a board game based on your life', 'Create a recipe for courage',
  'Write instructions for becoming invisible', 'Design a medal for everyday heroes', 'Create a lullaby for adults',
  'Write a complaint letter to the sun', 'Design a theme park for introverts', 'Create a dance for doing laundry',
  'Write a love letter to your biggest fear', 'Design a uniform for time travelers', 'Create a holiday celebrating failure',
  'Write a user manual for being human', 'Design architecture that grows like plants', 'Create a language using only gestures',
  'Write a news report from the future', 'Design jewelry made from emotions', 'Create a workout routine for your brain',
  'Write a bedtime story for insomniacs', 'Design a restaurant for one specific memory', 'Create music that only you can hear',
  'Write a thank you note to your past self'
]);

// 10. 🧘 Mindfulness Activities - meditation and relaxation (60 items)
const mindfulnessItems = createItems([
  // Breathing Exercises (15 items)
  'Box Breathing (4-4-4-4)', '4-7-8 Breathing Technique', 'Alternate Nostril Breathing', 'Deep Belly Breathing',
  'Counted Breathing', 'Pursed Lip Breathing', 'Breath of Fire', 'Three-Part Breathing',
  'Ocean Breath (Ujjayi)', 'Breath Awareness', 'Coherent Breathing', 'Resonance Breathing',
  'Breath Counting', 'Natural Breathing Observation', 'Breath and Movement',
  
  // Meditation Practices (15 items)
  'Body Scan Meditation', 'Loving-Kindness Meditation', 'Walking Meditation', 'Mindful Eating',
  'Sound Meditation', 'Candle Gazing', 'Mantra Meditation', 'Visualization Meditation',
  'Gratitude Meditation', 'Open Monitoring', 'Focused Attention', 'Movement Meditation',
  'Nature Meditation', 'Compassion Meditation', 'Insight Meditation',
  
  // Mindful Activities (15 items)
  'Mindful Dishwashing', 'Conscious Tea/Coffee Drinking', 'Mindful Gardening', 'Aware Walking',
  'Present Moment Listening', 'Mindful Stretching', 'Conscious Breathing Breaks', 'Mindful Showering',
  'Aware Cooking', 'Present Moment Photography', 'Mindful Reading', 'Conscious Writing',
  'Mindful Art Creation', 'Aware Exercise', 'Present Moment Observation',
  
  // Relaxation Techniques (15 items)
  'Progressive Muscle Relaxation', 'Guided Imagery', 'Autogenic Training', 'Yoga Nidra',
  'Tension and Release', 'Warm Bath Meditation', 'Essential Oil Breathing', 'Massage Meditation',
  'Gentle Stretching', 'Peaceful Music Listening', 'Nature Sounds Focus', 'Comfort Object Meditation',
  'Safe Space Visualization', 'Color Breathing', 'Energy Healing Visualization'
]);

// 11. 🎪 Party Games - group entertainment (70 items)
const partyGameItems = createItems([
  // Classic Party Games (20 items)
  'Charades', 'Pictionary', 'Two Truths and a Lie', 'Never Have I Ever', 'Would You Rather',
  '20 Questions', 'Scavenger Hunt', 'Musical Chairs', 'Freeze Dance',
  'Hot Potato', 'Pass the Parcel', 'Simon Says', 'Red Light Green Light', 'Duck Duck Goose',
  'Telephone', 'Sardines', 'Hide and Seek', 'Tag', 'Marco Polo', 'Heads Up Seven Up',
  
  // Icebreaker Games (15 items)
  'Human Bingo', 'Find Someone Who', 'Name That Tune', 'Guess the Baby Photo', 'Celebrity Match',
  'Common Ground', 'Speed Friending', 'Question Ball', 'Life Timeline', 'Fact or Fiction',
  'Story Building', 'Word Association', 'Compliment Circle', 'Desert Island', 'Time Capsule',
  
  // Creative Games (20 items)
  'Improv Games', 'Story Chain', 'Drawing Relay', 'Song Creation', 'Commercial Creation',
  'Fashion Show', 'Talent Show', 'Joke Competition', 'Accent Challenge', 'Rhyme Time',
  'Movie Pitch', 'Invention Game', 'Backwards Day', 'Opposite Game', 'Alien Interview',
  'Time Period Acting', 'Emotion Guessing', 'Silent Movie', 'Mime Challenge', 'Voice Acting',
  
  // Active Games (15 items)
  'Limbo', 'Twister', 'Dance Competition', 'Balloon Keep Up', 'Hula Hoop Contest',
  'Sack Race', 'Three-Legged Race', 'Egg and Spoon Race', 'Obstacle Course', 'Human Knot',
  'Tug of War', 'Relay Races', 'Musical Statues', 'Follow the Leader', 'Balance Challenge'
]);

// 12. 🔬 Science Experiments - educational activities (65 items)
const scienceItems = createItems([
  // Chemistry Experiments (20 items)
  'Volcano Eruption', 'Invisible Ink', 'Color-Changing Milk', 'Crystal Growing', 'Slime Making',
  'pH Indicator Solutions', 'Elephant Toothpaste', 'Dancing Raisins', 'Lava Lamp', 'Fizzy Bath Bombs',
  'Chromatography', 'Density Tower', 'Chemical Reactions', 'Acid-Base Reactions', 'Precipitation Reactions',
  'Soap Making', 'Candle Making', 'Rock Candy', 'Oobleck', 'Polymers',
  
  // Physics Experiments (20 items)
  'Pendulum Motion', 'Magnets and Magnetism', 'Static Electricity', 'Simple Machines', 'Optical Illusions',
  'Sound Waves', 'Light Refraction', 'Density and Buoyancy', 'Centrifugal Force', 'Bernoulli\'s Principle',
  'Friction Testing', 'Gravity Experiments', 'Lever Mechanics', 'Pulley Systems', 'Inclined Planes',
  'Conservation of Energy', 'Newton\'s Laws', 'Wave Properties', 'Electromagnetic Induction', 'Thermodynamics',
  
  // Biology Experiments (15 items)
  'Plant Growth', 'Seed Germination', 'Photosynthesis', 'Cell Observation', 'DNA Extraction',
  'Enzyme Activity', 'Fermentation', 'Bacterial Cultures', 'Ecosystem in a Bottle', 'Food Chains',
  'Animal Behavior', 'Heart Rate Studies', 'Lung Capacity', 'Reflex Testing', 'Genetics',
  
  // Earth Science (10 items)
  'Rock Formation', 'Soil Layers', 'Water Cycle', 'Weather Patterns', 'Erosion Studies',
  'Fossil Creation', 'Earthquake Simulation', 'Volcano Models', 'Ocean Currents', 'Atmosphere Layers'
]);

// 13. 🌱 Garden Tasks - outdoor and plant care (55 items)
const gardenItems = createItems([
  // Planting Tasks (15 items)
  'Plant Seeds', 'Transplant Seedlings', 'Plant Bulbs', 'Start Herb Garden', 'Plant Vegetables',
  'Plant Flowers', 'Plant Trees', 'Plant Shrubs', 'Create Succulent Garden', 'Start Indoor Plants',
  'Plant Cover Crops', 'Establish Perennials', 'Plant Annuals', 'Create Vertical Garden', 'Plant Ground Cover',
  
  // Maintenance Tasks (20 items)
  'Water Plants', 'Prune Roses', 'Deadhead Flowers', 'Weed Garden Beds', 'Mulch Around Plants',
  'Fertilize Plants', 'Check for Pests', 'Spray for Diseases', 'Support Climbing Plants', 'Divide Perennials',
  'Trim Hedges', 'Edge Garden Beds', 'Clean Garden Tools', 'Harvest Vegetables', 'Collect Seeds',
  'Compost Organic Matter', 'Turn Compost Pile', 'Test Soil pH', 'Add Soil Amendments', 'Aerate Lawn',
  
  // Seasonal Tasks (20 items)
  'Prepare Spring Garden', 'Plant Summer Crops', 'Autumn Cleanup', 'Winter Protection', 'Rake Leaves',
  'Clean Up Dead Plants', 'Store Garden Tools', 'Plan Next Year\'s Garden', 'Order Seeds', 'Start Seeds Indoors',
  'Protect Plants from Frost', 'Harvest Fall Crops', 'Plant Spring Bulbs', 'Winterize Garden', 'Create Garden Journal',
  'Design Garden Layout', 'Research New Plants', 'Attend Garden Workshop', 'Visit Botanical Garden', 'Share Garden Produce'
]);

// 14. 🎯 Goal Categories - personal development (65 items)
const goalItems = createItems([
  // Health & Fitness Goals (15 items)
  'Exercise Regularly', 'Eat Healthier', 'Drink More Water', 'Get Better Sleep', 'Reduce Stress',
  'Quit Bad Habits', 'Practice Yoga', 'Try New Sports', 'Walk More Daily', 'Stretch Regularly',
  'Meditate Daily', 'Take Vitamins', 'Cook More at Home', 'Limit Screen Time', 'Practice Mindfulness',
  
  // Career & Learning Goals (15 items)
  'Learn New Skill', 'Read More Books', 'Take Online Course', 'Improve Public Speaking', 'Network More',
  'Update Resume', 'Seek Promotion', 'Change Careers', 'Start Side Business', 'Learn New Language',
  'Attend Conferences', 'Find Mentor', 'Develop Leadership', 'Improve Time Management', 'Get Certification',
  
  // Personal Growth Goals (15 items)
  'Practice Gratitude', 'Be More Positive', 'Improve Communication', 'Build Confidence', 'Overcome Fears',
  'Develop Patience', 'Be More Organized', 'Practice Forgiveness', 'Cultivate Creativity', 'Improve Relationships',
  'Set Boundaries', 'Practice Self-Care', 'Develop Empathy', 'Improve Decision Making', 'Build Resilience',
  
  // Lifestyle Goals (20 items)
  'Travel More', 'Save Money', 'Declutter Home', 'Volunteer Regularly', 'Spend Time in Nature',
  'Make New Friends', 'Strengthen Family Bonds', 'Practice Hobbies', 'Try New Experiences', 'Reduce Waste',
  'Be More Environmentally Conscious', 'Practice Minimalism', 'Improve Home', 'Learn Musical Instrument', 'Start Garden',
  'Write Journal', 'Practice Photography', 'Learn to Cook', 'Explore Local Area', 'Disconnect from Technology'
]);

// 15. 🎨 Art Techniques - drawing and painting methods (60 items)
const artTechniqueItems = createItems([
  // Drawing Techniques (20 items)
  'Pencil Sketching', 'Charcoal Drawing', 'Ink and Pen', 'Pastel Drawing', 'Colored Pencil',
  'Graphite Shading', 'Cross-Hatching', 'Stippling', 'Blending', 'Contour Drawing',
  'Gesture Drawing', 'Life Drawing', 'Portrait Drawing', 'Landscape Drawing', 'Still Life',
  'Perspective Drawing', 'Figure Drawing', 'Technical Drawing', 'Architectural Drawing', 'Fashion Illustration',
  
  // Painting Techniques (20 items)
  'Watercolor', 'Acrylic Painting', 'Oil Painting', 'Gouache', 'Tempera',
  'Wet-on-Wet', 'Wet-on-Dry', 'Dry Brush', 'Glazing', 'Impasto',
  'Scumbling', 'Sgraffito', 'Color Mixing', 'Gradient Painting', 'Texture Painting',
  'Abstract Painting', 'Realistic Painting', 'Impressionist Style', 'Pointillism', 'Expressionist Style',
  
  // Mixed Media & Experimental (20 items)
  'Collage', 'Mixed Media', 'Digital Art', 'Printmaking', 'Screen Printing',
  'Linocut', 'Etching', 'Monoprinting', 'Paper Sculpture', 'Found Object Art',
  'Installation Art', 'Performance Art', 'Video Art', 'Photography', 'Photo Manipulation',
  'Spray Paint Art', 'Sand Art', 'String Art', 'Mosaic', 'Ceramic Painting'
]);

// 16. 🎬 Movie Night - popular movies by genre (75 items)
const movieNightItems = createItems([
  // Action Movies (15 items)
  'Die Hard', 'Mad Max: Fury Road', 'John Wick', 'The Matrix', 'Avengers: Endgame',
  'Terminator 2', 'Raiders of the Lost Ark', 'Speed', 'Heat', 'Mission: Impossible',
  'Fast & Furious', 'Wonder Woman', 'Black Panther', 'Top Gun', 'The Dark Knight',
  
  // Comedy Movies (15 items)
  'The Hangover', 'Superbad', 'Anchorman', 'Dumb and Dumber', 'Ghostbusters',
  'Airplane!', 'The Princess Bride', 'Coming to America', 'Mrs. Doubtfire', 'Home Alone',
  'Napoleon Dynamite', 'Zoolander', 'Borat', 'Elf', 'Wedding Crashers',
  
  // Drama Movies (15 items)
  'The Shawshank Redemption', 'Forrest Gump', 'The Godfather', 'Schindler\'s List', 'Titanic',
  'Good Will Hunting', 'A Beautiful Mind', 'The Pursuit of Happyness', 'One Flew Over the Cuckoo\'s Nest', 'Rain Man',
  'The Green Mile', 'Dead Poets Society', 'Philadelphia', 'Saving Private Ryan', 'Gladiator',
  
  // Horror Movies (15 items)
  'The Exorcist', 'Halloween', 'A Nightmare on Elm Street', 'The Shining', 'Psycho',
  'Scream', 'Get Out', 'Hereditary', 'The Conjuring', 'It',
  'Jaws', 'Alien', 'The Thing', 'Poltergeist', 'The Texas Chain Saw Massacre',
  
  // Sci-Fi Movies (15 items)
  'Star Wars', 'Blade Runner', 'E.T.', 'Back to the Future', 'Jurassic Park',
  'The Terminator', 'Aliens', 'Close Encounters', 'Star Trek', 'Interstellar',
  'Arrival', 'Ex Machina', 'Gravity', 'Avatar', 'The Fifth Element'
]);

// 17. 🎵 Music Genres - styles for discovery (70 items)
const musicGenreItems = createItems([
  // Popular Genres (20 items)
  'Pop', 'Rock', 'Hip Hop', 'R&B', 'Country',
  'Electronic', 'Folk', 'Jazz', 'Blues', 'Classical',
  'Reggae', 'Alternative', 'Indie', 'Punk', 'Metal',
  'Gospel', 'Soul', 'Funk', 'Disco', 'Grunge',
  
  // World Music (15 items)
  'Latin', 'Salsa', 'Bossa Nova', 'Flamenco', 'Celtic',
  'African', 'Reggaeton', 'K-Pop', 'Bollywood', 'Arabic',
  'Japanese Traditional', 'Chinese Classical', 'Irish Folk', 'Scottish Bagpipes', 'Native American',
  
  // Electronic Subgenres (15 items)
  'House', 'Techno', 'Dubstep', 'Trance', 'Ambient',
  'Drum and Bass', 'Synthwave', 'Chillout', 'Breakbeat', 'IDM',
  'Electro', 'Progressive', 'Minimal', 'Garage', 'Trip Hop',
  
  // Specialized Genres (20 items)
  'Opera', 'Musical Theater', 'Choral', 'A Cappella', 'Barbershop',
  'Bluegrass', 'Zydeco', 'Klezmer', 'Swing', 'Big Band',
  'Bebop', 'Cool Jazz', 'Fusion', 'New Age', 'Meditation Music',
  'Nature Sounds', 'Binaural Beats', 'Lo-Fi', 'Vaporwave', 'Chiptune'
]);

// 18. 🏢 Work Break Ideas - office-appropriate activities (55 items)
const workBreakItems = createItems([
  // 5-Minute Breaks (15 items)
  'Deep Breathing', 'Stretch at Desk', 'Look Out Window', 'Hydrate', 'Quick Walk',
  'Eye Exercises', 'Neck Rolls', 'Shoulder Shrugs', 'Hand Stretches', 'Posture Check',
  'Gratitude Moment', 'Positive Affirmation', 'Quick Meditation', 'Listen to One Song', 'Chat with Colleague',
  
  // 15-Minute Breaks (20 items)
  'Walk Around Building', 'Climb Stairs', 'Mindful Eating', 'Call Friend/Family', 'Read Article',
  'Do Crossword', 'Play Brain Game', 'Organize Desk', 'Water Plants', 'Write in Journal',
  'Practice Guitar/Ukulele', 'Draw or Doodle', 'Do Yoga Poses', 'Listen to Podcast', 'Review Goals',
  'Plan Weekend', 'Write Thank You Note', 'Research Hobby', 'Check Weather', 'Browse Inspiring Content',
  
  // 30-Minute Breaks (20 items)
  'Go for Lunch Walk', 'Visit Nearby Park', 'Read Book Chapter', 'Take Power Nap', 'Visit Gym',
  'Meet Friend for Coffee', 'Attend Workout Class', 'Go to Museum', 'Visit Library', 'Shop for Groceries',
  'Get Haircut', 'Visit Doctor', 'Run Personal Errands', 'Attend Networking Event', 'Take Online Course',
  'Practice Presentation', 'Meal Prep', 'Clean Car', 'Visit Farmers Market', 'Attend Lunch Seminar'
]);

// 19. 🎓 Study Topics - subject rotation for students (80 items)
const studyTopicItems = createItems([
  // Core Academic Subjects (20 items)
  'Mathematics', 'English Literature', 'History', 'Science', 'Geography',
  'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Psychology',
  'Philosophy', 'Sociology', 'Economics', 'Political Science', 'Anthropology',
  'Statistics', 'Calculus', 'Algebra', 'Geometry', 'Trigonometry',
  
  // Language Studies (15 items)
  'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Chinese (Mandarin)', 'Japanese', 'Korean', 'Arabic', 'Russian',
  'Latin', 'Greek', 'Hebrew', 'Hindi', 'Sign Language',
  
  // Professional Skills (15 items)
  'Public Speaking', 'Writing Skills', 'Research Methods', 'Critical Thinking', 'Problem Solving',
  'Time Management', 'Study Techniques', 'Note Taking', 'Test Preparation', 'Memory Techniques',
  'Speed Reading', 'Academic Writing', 'Citation Styles', 'Presentation Skills', 'Interview Preparation',
  
  // Creative & Technical (15 items)
  'Creative Writing', 'Photography', 'Graphic Design', 'Web Development', 'Programming',
  'Digital Marketing', 'Data Analysis', 'Excel Skills', 'Database Management', 'Project Management',
  'Financial Literacy', 'Entrepreneurship', 'Leadership', 'Communication', 'Conflict Resolution',
  
  // Specialized Knowledge (15 items)
  'Art History', 'Music Theory', 'Film Studies', 'Environmental Science', 'Astronomy',
  'Archaeology', 'Mythology', 'Religion Studies', 'Ethics', 'Logic',
  'Linguistics', 'Nutrition', 'Health Sciences', 'Sports Science', 'Architecture'
]);

// 20. 🏡 Chore Assignments - household task distribution (65 items)
const choreItems = createItems([
  // Kitchen Tasks (15 items)
  'Wash Dishes', 'Load Dishwasher', 'Unload Dishwasher', 'Wipe Counters', 'Clean Sink',
  'Sweep Floor', 'Mop Floor', 'Clean Refrigerator', 'Organize Pantry', 'Take Out Trash',
  'Clean Microwave', 'Wipe Appliances', 'Organize Cabinets', 'Clean Oven', 'Wash Kitchen Towels',
  
  // Bathroom Tasks (10 items)
  'Clean Toilet', 'Scrub Shower', 'Clean Mirror', 'Sweep Floor', 'Mop Floor',
  'Replace Towels', 'Restock Supplies', 'Clean Sink', 'Empty Trash', 'Organize Medicine Cabinet',
  
  // Living Areas (15 items)
  'Vacuum Carpets', 'Dust Furniture', 'Organize Books', 'Fluff Cushions', 'Water Plants',
  'Clean Windows', 'Sweep Entryway', 'Organize Closets', 'Make Beds', 'Fold Laundry',
  'Put Away Items', 'Clean Light Fixtures', 'Wipe Baseboards', 'Organize Storage', 'Rearrange Furniture',
  
  // Outdoor Tasks (15 items)
  'Mow Lawn', 'Water Garden', 'Rake Leaves', 'Shovel Snow', 'Wash Car',
  'Clean Gutters', 'Trim Bushes', 'Weed Garden', 'Sweep Porch', 'Clean Grill',
  'Organize Garage', 'Clean Pool', 'Check Sprinklers', 'Collect Mail', 'Take Out Recycling',
  
  // Maintenance Tasks (10 items)
  'Change Light Bulbs', 'Check Smoke Detectors', 'Clean Air Filters', 'Organize Tools', 'Test Security System',
  'Inspect Plumbing', 'Check for Leaks', 'Maintain HVAC', 'Caulk Windows', 'Touch Up Paint'
]);

// 21. 🧸 Kids Activities - comprehensive children's activity list (49 items)
const kidsActivityItems = createItemsFromPairs(getKidsActivities());

// ========================================
// NEW WHEELS TO FILL GAPS AND ENRICH CATEGORIES
// ========================================

// 22. 🤔 Yes or No Decisions - binary choice answers (60 items)
const yesNoDecisionItems = createItems([
  // Positive Yes Answers (20 items)
  'Yes, go for it!', 'Absolutely yes!', 'Yes, do it now!', 'Yes, trust yourself!', 'Yes, take the chance!',
  'Yes, you\'ve got this!', 'Yes, follow your heart!', 'Yes, be brave!', 'Yes, it\'s time!', 'Yes, make it happen!',
  'Yes, believe in yourself!', 'Yes, take the leap!', 'Yes, you deserve it!', 'Yes, seize the moment!', 'Yes, why not?',
  'Yes, life is short!', 'Yes, you\'ll regret not trying!', 'Yes, trust your instincts!', 'Yes, be bold!', 'Yes, embrace change!',
  
  // Positive No Answers (20 items)
  'No, not right now', 'No, trust your gut', 'No, wait for better timing', 'No, you know better', 'No, stay strong',
  'No, stick to your values', 'No, protect your peace', 'No, save your energy', 'No, you deserve better', 'No, be patient',
  'No, focus on priorities', 'No, listen to your heart', 'No, respect your boundaries', 'No, stay true to yourself', 'No, not worth it',
  'No, you\'re better than this', 'No, choose wisely', 'No, maintain your standards', 'No, think long-term', 'No, preserve your wellbeing',
  
  // Conditional/Thoughtful Answers (20 items)
  'Yes, but think it through first', 'No, but revisit later', 'Yes, if you\'re truly ready', 'No, unless circumstances change',
  'Yes, with proper preparation', 'No, but keep it as a goal', 'Yes, if it aligns with your values', 'No, but stay open-minded',
  'Yes, after careful consideration', 'No, but don\'t close the door', 'Yes, if the timing feels right', 'No, but learn from this moment',
  'Yes, if you can handle the consequences', 'No, but appreciate the opportunity', 'Yes, if it brings you joy', 'No, but trust the process',
  'Yes, if it helps you grow', 'No, but something better awaits', 'Yes, if you\'re following your passion', 'No, but you\'re on the right path'
]);

// 23. 🎭 Life Choices - major life decisions and directions (70 items)
const lifeChoiceItems = createItems([
  // Career & Education (20 items)
  'Change careers completely', 'Go back to school for higher degree', 'Start your own business', 'Take a sabbatical year',
  'Learn a completely new skill', 'Move abroad for work', 'Freelance full-time', 'Take early retirement',
  'Switch to remote work', 'Pursue your passion career', 'Get professional certification', 'Join a startup',
  'Become a digital nomad', 'Take a leadership role', 'Mentor others in your field', 'Write a book about your expertise',
  'Speak at conferences', 'Build a personal brand', 'Create online courses', 'Consult in your field',
  
  // Relationships & Family (15 items)
  'Get married', 'Have children', 'Move in with partner', 'End a long relationship', 'Reconnect with family',
  'Make new friends', 'Join a community group', 'Start dating again', 'Adopt a child', 'Get divorced',
  'Plan a big wedding', 'Elope instead', 'Have another child', 'Move closer to family', 'Set relationship boundaries',
  
  // Living & Location (15 items)
  'Move to a different country', 'Buy your first home', 'Downsize your living space', 'Live in a tiny house',
  'Move to the countryside', 'Live in a big city', 'Rent instead of buying', 'Live near the ocean',
  'Move to the mountains', 'Live in a different climate', 'Buy a vacation home', 'Live minimally',
  'Create a home office', 'Get roommates', 'Live alone for the first time',
  
  // Lifestyle & Personal Growth (20 items)
  'Adopt a completely healthy lifestyle', 'Travel the world for a year', 'Learn a new language fluently', 'Overcome your biggest fear',
  'Quit social media entirely', 'Start a daily meditation practice', 'Run a marathon', 'Learn to cook professionally',
  'Take up extreme sports', 'Become environmentally conscious', 'Practice minimalism', 'Start journaling daily',
  'Learn a musical instrument', 'Take up photography seriously', 'Start a creative hobby', 'Volunteer regularly',
  'Mentor someone younger', 'Write your life story', 'Create art regularly', 'Practice gratitude daily'
]);

// 24. 🌅 What Should I Do Today? - daily activity and mood-based decisions (65 items)
const todayActivityItems = createItems([
  // Energetic Mood (15 items)
  'Go for a run', 'Clean the entire house', 'Reorganize a room', 'Try a new workout', 'Dance to music',
  'Take a long walk', 'Do a challenging puzzle', 'Learn something completely new', 'Call old friends', 'Cook an elaborate meal',
  'Start a project', 'Go on an adventure', 'Explore a new place', 'Play sports', 'Do outdoor activities',
  
  // Relaxed Mood (15 items)
  'Read a good book', 'Take a warm bath', 'Watch a movie marathon', 'Do gentle yoga', 'Listen to podcasts',
  'Take a nap', 'Sit in nature', 'Do breathing exercises', 'Write in a journal', 'Drink tea mindfully',
  'Look through old photos', 'Do light stretching', 'Listen to calming music', 'Practice meditation', 'Cloud watching',
  
  // Creative Mood (15 items)
  'Paint or draw something', 'Write poetry or stories', 'Try a new recipe', 'Make music', 'Create photo art',
  'Design something', 'Write letters', 'Start a craft project', 'Decorate your space', 'Make a vision board',
  'Try photography', 'Write in a creative journal', 'Make a playlist', 'Create videos', 'Try origami',
  
  // Social Mood (10 items)
  'Plan a gathering', 'Call family members', 'Text friends you miss', 'Join online communities', 'Help a neighbor',
  'Volunteer somewhere', 'Attend local events', 'Make new friends', 'Plan a surprise for someone', 'Share your skills',
  
  // Productive Mood (10 items)
  'Organize digital files', 'Plan your week', 'Learn a new skill online', 'Update your resume', 'Research investments',
  'Plan future travels', 'Set new goals', 'Review your finances', 'Declutter belongings', 'Prepare healthy meals'
]);

// 25. 💰 Should I Buy This? - actual purchase decisions (60 items)
const purchaseDecisionItems = createItems([
  // Buy It Decisions (20 items)
  'Yes, buy it now!', 'Go for it, you deserve it!', 'Buy it, life is short!', 'Purchase it, you\'ll love it!', 'Yes, treat yourself!',
  'Buy it, you\'ve been wanting this!', 'Go ahead, it\'s worth it!', 'Yes, make the purchase!', 'Buy it, you earned it!', 'Go for it, don\'t hesitate!',
  'Yes, add it to cart!', 'Buy it, perfect timing!', 'Purchase it, you need this!', 'Yes, investment in yourself!', 'Buy it, great choice!',
  'Go for it, no regrets!', 'Yes, splurge a little!', 'Buy it, you\'ll use it often!', 'Purchase it, high quality!', 'Yes, buy the premium version!',
  
  // Don\'t Buy Decisions (20 items)
  'No, save your money', 'Don\'t buy it, not worth it', 'Skip it, you don\'t need it', 'No, invest that money instead', 'Don\'t purchase, bad timing',
  'No, you have enough already', 'Skip it, find a free alternative', 'Don\'t buy, wait for a sale', 'No, stick to your budget', 'Skip it, not essential',
  'Don\'t buy, you\'ll regret it', 'No, focus on needs first', 'Skip it, too expensive', 'Don\'t purchase, low quality', 'No, you won\'t use it',
  'Skip it, impulse purchase', 'Don\'t buy, clutters space', 'No, better options exist', 'Skip it, save for something bigger', 'Don\'t buy, not your style',
  
  // Alternative/Smart Shopping Decisions (20 items)
  'Buy it used instead', 'Wait for Black Friday sale', 'Look for a discount code first', 'Buy the basic version', 'Wait one month, then decide',
  'Ask for it as a gift', 'Rent it instead of buying', 'Buy from a local store', 'Get the eco-friendly version', 'Try the free trial first',
  'Buy it in a smaller size', 'Look for bundle deals', 'Wait for next paycheck', 'Buy the store brand version', 'Get it secondhand online',
  'Compare prices first', 'Buy it during end-of-season', 'Look for refurbished options', 'Buy it with cashback rewards', 'Wait for better reviews'
]);

// 26. 🏖️ Weekend Plans - weekend activity and outing decisions (70 items)
const weekendPlanItems = createItems([
  // Outdoor Adventures (20 items)
  'Go hiking', 'Visit a beach', 'Have a picnic', 'Go camping', 'Take nature photos',
  'Visit a farmers market', 'Go to a park', 'Try outdoor yoga', 'Go for a bike ride', 'Visit botanical gardens',
  'Go stargazing', 'Try geocaching', 'Visit a lake', 'Go rock climbing', 'Take a scenic drive',
  'Go fishing', 'Visit a zoo', 'Try disc golf', 'Go to outdoor concert', 'Have a barbecue',
  
  // Cultural Activities (15 items)
  'Visit a museum', 'Go to art galleries', 'Attend a theater show', 'See live music', 'Visit historical sites',
  'Attend cultural festivals', 'Take a guided tour', 'Visit a library', 'Go to poetry reading', 'Attend lectures',
  'Visit cultural centers', 'See a ballet or opera', 'Attend art classes', 'Visit craft fairs', 'Go to book readings',
  
  // Social Activities (15 items)
  'Host a dinner party', 'Have a game night', 'Organize potluck', 'Plan a group outing', 'Visit friends',
  'Attend networking events', 'Join clubs or groups', 'Go to meetups', 'Plan family gatherings', 'Host movie night',
  'Organize outdoor games', 'Plan a road trip', 'Visit relatives', 'Attend parties', 'Join volunteer activities',
  
  // Relaxation & Self-Care (10 items)
  'Spa day at home', 'Read in a cozy spot', 'Take long baths', 'Practice meditation', 'Do gentle exercise',
  'Have lazy morning', 'Watch favorite movies', 'Listen to music', 'Do creative hobbies', 'Nap in the afternoon',
  
  // Learning & Growth (10 items)
  'Take online courses', 'Learn new skills', 'Practice hobbies', 'Read educational books', 'Watch documentaries',
  'Attend workshops', 'Practice languages', 'Research interests', 'Plan future goals', 'Reflect and journal'
]);

// 27. 🍪 Snack Attack - quick snacks and light bites (65 items)
const snackItems = createItems([
  // Sweet Snacks (20 items)
  'Chocolate chip cookies', 'Fresh berries', 'Apple slices with peanut butter', 'Yogurt with honey', 'Dark chocolate squares',
  'Banana with almond butter', 'Granola bars', 'Dried fruit mix', 'Smoothie bowl', 'Energy balls',
  'Ice cream', 'Fruit popsicles', 'Chocolate covered strawberries', 'Muffins', 'Donuts',
  'Cake pops', 'Macarons', 'Candy', 'Marshmallows', 'Fudge',
  
  // Savory Snacks (20 items)
  'Cheese and crackers', 'Hummus with vegetables', 'Mixed nuts', 'Popcorn', 'Pretzels',
  'Chips and guacamole', 'Olives', 'Pickles', 'Jerky', 'Trail mix',
  'Deviled eggs', 'Stuffed olives', 'Cheese cubes', 'Salami and cheese', 'Veggie chips',
  'Rice cakes', 'Edamame', 'Roasted chickpeas', 'Sunflower seeds', 'Beef jerky',
  
  // Healthy Options (15 items)
  'Carrot sticks', 'Celery with almond butter', 'Cucumber slices', 'Bell pepper strips', 'Cherry tomatoes',
  'Kale chips', 'Apple slices', 'Orange segments', 'Grapes', 'Blueberries',
  'Whole grain crackers', 'Greek yogurt', 'Hard boiled eggs', 'Avocado toast', 'Green smoothie',
  
  // Comfort Snacks (10 items)
  'Mac and cheese bites', 'Mini pizzas', 'Grilled cheese triangles', 'Chicken nuggets', 'Mozzarella sticks',
  'Onion rings', 'Nachos', 'Quesadilla', 'Sliders', 'Hot wings'
]);

// 28. 🍽️ Dinner Ideas - evening meal suggestions (75 items)
const dinnerItems = createItems([
  // Quick Weeknight Meals (20 items)
  'Spaghetti with marinara', 'Grilled chicken breast', 'Stir-fried vegetables', 'Taco Tuesday', 'Baked salmon',
  'Chicken quesadillas', 'Fried rice', 'Pasta primavera', 'Grilled cheese and soup', 'Chicken stir-fry',
  'Fish tacos', 'Beef and broccoli', 'Chicken fajitas', 'Shrimp scampi', 'Veggie burgers',
  'Pork chops', 'Chicken teriyaki', 'Beef tacos', 'Turkey meatballs', 'Baked cod',
  
  // Comfort Food (15 items)
  'Homemade pizza', 'Chicken pot pie', 'Meatloaf with mashed potatoes', 'Beef stew', 'Fried chicken',
  'Shepherd\'s pie', 'Lasagna', 'Chili with cornbread', 'Pot roast', 'Mac and cheese',
  'Chicken and dumplings', 'Meatball subs', 'Sloppy joes', 'Fish and chips', 'Barbecue ribs',
  
  // International Cuisine (20 items)
  'Thai curry', 'Japanese teriyaki', 'Italian risotto', 'Mexican enchiladas', 'Indian butter chicken',
  'Chinese sweet and sour', 'Greek gyros', 'Korean bulgogi', 'Spanish paella', 'French coq au vin',
  'German schnitzel', 'Lebanese kebabs', 'Moroccan tagine', 'Vietnamese pho', 'Brazilian feijoada',
  'Russian borscht', 'Ethiopian injera', 'Peruvian ceviche', 'Turkish dolmas', 'Jamaican jerk chicken',
  
  // Healthy Options (20 items)
  'Quinoa bowls', 'Grilled vegetable medley', 'Lentil curry', 'Baked sweet potato', 'Cauliflower rice bowl',
  'Zucchini noodles', 'Greek salad with chicken', 'Buddha bowl', 'Stuffed bell peppers', 'Grilled portobello',
  'Chickpea curry', 'Roasted vegetables', 'Salmon with asparagus', 'Turkey lettuce wraps', 'Vegetable soup',
  'Black bean bowls', 'Stuffed zucchini', 'Eggplant parmesan', 'Tofu stir-fry', 'Mediterranean bowl'
]);

// 29. 🥞 Breakfast Options - morning meal ideas (60 items)
const breakfastItems = createItems([
  // Quick Options (15 items)
  'Toast with jam', 'Cereal with milk', 'Yogurt with granola', 'Banana and peanut butter', 'Energy bar',
  'Smoothie', 'Instant oatmeal', 'Bagel with cream cheese', 'Hard boiled eggs', 'Greek yogurt',
  'Protein shake', 'Muffin', 'Fruit cup', 'Granola bar', 'Coffee and pastry',
  
  // Classic Breakfast (15 items)
  'Pancakes with syrup', 'French toast', 'Waffles with berries', 'Eggs Benedict', 'Full English breakfast',
  'Bacon and eggs', 'Sausage and pancakes', 'Breakfast burrito', 'Eggs and toast', 'Hash browns',
  'Breakfast sandwich', 'Omelet', 'Scrambled eggs', 'Fried eggs', 'Breakfast pizza',
  
  // Healthy Options (15 items)
  'Overnight oats', 'Chia pudding', 'Acai bowl', 'Green smoothie', 'Avocado toast',
  'Quinoa breakfast bowl', 'Steel cut oats', 'Fresh fruit salad', 'Veggie omelet', 'Whole grain toast',
  'Protein smoothie bowl', 'Egg white scramble', 'Turkey sausage', 'Cottage cheese with fruit', 'Homemade granola',
  
  // International Breakfast (15 items)
  'Japanese tamagoyaki', 'Mexican huevos rancheros', 'Italian cornetto', 'French croissant', 'German pretzel',
  'Chinese congee', 'Indian idli', 'Turkish simit', 'British beans on toast', 'Spanish churros',
  'Korean kimchi fried rice', 'Middle Eastern shakshuka', 'Australian Vegemite toast', 'Russian blini', 'Scandinavian smorgasbord'
]);

// 30. 🎲 Dice Games - traditional dice combinations (55 items)
const diceGameItems = createItems([
  // Standard Dice Rolls (10 items)
  'Roll 1d6', 'Roll 2d6', 'Roll 3d6', 'Roll 1d20', 'Roll 1d12',
  'Roll 1d10', 'Roll 1d8', 'Roll 1d4', 'Roll percentile (d100)', 'Roll 4d6 drop lowest',
  
  // Game-Specific Rolls (15 items)
  'Yahtzee roll (5d6)', 'Farkle roll (6d6)', 'Craps roll (2d6)', 'Backgammon roll (2d6)', 'Monopoly roll (2d6)',
  'Risk battle (3d6 vs 2d6)', 'D&D ability score (4d6 drop lowest)', 'Advantage roll (2d20 take higher)', 'Disadvantage roll (2d20 take lower)', 'Exploding dice',
  'Savage Worlds roll', 'FATE dice roll', 'Shadowrun roll (multiple d6)', 'White Wolf roll (d10 pool)', 'Burning Wheel roll',
  
  // Fun Dice Challenges (15 items)
  'Lucky number challenge', 'High roller contest', 'Consecutive rolls', 'Even numbers only', 'Odd numbers only',
  'Roll your age', 'Roll under challenge', 'Double or nothing', 'Progressive jackpot', 'Dice poker hand',
  'Sum equals 21', 'All dice same number', 'Ascending order roll', 'Prime numbers only', 'Roll a perfect pattern',
  
  // Creative Dice Uses (15 items)
  'Story element (1-6)', 'Character trait (1-8)', 'Plot twist (1-10)', 'Random direction (1-4)', 'Time of day (1-12)',
  'Weather roll (1-6)', 'Emotion check (1-8)', 'Difficulty level (1-5)', 'NPC personality (1-10)', 'Quest objective (1-12)',
  'Random encounter (1-20)', 'Treasure type (1-8)', 'Skill challenge (1-6)', 'Mystery element (1-10)', 'Adventure hook (1-12)'
]);

// 31. 🍀 Lucky Numbers - personal numbers and special occasions (65 items)
const luckyNumberItems = createItems([
  // Single Lucky Numbers (15 items)
  '7 (Classic Lucky)', '3 (Magic Number)', '8 (Infinity)', '9 (Completion)', '13 (Unlucky turned Lucky)',
  '21 (Coming of Age)', '11 (Master Number)', '22 (Master Builder)', '33 (Master Teacher)', '1 (New Beginnings)',
  '5 (Adventure)', '6 (Harmony)', '4 (Stability)', '2 (Partnership)', '0 (Infinite Potential)',
  
  // Lottery Number Sets (15 items)
  'Quick Pick 6 numbers', 'Birth date combo', 'Anniversary numbers', 'Age-based selection', 'Address numbers',
  'Phone number digits', 'Social Security digits', 'License plate numbers', 'Clock time numbers', 'Temperature numbers',
  'Random 1-49 set', 'Fibonacci sequence', 'Prime number set', 'Perfect squares', 'Even numbers only',
  
  // Special Occasion Numbers (15 items)
  'Wedding date numbers', 'Birthday numbers', 'Graduation year', 'First job year', 'Moving date',
  'Pet\'s birthday', 'Parents\' anniversary', 'First date numbers', 'Holiday dates', 'Achievement dates',
  'Lucky streak start', 'Competition numbers', 'Travel booking numbers', 'House purchase date', 'New car numbers',
  
  // Cultural Lucky Numbers (10 items)
  '8 (Chinese Prosperity)', '4 (Japanese Unlucky)', '7 (Western Lucky)', '3 (Celtic Sacred)', '9 (Norse Sacred)',
  '5 (Chinese Elements)', '12 (Zodiac Complete)', '108 (Buddhist Sacred)', '18 (Hebrew Life)', '40 (Biblical Significance)',
  
  // Number Combinations (10 items)
  'Triple digits (111, 222, etc.)', 'Mirror numbers (121, 131)', 'Sequential (123, 456)', 'Palindromes (191, 252)',
  'Sum equals lucky number', 'Product equals target', 'Difference patterns', 'Geometric progressions', 'Arithmetic series', 'Random cosmic combo'
]);

// 32. 🤝 Team Building Activities - office bonding ideas (60 items)
const teamBuildingItems = createItems([
  // Icebreaker Activities (15 items)
  'Two Truths and a Lie', 'Human Bingo', 'Speed Networking', 'Name That Colleague', 'Desert Island Items',
  'Personality Test Sharing', 'Photo Scavenger Hunt', 'Would You Rather', 'Story Chain Building', 'Common Ground Finding',
  'Trivia About Colleagues', 'Bucket List Sharing', 'Skills Exchange', 'Childhood Photo Guessing', 'Office Olympics',
  
  // Problem-Solving Challenges (15 items)
  'Escape Room Challenge', 'Puzzle Competitions', 'Brain Teaser Sessions', 'Innovation Workshop', 'Design Thinking Exercise',
  'Case Study Solutions', 'Resource Allocation Game', 'Strategy Planning Session', 'Process Improvement Challenge', 'Creative Problem Solving',
  'Build a Tower Challenge', 'Marshmallow Challenge', 'Paper Airplane Contest', 'Invention Workshop', 'Future Visioning',
  
  // Communication Activities (15 items)
  'Presentation Skills Workshop', 'Active Listening Games', 'Storytelling Circle', 'Feedback Practice', 'Conflict Resolution Role-Play',
  'Negotiation Simulations', 'Cross-Department Shadowing', 'Mentoring Circles', 'Knowledge Sharing Sessions', 'Best Practices Exchange',
  'Communication Style Assessment', 'Team Charter Creation', 'Goal Alignment Session', 'Values Definition Workshop', 'Vision Board Creation',
  
  // Fun Social Activities (15 items)
  'Cooking Competition', 'Office Talent Show', 'Game Tournament', 'Movie Marathon', 'Potluck Lunch',
  'Book Club Meeting', 'Sports Day', 'Karaoke Session', 'Art and Craft Workshop', 'Photography Contest',
  'Themed Dress-Up Day', 'Office Decorating Contest', 'Volunteer Day', 'Cultural Food Festival', 'Holiday Celebrations'
]);

// 33. 🎤 Meeting Icebreakers - professional conversation starters (55 items)
const meetingIcebreakerItems = createItems([
  // Quick Check-ins (15 items)
  'One word to describe your week', 'Current energy level (1-10)', 'Weather in your world today', 'Best thing since last meeting',
  'One thing you\'re grateful for', 'Current mood emoji', 'Coffee or tea preference today', 'Weekend highlight in 10 seconds',
  'One word for how you\'re feeling', 'Productivity level today', 'Motivation meter reading', 'Stress level check',
  'Excitement level for today', 'Current brain fuel', 'Energy source today',
  
  // Professional Development (10 items)
  'Skill you\'re currently learning', 'Recent professional win', 'Goal you\'re working toward', 'Book or podcast recommendation',
  'Industry trend you\'re watching', 'Tool that\'s helping you lately', 'Recent learning experience', 'Networking connection made',
  'Conference or webinar attended', 'Professional challenge overcome',
  
  // Creative Questions (15 items)
  'If this project were a movie genre', 'Superpower needed for this meeting', 'Animal that represents your workstyle',
  'Color that matches your current mood', 'Song title for your morning', 'Fictional character as team member',
  'Time period you\'d work in', 'Dream collaboration partner', 'Invention needed for your job', 'Magic wand solution',
  'Perfect work environment', 'Celebrity CEO choice', 'Work theme song', 'Ideal teammate quality', 'Innovation you wish existed',
  
  // Team Connection (15 items)
  'Something you appreciate about a colleague', 'Team strength to celebrate', 'Collaboration success story', 'Help you could offer someone',
  'Support you need today', 'Team tradition to start', 'Shared goal excitement', 'Cross-department connection made',
  'Knowledge you could share', 'Mentoring moment experienced', 'Team achievement to highlight', 'Partnership opportunity',
  'Skill someone taught you', 'Team value in action', 'Collective win to celebrate'
]);

// 34. 🎮 Video Game Genres - gaming mood picker (65 items)
const videoGameGenreItems = createItems([
  // Action & Adventure (15 items)
  'First-Person Shooter', 'Third-Person Action', 'Platformer', 'Beat \'em Up', 'Hack and Slash',
  'Open World Adventure', 'Stealth Action', 'Survival Action', 'Battle Royale', 'Fighting Games',
  'Racing Games', 'Sports Games', 'Arcade Action', 'Run and Gun', 'Action RPG',
  
  // Strategy & Simulation (15 items)
  'Real-Time Strategy', 'Turn-Based Strategy', 'City Builder', 'Life Simulation', 'Management Simulation',
  'Business Simulation', 'Flight Simulator', 'Farming Simulator', 'Construction Simulator', 'Political Strategy',
  'War Strategy', 'Economic Strategy', 'Tower Defense', 'God Games', 'Civilization Builder',
  
  // RPG & Story-Driven (15 items)
  'Japanese RPG', 'Western RPG', 'Action RPG', 'Tactical RPG', 'MMORPG',
  'Visual Novel', 'Interactive Fiction', 'Story-Rich Adventure', 'Choice-Based Games', 'Narrative Adventure',
  'Character-Driven RPG', 'Fantasy RPG', 'Sci-Fi RPG', 'Post-Apocalyptic RPG', 'Historical RPG',
  
  // Casual & Puzzle (10 items)
  'Match-3 Puzzle', 'Logic Puzzles', 'Hidden Object', 'Time Management', 'Casual Strategy',
  'Mobile Casual', 'Word Games', 'Trivia Games', 'Brain Training', 'Relaxing Games',
  
  // Multiplayer & Social (10 items)
  'Cooperative Multiplayer', 'Competitive Multiplayer', 'Party Games', 'Online Multiplayer', 'Local Multiplayer',
  'Team-Based Games', 'Social Deduction', 'Massive Multiplayer', 'Split-Screen Games', 'Cross-Platform Games'
]);

// Define the 34 predetermined titles (21 original + 13 new)
export const PREDETERMINED_TITLES: Title[] = [
  {
    id: 'kids-activities',
    name: 'Kids Activities',
    emoji: '🧸',
    description: 'Fun activities for children and families - creative, active, and imaginative play',
    category: TitleCategory.FAMILY,
    items: kidsActivityItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'whats-for-lunch',
    name: "What's for Lunch?",
    emoji: '🍽️',
    description: 'Discover delicious meal ideas from quick snacks to hearty meals',
    category: TitleCategory.FOOD,
    items: lunchItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'afternoon-activities',
    name: 'Afternoon Activities',
    emoji: '🏃',
    description: 'Fun activities for any time of day - indoor, outdoor, social, and creative',
    category: TitleCategory.FAMILY,
    items: activityItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'random-numbers',
    name: 'Random Numbers',
    emoji: '🎲',
    description: 'Pick random numbers from 1-100 for games, decisions, or lottery fun',
    category: TitleCategory.NUMBERS,
    items: numberItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'truth-or-dare',
    name: 'Truth or Dare',
    emoji: '😈',
    description: 'Fun party game with truths, dares, and creative challenges for all ages',
    category: TitleCategory.GAMES,
    items: truthOrDareItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'team-picker',
    name: 'Team Picker',
    emoji: '⚽',
    description: 'Assign teams, roles, and positions for sports, projects, and group activities',
    category: TitleCategory.GAMES,
    items: teamItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'dessert-roulette',
    name: 'Dessert Roulette',
    emoji: '🍰',
    description: 'Sweet treats from classic to modern - satisfy your dessert cravings',
    category: TitleCategory.FOOD,
    items: dessertItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'book-genres',
    name: 'Book Genres',
    emoji: '📚',
    description: 'Discover your next great read across fiction, non-fiction, and specialized genres',
    category: TitleCategory.ENTERTAINMENT,
    items: bookGenreItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'travel-destinations',
    name: 'Travel Destinations',
    emoji: '🌍',
    description: 'Dream vacation picker - explore destinations around the world',
    category: TitleCategory.ENTERTAINMENT,
    items: travelItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'creativity-prompts',
    name: 'Creativity Prompts',
    emoji: '💡',
    description: 'Writing and art inspiration to spark your creative imagination',
    category: TitleCategory.EDUCATION,
    items: creativityItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'mindfulness-activities',
    name: 'Mindfulness Activities',
    emoji: '🧘',
    description: 'Meditation, breathing, and relaxation techniques for inner peace',
    category: TitleCategory.FAMILY,
    items: mindfulnessItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'party-games',
    name: 'Party Games',
    emoji: '🎪',
    description: 'Group entertainment ideas for gatherings, parties, and social events',
    category: TitleCategory.GAMES,
    items: partyGameItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'science-experiments',
    name: 'Science Experiments',
    emoji: '🔬',
    description: 'Educational activities and experiments for learning and discovery',
    category: TitleCategory.EDUCATION,
    items: scienceItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'garden-tasks',
    name: 'Garden Tasks',
    emoji: '🌱',
    description: 'Outdoor and plant care activities for green thumbs and nature lovers',
    category: TitleCategory.FAMILY,
    items: gardenItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'goal-categories',
    name: 'Goal Categories',
    emoji: '🎯',
    description: 'Personal development areas to focus your growth and improvement',
    category: TitleCategory.EDUCATION,
    items: goalItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'art-techniques',
    name: 'Art Techniques',
    emoji: '🎨',
    description: 'Drawing, painting, and creative methods to explore artistic expression',
    category: TitleCategory.EDUCATION,
    items: artTechniqueItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'movie-night',
    name: 'Movie Night',
    emoji: '🎬',
    description: 'Popular movies across genres for your next film viewing experience',
    category: TitleCategory.ENTERTAINMENT,
    items: movieNightItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'music-genres',
    name: 'Music Genres',
    emoji: '🎵',
    description: 'Musical styles for discovery - explore sounds from around the world',
    category: TitleCategory.ENTERTAINMENT,
    items: musicGenreItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'work-break-ideas',
    name: 'Work Break Ideas',
    emoji: '🏢',
    description: 'Office-appropriate activities for 5, 15, and 30-minute work breaks',
    category: TitleCategory.WORKPLACE,
    items: workBreakItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'study-topics',
    name: 'Study Topics',
    emoji: '🎓',
    description: 'Subject rotation for students - academic, language, and skill development',
    category: TitleCategory.EDUCATION,
    items: studyTopicItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'chore-assignments',
    name: 'Chore Assignments',
    emoji: '🏡',
    description: 'Household task distribution for kitchen, bathroom, living, and outdoor areas',
    category: TitleCategory.FAMILY,
    items: choreItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  
  // ========================================
  // NEW WHEELS ADDED TO FILL GAPS AND ENRICH CATEGORIES
  // ========================================
  
  // DECISIONS Category - Fill the empty category (5 new wheels)
  {
    id: 'yes-no-decisions',
    name: 'Yes or No Decisions',
    emoji: '🤔',
    description: 'Get clear Yes or No answers for any decision you\'re facing',
    category: TitleCategory.DECISIONS,
    items: yesNoDecisionItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'life-choices',
    name: 'Life Choices',
    emoji: '🎭',
    description: 'Major life decisions and directions for personal growth',
    category: TitleCategory.DECISIONS,
    items: lifeChoiceItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'what-should-i-do-today',
    name: 'What Should I Do Today?',
    emoji: '🌅',
    description: 'Daily activity and mood-based decisions for any time of day',
    category: TitleCategory.DECISIONS,
    items: todayActivityItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'should-i-buy-this',
    name: 'Should I Buy This?',
    emoji: '💰',
    description: 'Get definitive buy, don\'t buy, or alternative purchase decisions',
    category: TitleCategory.DECISIONS,
    items: purchaseDecisionItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'weekend-plans',
    name: 'Weekend Plans',
    emoji: '🏖️',
    description: 'Weekend activity and outing decisions for relaxation and fun',
    category: TitleCategory.DECISIONS,
    items: weekendPlanItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },

  // FOOD Category - Expand with more meal options (3 new wheels)
  {
    id: 'snack-attack',
    name: 'Snack Attack',
    emoji: '🍪',
    description: 'Quick snacks and light bites for any craving or time of day',
    category: TitleCategory.FOOD,
    items: snackItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'dinner-ideas',
    name: 'Dinner Ideas',
    emoji: '🍽️',
    description: 'Evening meal suggestions from quick weeknight to special occasion dinners',
    category: TitleCategory.FOOD,
    items: dinnerItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'breakfast-options',
    name: 'Breakfast Options',
    emoji: '🥞',
    description: 'Morning meal ideas from quick grab-and-go to leisurely weekend brunches',
    category: TitleCategory.FOOD,
    items: breakfastItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },

  // NUMBERS Category - Expand with gaming and luck (2 new wheels)
  {
    id: 'dice-games',
    name: 'Dice Games',
    emoji: '🎲',
    description: 'Traditional dice combinations and gaming rolls for tabletop fun',
    category: TitleCategory.NUMBERS,
    items: diceGameItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'lucky-numbers',
    name: 'Lucky Numbers',
    emoji: '🍀',
    description: 'Personal lucky numbers and special occasion number selections',
    category: TitleCategory.NUMBERS,
    items: luckyNumberItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },

  // WORKPLACE Category - Expand with team activities (2 new wheels)
  {
    id: 'team-building-activities',
    name: 'Team Building Activities',
    emoji: '🤝',
    description: 'Office bonding and collaboration ideas for stronger workplace relationships',
    category: TitleCategory.WORKPLACE,
    items: teamBuildingItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },
  {
    id: 'meeting-icebreakers',
    name: 'Meeting Icebreakers',
    emoji: '🎤',
    description: 'Professional conversation starters and check-ins for productive meetings',
    category: TitleCategory.WORKPLACE,
    items: meetingIcebreakerItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  },

  // GAMES Category - Add modern gaming option (1 new wheel)
  {
    id: 'video-game-genres',
    name: 'Video Game Genres',
    emoji: '🎮',
    description: 'Gaming mood picker for choosing what type of video game to play',
    category: TitleCategory.GAMES,
    items: videoGameGenreItems,
    isCustom: false,
    isPredetermined: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  }
];

// Installation function to load predetermined titles into storage
export const installPredeterminedTitles = async (): Promise<void> => {
  try {
    const existingTitles = await TitleManager.getAllTitles();
    
    console.log('🔄 Installing predetermined titles...');
    
    for (const title of PREDETERMINED_TITLES) {
      // Check both by ID and by name to prevent duplicates
      const existsById = existingTitles.find((t: Title) => t.id === title.id);
      const existsByName = existingTitles.find((t: Title) => 
        t.name.toLowerCase().trim() === title.name.toLowerCase().trim()
      );
      
      if (!existsById && !existsByName) {
        await TitleManager.saveTitle(title);
        console.log(`✅ Installed title: ${title.name}`);
      } else {
        const reason = existsById ? 'ID already exists' : 'Name already exists';
        console.log(`⚠️ Title skipped (${reason}): ${title.name}`);
      }
    }
    
    console.log('🎯 Predetermined titles installation complete!');
  } catch (error) {
    console.error('❌ Error installing predetermined titles:', error);
    throw error;
  }
};

// Helper function to get a predetermined title by ID
export const getPredeterminedTitle = (id: string): Title | undefined => {
  return PREDETERMINED_TITLES.find(title => title.id === id);
};

// Helper function to get all predetermined title IDs
export const getPredeterminedTitleIds = (): string[] => {
  return PREDETERMINED_TITLES.map(title => title.id);
};

// Helper function to check if a title is predetermined
export const isPredeterminedTitle = (titleId: string): boolean => {
  return getPredeterminedTitleIds().includes(titleId);
};