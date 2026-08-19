// Premium mock data for Food Delivery Application

const CATEGORIES = [
  { id: 'all', name: 'All Cuisines', icon: '🍽️' },
  { id: 'burgers', name: 'Burgers', icon: '🍔' },
  { id: 'pizza', name: 'Pizza & Italian', icon: '🍕' },
  { id: 'sushi', name: 'Sushi & Asian', icon: '🍣' },
  { id: 'indian', name: 'Indian Curries', icon: '🍛' },
  { id: 'healthy', name: 'Salads & Healthy', icon: '🥗' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' }
];

const RESTAURANTS = [
  {
    id: 'res-gourmet-burger',
    name: 'The Burger Craft & Co.',
    rating: 4.8,
    reviewsCount: 340,
    deliveryTime: 25, // in minutes
    distance: 1.8, // in km
    costForTwo: 500, // in INR
    cuisines: ['Burgers', 'Fast Food', 'Beverages'],
    bannerImage: './assets/res_burger.jpg',
    isFeatured: true,
    menu: [
      {
        category: 'Signature Burgers',
        items: [
          {
            id: 'item-truffle-burger',
            name: 'Smoked Truffle Butter Burger',
            price: 299,
            description: 'Flame-grilled prime lamb/veg patty, black truffle butter, caramelized onions, Swiss cheese, and brioche bun.',
            isVeg: false,
            rating: 4.9,
            image: './assets/dish_truffle_burger.jpg'
          },
          {
            id: 'item-crunchy-paneer-burger',
            name: 'Crispy Paneer & Jalapeño Burger',
            price: 229,
            description: 'Panko-crusted cottage cheese patty, spicy jalapeño sauce, crunchy lettuce, and cheddar cheese slice.',
            isVeg: true,
            rating: 4.7,
            image: './assets/dish_paneer_burger.jpg'
          },
          {
            id: 'item-classic-chicken-cheese',
            name: 'Classic Chicken & Cheese Deluxe',
            price: 249,
            description: 'Juicy minced chicken patty, double cheddar, signature house sauce, pickles, and fresh tomatoes.',
            isVeg: false,
            rating: 4.6,
            image: './assets/dish_chicken_burger.jpg'
          }
        ]
      },
      {
        category: 'Sides & Fries',
        items: [
          {
            id: 'item-truffle-fries',
            name: 'Truffle Parmesan Fries',
            price: 149,
            description: 'Thick cut golden fries tossed in aromatic white truffle oil, rosemary, and graded parmesan cheese.',
            isVeg: true,
            rating: 4.8,
            image: './assets/dish_truffle_fries.jpg'
          },
          {
            id: 'item-onion-rings',
            name: 'Crispy Beer-Batter Onion Rings',
            price: 119,
            description: 'Hand-cut giant onions dipped in beer batter, served with spicy garlic aioli dip.',
            isVeg: true,
            rating: 4.5,
            image: './assets/dish_onion_rings.jpg'
          }
        ]
      },
      {
        category: 'Beverages',
        items: [
          {
            id: 'item-berry-shake',
            name: 'Wild Berry Cheesecake Shake',
            price: 179,
            description: 'Thick milkshake blended with real blueberries, raspberries, and cream cheese, topped with whipped cream.',
            isVeg: true,
            rating: 4.7,
            image: './assets/dish_berry_shake.jpg'
          },
          {
            id: 'item-iced-tea',
            name: 'Peach & Mint Crafted Iced Tea',
            price: 99,
            description: 'Freshly brewed black tea infused with natural peach pulp and garden-fresh mint leaves.',
            isVeg: true,
            rating: 4.4,
            image: './assets/dish_iced_tea.jpg'
          }
        ]
      }
    ]
  },
  {
    id: 'res-la-piazza',
    name: 'La Piazza Woodfired',
    rating: 4.7,
    reviewsCount: 512,
    deliveryTime: 35,
    distance: 3.2,
    costForTwo: 800,
    cuisines: ['Pizza & Italian', 'Pasta', 'Desserts'],
    bannerImage: './assets/res_pizza.jpg',
    isFeatured: true,
    menu: [
      {
        category: 'Woodfired Pizzas',
        items: [
          {
            id: 'item-burrata-pesto',
            name: 'Burrata & Wild Pesto Pizza',
            price: 449,
            description: 'Neapolitan crust, artisanal basil pesto base, fresh cherry tomatoes, topped with creamy whole Burrata cheese and toasted pine nuts.',
            isVeg: true,
            rating: 4.9,
            image: './assets/dish_burrata_pizza.jpg'
          },
          {
            id: 'item-spicy-pepperoni',
            name: 'Double Pepperoni & Hot Honey Pizza',
            price: 499,
            description: 'Classic red sauce, fresh mozzarella, double cured pepperoni, drizzled with house-made chili-infused honey.',
            isVeg: false,
            rating: 4.8,
            image: './assets/dish_pepperoni_pizza.jpg'
          },
          {
            id: 'item-garden-classic',
            name: 'Classic Margherita & Fresh Basil',
            price: 349,
            description: 'San Marzano tomato sauce, fresh buffalo mozzarella, extra virgin olive oil, and fresh hand-torn sweet basil.',
            isVeg: true,
            rating: 4.6,
            image: './assets/dish_margherita_pizza.jpg'
          }
        ]
      },
      {
        category: 'Artisanal Pasta',
        items: [
          {
            id: 'item-fettuccine-truffle',
            name: 'Fettuccine in Wild Mushroom Truffle Sauce',
            price: 379,
            description: 'Fresh egg fettuccine tossed in a rich, creamy sauce made of button, shiitake, and porcini mushrooms, finished with white truffle oil.',
            isVeg: true,
            rating: 4.8,
            image: './assets/dish_fettuccine.jpg'
          }
        ]
      }
    ]
  },
  {
    id: 'res-ninja-sushi',
    name: 'Ninja Roll & Asian House',
    rating: 4.9,
    reviewsCount: 289,
    deliveryTime: 30,
    distance: 2.5,
    costForTwo: 900,
    cuisines: ['Sushi & Asian', 'Dimsums', 'Healthy'],
    bannerImage: './assets/res_sushi.jpg',
    isFeatured: true,
    menu: [
      {
        category: 'Signature Sushi Rolls',
        items: [
          {
            id: 'item-dragon-roll',
            name: 'Dragon Avocado & Tempura Roll (8 Pcs)',
            price: 549,
            description: 'Crispy prawn tempura and cucumber wrapped in thin avocado slices, topped with unagi sauce and spicy mayo.',
            isVeg: false,
            rating: 4.9,
            image: './assets/dish_dragon_roll.jpg'
          },
          {
            id: 'item-rainbow-roll',
            name: 'Classic Rainbow Maki (8 Pcs)',
            price: 599,
            description: 'California roll inside, layered on the outside with fresh salmon, tuna, red snapper, and ripe avocado.',
            isVeg: false,
            rating: 4.8,
            image: './assets/dish_rainbow_roll.jpg'
          },
          {
            id: 'item-veggie-green-roll',
            name: 'Asparagus & Cream Cheese Roll (8 Pcs)',
            price: 429,
            description: 'Blanched fresh asparagus, pickled radish, cream cheese, wrapped in black sesame and crispy tempura flakes.',
            isVeg: true,
            rating: 4.7,
            image: './assets/dish_veggie_roll.jpg'
          }
        ]
      },
      {
        category: 'Dimsums',
        items: [
          {
            id: 'item-crystal-dumpling',
            name: 'Crystal Veg & Waterchestnut Dimsum (6 Pcs)',
            price: 299,
            description: 'Translucent steamed dumplings packed with finely minced mixed vegetables, water chestnut, and light seasoning.',
            isVeg: true,
            rating: 4.6,
            image: './assets/dish_dimsum_veg.jpg'
          },
          {
            id: 'item-chicken-sui-mai',
            name: 'Chicken & Chive Sui Mai (6 Pcs)',
            price: 349,
            description: 'Traditional open-faced steamed dumplings filled with tender minced chicken, fresh chives, ginger, and sesame oil.',
            isVeg: false,
            rating: 4.7,
            image: './assets/dish_dimsum_chicken.jpg'
          }
        ]
      }
    ]
  },
  {
    id: 'res-royal-zaika',
    name: 'Royal Zaika & Kebabs',
    rating: 4.6,
    reviewsCount: 780,
    deliveryTime: 40,
    distance: 4.1,
    costForTwo: 700,
    cuisines: ['Indian Curries', 'Mughlai', 'Tandoor'],
    bannerImage: './assets/res_indian.jpg',
    isFeatured: false,
    menu: [
      {
        category: 'Royal Main Course',
        items: [
          {
            id: 'item-paneer-butter-masala',
            name: 'Paneer Makhani (Royal Style)',
            price: 329,
            description: 'Charcoal-grilled cottage cheese cubes cooked in a velvety tomato-cashew gravy with plenty of fresh butter and dry fenugreek leaves.',
            isVeg: true,
            rating: 4.8,
            image: './assets/dish_paneer_makhani.jpg'
          },
          {
            id: 'item-butter-chicken',
            name: 'Classic Delhi Style Butter Chicken',
            price: 389,
            description: 'Tandoor roasted chicken pieces simmered in an aromatic, rich, cream-infused spiced sweet tomato gravy.',
            isVeg: false,
            rating: 4.9,
            image: './assets/dish_butter_chicken.jpg'
          },
          {
            id: 'item-veg-biryani',
            name: 'Awadhi Jackfruit & Dum Veg Biryani',
            price: 299,
            description: 'Fragrant basmati rice layered with raw jackfruit, fresh garden veggies, saffron, mint, and slow-cooked on dum.',
            isVeg: true,
            rating: 4.7,
            image: './assets/dish_veg_biryani.jpg'
          }
        ]
      },
      {
        category: 'Tandoori Starters & Breads',
        items: [
          {
            id: 'item-laccha-paratha',
            name: 'Butter Laccha Paratha',
            price: 59,
            description: 'Multi-layered flaky whole wheat flatbread baked in clay oven and brushed with pure ghee.',
            isVeg: true,
            rating: 4.5,
            image: './assets/dish_laccha_paratha.jpg'
          },
          {
            id: 'item-garlic-naan',
            name: 'Garlic Butter Naan',
            price: 69,
            description: 'Leavened refined flour flatbread topped with minced garlic and butter, cooked in tandoor.',
            isVeg: true,
            rating: 4.7,
            image: './assets/dish_garlic_naan.jpg'
          }
        ]
      }
    ]
  },
  {
    id: 'res-green-bowl',
    name: 'The Green Bowl Co.',
    rating: 4.7,
    reviewsCount: 154,
    deliveryTime: 20,
    distance: 1.5,
    costForTwo: 550,
    cuisines: ['Salads & Healthy', 'Healthy', 'Beverages'],
    bannerImage: './assets/res_healthy.jpg',
    isFeatured: false,
    menu: [
      {
        category: 'Superfood Bowls',
        items: [
          {
            id: 'item-avocado-quinoa',
            name: 'Avocado & Quinoa Power Salad',
            price: 289,
            description: 'Organic red quinoa, Haas avocado, baby spinach, cherry tomatoes, cucumbers, toasted pumpkin seeds, tossed in lemon vinaigrette.',
            isVeg: true,
            rating: 4.7,
            image: './assets/dish_quinoa_salad.jpg'
          },
          {
            id: 'item-grilled-chicken-bowl',
            name: 'Mediterranean Grilled Chicken Salad',
            price: 329,
            description: 'Herb-grilled chicken breast, feta cheese, kalamata olives, crisp romaine lettuce, chickpeas, dressed in greek tzatziki.',
            isVeg: false,
            rating: 4.8,
            image: './assets/dish_chicken_salad.jpg'
          }
        ]
      },
      {
        category: 'Cold-Pressed Juices',
        items: [
          {
            id: 'item-detox-green',
            name: 'Green Detox cold-pressed juice',
            price: 139,
            description: 'Fresh cold-pressed mix of spinach, celery, green apple, cucumber, lemon, and a hint of fresh ginger.',
            isVeg: true,
            rating: 4.4,
            image: './assets/dish_green_juice.jpg'
          }
        ]
      }
    ]
  },
  {
    id: 'res-velvet-desserts',
    name: 'Velvet Crust Patisserie',
    rating: 4.8,
    reviewsCount: 210,
    deliveryTime: 22,
    distance: 2.1,
    costForTwo: 400,
    cuisines: ['Desserts', 'Beverages'],
    bannerImage: './assets/res_dessert.jpg',
    isFeatured: false,
    menu: [
      {
        category: 'Artisanal Cakes & Pastries',
        items: [
          {
            id: 'item-chocolate-mud',
            name: 'Belgian Chocolate Decadent Mud Cake',
            price: 189,
            description: 'Rich, moist dark chocolate cake layered with 55% Belgian chocolate ganache, served warm.',
            isVeg: true,
            rating: 4.9,
            image: './assets/dish_chocolate_cake.jpg'
          },
          {
            id: 'item-tiramisu-jar',
            name: 'Classic Espresso Tiramisu Jar',
            price: 219,
            description: 'Layers of espresso-soaked ladyfingers, velvety mascarpone cream, dusted with dark cocoa powder in a cute glass jar.',
            isVeg: true,
            rating: 4.8,
            image: './assets/dish_tiramisu.jpg'
          },
          {
            id: 'item-red-velvet',
            name: 'Red Velvet Cream Cheese Pastry',
            price: 169,
            description: 'Fluffy red velvet sponge layered with smooth, tang-sweet cream cheese frosting and white chocolate curls.',
            isVeg: true,
            rating: 4.6,
            image: './assets/dish_red_velvet.jpg'
          }
        ]
      }
    ]
  }
];
