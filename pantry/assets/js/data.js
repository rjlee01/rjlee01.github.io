// ── Recipe Database ───────────────────────────────────────────────────────────
const RECIPES = [
  {
    id:"r01", name:"Banana Bread", category:"baking", time:65, servings:8,
    tags:["bread","banana","sweet"],
    ingredients:[
      {name:"banana",qty:3,unit:"ripe"},
      {name:"flour",qty:1.5,unit:"cups"},
      {name:"sugar",qty:0.75,unit:"cups"},
      {name:"butter",qty:0.33,unit:"cups"},
      {name:"egg",qty:1,unit:""},
      {name:"baking soda",qty:1,unit:"tsp"},
      {name:"salt",qty:0.25,unit:"tsp"},
      {name:"vanilla extract",qty:1,unit:"tsp"},
    ],
    instructions:[
      "Preheat oven to 350°F. Grease a 9×5 loaf pan.",
      "Mash bananas in a large bowl. Stir in melted butter.",
      "Mix in sugar, beaten egg, and vanilla.",
      "Add baking soda and salt. Fold in flour until just combined.",
      "Pour into loaf pan and bake 60–65 min until a toothpick comes out clean.",
      "Cool 10 min in pan, then turn out onto a wire rack.",
    ]
  },
  {
    id:"r02", name:"Chocolate Chip Cookies", category:"baking", time:30, servings:24,
    tags:["cookies","chocolate","sweet"],
    ingredients:[
      {name:"flour",qty:2.25,unit:"cups"},
      {name:"butter",qty:1,unit:"cup"},
      {name:"sugar",qty:0.75,unit:"cups"},
      {name:"brown sugar",qty:0.75,unit:"cups"},
      {name:"egg",qty:2,unit:""},
      {name:"vanilla extract",qty:1,unit:"tsp"},
      {name:"baking soda",qty:1,unit:"tsp"},
      {name:"salt",qty:1,unit:"tsp"},
      {name:"chocolate chips",qty:2,unit:"cups"},
    ],
    instructions:[
      "Preheat oven to 375°F.",
      "Beat butter, sugar, and brown sugar until creamy.",
      "Beat in eggs and vanilla.",
      "Mix in flour, baking soda, and salt. Stir in chocolate chips.",
      "Drop rounded tablespoons onto ungreased baking sheets.",
      "Bake 9–11 min until golden brown.",
    ]
  },
  {
    id:"r03", name:"Blueberry Muffins", category:"baking", time:35, servings:12,
    tags:["muffins","blueberry","breakfast"],
    ingredients:[
      {name:"flour",qty:2,unit:"cups"},
      {name:"sugar",qty:0.75,unit:"cups"},
      {name:"baking powder",qty:2.5,unit:"tsp"},
      {name:"salt",qty:0.5,unit:"tsp"},
      {name:"egg",qty:1,unit:""},
      {name:"milk",qty:0.75,unit:"cups"},
      {name:"butter",qty:0.33,unit:"cups"},
      {name:"blueberries",qty:1,unit:"cup"},
    ],
    instructions:[
      "Preheat oven to 400°F. Grease muffin pan.",
      "Mix flour, sugar, baking powder, salt in large bowl.",
      "Beat egg, milk, melted butter in separate bowl.",
      "Pour wet into dry, stir until just moistened. Fold in blueberries.",
      "Fill muffin cups 2/3 full. Bake 20–25 min.",
    ]
  },
  {
    id:"r04", name:"Classic Brownies", category:"baking", time:40, servings:16,
    tags:["brownies","chocolate","sweet"],
    ingredients:[
      {name:"butter",qty:0.5,unit:"cup"},
      {name:"sugar",qty:1,unit:"cup"},
      {name:"egg",qty:2,unit:""},
      {name:"vanilla extract",qty:1,unit:"tsp"},
      {name:"cocoa powder",qty:0.33,unit:"cups"},
      {name:"flour",qty:0.5,unit:"cup"},
      {name:"salt",qty:0.25,unit:"tsp"},
      {name:"baking powder",qty:0.25,unit:"tsp"},
    ],
    instructions:[
      "Preheat oven to 350°F. Grease an 8×8 pan.",
      "Melt butter and stir in sugar, eggs, and vanilla.",
      "Beat in cocoa, flour, salt, and baking powder.",
      "Spread into prepared pan. Bake 25–30 min.",
      "Cool completely before cutting.",
    ]
  },
  {
    id:"r05", name:"Pancakes", category:"baking", time:20, servings:8,
    tags:["breakfast","pancakes","sweet"],
    ingredients:[
      {name:"flour",qty:1.5,unit:"cups"},
      {name:"baking powder",qty:3.5,unit:"tsp"},
      {name:"sugar",qty:1,unit:"tbsp"},
      {name:"salt",qty:0.25,unit:"tsp"},
      {name:"milk",qty:1.25,unit:"cups"},
      {name:"egg",qty:1,unit:""},
      {name:"butter",qty:3,unit:"tbsp"},
    ],
    instructions:[
      "Whisk flour, baking powder, sugar, and salt together.",
      "Make a well in center; pour in milk, egg, and melted butter. Mix until smooth.",
      "Heat griddle over medium-high, lightly oil.",
      "Pour 1/4 cup batter per pancake. Cook until bubbles form, then flip.",
      "Serve with maple syrup.",
    ]
  },
  {
    id:"r06", name:"Oatmeal Cookies", category:"baking", time:25, servings:36,
    tags:["cookies","oats","sweet"],
    ingredients:[
      {name:"butter",qty:1,unit:"cup"},
      {name:"sugar",qty:0.75,unit:"cups"},
      {name:"brown sugar",qty:0.75,unit:"cups"},
      {name:"egg",qty:2,unit:""},
      {name:"vanilla extract",qty:1,unit:"tsp"},
      {name:"flour",qty:1.5,unit:"cups"},
      {name:"baking soda",qty:1,unit:"tsp"},
      {name:"salt",qty:1,unit:"tsp"},
      {name:"oats",qty:3,unit:"cups"},
    ],
    instructions:[
      "Preheat oven to 375°F.",
      "Beat butter and both sugars until creamy. Add eggs and vanilla.",
      "Mix in flour, baking soda, and salt. Stir in oats.",
      "Drop rounded tablespoons onto greased baking sheets.",
      "Bake 8–10 min until golden.",
    ]
  },
  {
    id:"r07", name:"French Toast", category:"baking", time:15, servings:4,
    tags:["breakfast","french toast","sweet"],
    ingredients:[
      {name:"bread",qty:8,unit:"slices"},
      {name:"egg",qty:3,unit:""},
      {name:"milk",qty:0.25,unit:"cups"},
      {name:"vanilla extract",qty:1,unit:"tsp"},
      {name:"sugar",qty:1,unit:"tbsp"},
      {name:"butter",qty:2,unit:"tbsp"},
      {name:"cinnamon",qty:0.5,unit:"tsp"},
    ],
    instructions:[
      "Whisk eggs, milk, vanilla, sugar, and cinnamon together.",
      "Dip bread slices into egg mixture, coating both sides.",
      "Cook in buttered skillet over medium heat 2–3 min per side.",
      "Serve with maple syrup, powdered sugar, or fresh fruit.",
    ]
  },
  {
    id:"r08", name:"Waffles", category:"baking", time:25, servings:6,
    tags:["breakfast","waffles","sweet"],
    ingredients:[
      {name:"flour",qty:2,unit:"cups"},
      {name:"baking powder",qty:1,unit:"tbsp"},
      {name:"sugar",qty:2,unit:"tbsp"},
      {name:"salt",qty:0.5,unit:"tsp"},
      {name:"egg",qty:2,unit:""},
      {name:"milk",qty:1.75,unit:"cups"},
      {name:"butter",qty:0.5,unit:"cups"},
      {name:"vanilla extract",qty:1,unit:"tsp"},
    ],
    instructions:[
      "Preheat waffle iron.",
      "Mix dry ingredients in one bowl, wet in another.",
      "Combine wet into dry, stir until just blended.",
      "Pour batter onto greased waffle iron. Cook until golden.",
    ]
  },
  {
    id:"r09", name:"Pizza Dough", category:"baking", time:90, servings:2,
    tags:["pizza","dough","savory"],
    ingredients:[
      {name:"flour",qty:3,unit:"cups"},
      {name:"yeast",qty:2.25,unit:"tsp"},
      {name:"sugar",qty:1,unit:"tsp"},
      {name:"salt",qty:1,unit:"tsp"},
      {name:"olive oil",qty:2,unit:"tbsp"},
      {name:"water",qty:1,unit:"cup"},
    ],
    instructions:[
      "Dissolve yeast and sugar in warm water. Let stand 5 min.",
      "Mix in flour, salt, and olive oil. Knead 8–10 min until smooth.",
      "Cover and let rise 60 min until doubled.",
      "Punch down, divide in half. Roll out and top as desired.",
      "Bake at 475°F for 12–15 min.",
    ]
  },
  {
    id:"r10", name:"Garlic Butter Pasta", category:"cooking", time:20, servings:4,
    tags:["pasta","quick","savory"],
    ingredients:[
      {name:"pasta",qty:400,unit:"g"},
      {name:"butter",qty:4,unit:"tbsp"},
      {name:"garlic",qty:4,unit:"cloves"},
      {name:"parmesan",qty:0.5,unit:"cups"},
      {name:"salt",qty:1,unit:"tsp"},
      {name:"black pepper",qty:0.5,unit:"tsp"},
      {name:"parsley",qty:2,unit:"tbsp"},
    ],
    instructions:[
      "Cook pasta in salted water until al dente. Reserve 1/2 cup pasta water.",
      "Melt butter in large pan over medium heat. Add minced garlic and cook 1 min.",
      "Add pasta and toss, adding pasta water as needed.",
      "Toss with parmesan, season with salt and pepper.",
      "Garnish with parsley and serve immediately.",
    ]
  },
  {
    id:"r11", name:"Tomato Soup", category:"cooking", time:30, servings:4,
    tags:["soup","tomato","vegetarian"],
    ingredients:[
      {name:"tomatoes",qty:4,unit:"cups"},
      {name:"onion",qty:1,unit:""},
      {name:"garlic",qty:3,unit:"cloves"},
      {name:"butter",qty:2,unit:"tbsp"},
      {name:"olive oil",qty:1,unit:"tbsp"},
      {name:"sugar",qty:1,unit:"tsp"},
      {name:"salt",qty:1,unit:"tsp"},
      {name:"black pepper",qty:0.5,unit:"tsp"},
      {name:"heavy cream",qty:0.25,unit:"cups"},
    ],
    instructions:[
      "Sauté diced onion and garlic in butter and olive oil 5 min.",
      "Add tomatoes, sugar, salt and pepper. Simmer 15 min.",
      "Blend until smooth.",
      "Stir in cream, heat through and serve.",
    ]
  },
  {
    id:"r12", name:"Fried Rice", category:"cooking", time:20, servings:4,
    tags:["rice","quick","savory"],
    ingredients:[
      {name:"rice",qty:2,unit:"cups"},
      {name:"egg",qty:2,unit:""},
      {name:"soy sauce",qty:3,unit:"tbsp"},
      {name:"garlic",qty:2,unit:"cloves"},
      {name:"onion",qty:0.5,unit:""},
      {name:"vegetable oil",qty:2,unit:"tbsp"},
      {name:"frozen peas",qty:0.5,unit:"cups"},
    ],
    instructions:[
      "Use day-old cooked rice for best results.",
      "Heat oil in wok or large skillet over high heat.",
      "Scramble eggs, push to side. Add garlic and onion.",
      "Add rice, stir-fry 3–4 min. Add peas.",
      "Drizzle with soy sauce, toss and serve.",
    ]
  },
  {
    id:"r13", name:"Quesadillas", category:"cooking", time:15, servings:2,
    tags:["quick","savory","mexican"],
    ingredients:[
      {name:"tortilla",qty:4,unit:""},
      {name:"cheddar cheese",qty:1,unit:"cup"},
      {name:"butter",qty:1,unit:"tbsp"},
      {name:"black beans",qty:0.5,unit:"cups"},
      {name:"salsa",qty:0.5,unit:"cups"},
    ],
    instructions:[
      "Heat skillet over medium heat with butter.",
      "Place tortilla in skillet, add cheese and beans on half.",
      "Fold over, cook 2–3 min per side until golden.",
      "Slice and serve with salsa.",
    ]
  },
  {
    id:"r14", name:"Grilled Cheese", category:"cooking", time:10, servings:1,
    tags:["quick","sandwich","comfort"],
    ingredients:[
      {name:"bread",qty:2,unit:"slices"},
      {name:"cheddar cheese",qty:2,unit:"slices"},
      {name:"butter",qty:1,unit:"tbsp"},
    ],
    instructions:[
      "Butter one side of each bread slice.",
      "Place one slice butter-side down in skillet over medium heat.",
      "Add cheese, top with second slice butter-side up.",
      "Cook 3 min per side until golden and cheese is melted.",
    ]
  },
  {
    id:"r15", name:"Scrambled Eggs", category:"cooking", time:10, servings:2,
    tags:["breakfast","eggs","quick"],
    ingredients:[
      {name:"egg",qty:4,unit:""},
      {name:"butter",qty:1,unit:"tbsp"},
      {name:"milk",qty:2,unit:"tbsp"},
      {name:"salt",qty:0.25,unit:"tsp"},
      {name:"black pepper",qty:0.125,unit:"tsp"},
    ],
    instructions:[
      "Crack eggs into bowl, add milk, salt, and pepper. Beat well.",
      "Melt butter in skillet over medium-low heat.",
      "Pour in eggs. Gently push eggs across pan with spatula.",
      "Remove from heat while still slightly wet. Serve immediately.",
    ]
  },
  {
    id:"r16", name:"Overnight Oats", category:"cooking", time:5, servings:1,
    tags:["breakfast","oats","no-cook"],
    ingredients:[
      {name:"oats",qty:0.5,unit:"cups"},
      {name:"milk",qty:0.5,unit:"cups"},
      {name:"yogurt",qty:0.25,unit:"cups"},
      {name:"honey",qty:1,unit:"tbsp"},
      {name:"vanilla extract",qty:0.5,unit:"tsp"},
    ],
    instructions:[
      "Combine oats, milk, yogurt, honey, and vanilla in a jar or bowl.",
      "Stir well, cover, and refrigerate overnight.",
      "Top with fruit, nuts, or granola before serving.",
    ]
  },
  {
    id:"r17", name:"Avocado Toast", category:"cooking", time:5, servings:1,
    tags:["breakfast","quick","savory"],
    ingredients:[
      {name:"bread",qty:2,unit:"slices"},
      {name:"avocado",qty:1,unit:""},
      {name:"lemon juice",qty:1,unit:"tsp"},
      {name:"salt",qty:0.25,unit:"tsp"},
      {name:"black pepper",qty:0.125,unit:"tsp"},
      {name:"red pepper flakes",qty:0.125,unit:"tsp"},
    ],
    instructions:[
      "Toast bread until golden.",
      "Mash avocado with lemon juice, salt, and pepper.",
      "Spread on toast and top with red pepper flakes.",
    ]
  },
  {
    id:"r18", name:"Lemon Pound Cake", category:"baking", time:75, servings:10,
    tags:["cake","lemon","sweet"],
    ingredients:[
      {name:"flour",qty:1.5,unit:"cups"},
      {name:"butter",qty:0.75,unit:"cups"},
      {name:"sugar",qty:1,unit:"cup"},
      {name:"egg",qty:3,unit:""},
      {name:"lemon juice",qty:3,unit:"tbsp"},
      {name:"baking powder",qty:0.5,unit:"tsp"},
      {name:"salt",qty:0.5,unit:"tsp"},
      {name:"milk",qty:0.25,unit:"cups"},
    ],
    instructions:[
      "Preheat oven to 350°F. Grease a 9×5 loaf pan.",
      "Cream butter and sugar until light and fluffy.",
      "Beat in eggs one at a time, then lemon juice.",
      "Fold in flour, baking powder, and salt, alternating with milk.",
      "Pour into pan and bake 55–65 min.",
    ]
  },
  {
    id:"r19", name:"Chicken Stir-Fry", category:"cooking", time:25, servings:4,
    tags:["stir-fry","chicken","savory"],
    ingredients:[
      {name:"chicken breast",qty:2,unit:""},
      {name:"soy sauce",qty:3,unit:"tbsp"},
      {name:"garlic",qty:3,unit:"cloves"},
      {name:"vegetable oil",qty:2,unit:"tbsp"},
      {name:"broccoli",qty:2,unit:"cups"},
      {name:"bell pepper",qty:1,unit:""},
      {name:"onion",qty:1,unit:""},
      {name:"cornstarch",qty:1,unit:"tbsp"},
    ],
    instructions:[
      "Slice chicken thinly. Toss with cornstarch and 1 tbsp soy sauce.",
      "Heat oil in wok over high heat. Cook chicken 4–5 min, set aside.",
      "Add garlic, then vegetables. Stir-fry 3–4 min.",
      "Return chicken, add remaining soy sauce. Toss and serve over rice.",
    ]
  },
  {
    id:"r20", name:"Simple Focaccia", category:"baking", time:120, servings:8,
    tags:["bread","italian","savory"],
    ingredients:[
      {name:"flour",qty:4,unit:"cups"},
      {name:"yeast",qty:2.25,unit:"tsp"},
      {name:"salt",qty:2,unit:"tsp"},
      {name:"olive oil",qty:0.33,unit:"cups"},
      {name:"water",qty:1.5,unit:"cups"},
      {name:"rosemary",qty:2,unit:"tbsp"},
    ],
    instructions:[
      "Mix flour, yeast, and salt. Add water and 3 tbsp olive oil. Knead 8 min.",
      "Let rise 1 hour until doubled.",
      "Press into oiled 13×18 pan. Dimple surface with fingers.",
      "Drizzle with remaining olive oil, top with rosemary and flaky salt.",
      "Rest 30 min, then bake at 450°F for 20–25 min.",
    ]
  },
  {
    id:"r21", name:"Peanut Butter Cookies", category:"baking", time:25, servings:24,
    tags:["cookies","peanut butter","sweet"],
    ingredients:[
      {name:"peanut butter",qty:1,unit:"cup"},
      {name:"sugar",qty:1,unit:"cup"},
      {name:"egg",qty:1,unit:""},
      {name:"vanilla extract",qty:1,unit:"tsp"},
      {name:"baking soda",qty:0.5,unit:"tsp"},
    ],
    instructions:[
      "Preheat oven to 350°F.",
      "Mix all ingredients together until well combined.",
      "Roll into 1-inch balls, place on ungreased baking sheet.",
      "Flatten with fork in criss-cross pattern.",
      "Bake 10–12 min until just golden. Cool on pan 5 min.",
    ]
  },
  {
    id:"r22", name:"Smoothie Bowl", category:"cooking", time:5, servings:1,
    tags:["breakfast","healthy","no-cook"],
    ingredients:[
      {name:"banana",qty:2,unit:"frozen"},
      {name:"milk",qty:0.25,unit:"cups"},
      {name:"honey",qty:1,unit:"tbsp"},
      {name:"yogurt",qty:0.5,unit:"cups"},
      {name:"oats",qty:0.25,unit:"cups"},
    ],
    instructions:[
      "Blend frozen banana, milk, yogurt, and honey until thick and smooth.",
      "Pour into bowl.",
      "Top with oats, fresh fruit, seeds, or granola.",
    ]
  },
  {
    id:"r23", name:"Pasta Carbonara", category:"cooking", time:25, servings:4,
    tags:["pasta","italian","savory"],
    ingredients:[
      {name:"pasta",qty:400,unit:"g"},
      {name:"egg",qty:4,unit:""},
      {name:"parmesan",qty:1,unit:"cup"},
      {name:"black pepper",qty:1,unit:"tsp"},
      {name:"salt",qty:1,unit:"tsp"},
      {name:"bacon",qty:200,unit:"g"},
    ],
    instructions:[
      "Cook pasta until al dente. Reserve 1 cup pasta water.",
      "Crisp bacon in large pan. Remove pan from heat.",
      "Whisk eggs and parmesan together.",
      "Toss hot pasta with bacon fat, then egg mixture, adding pasta water slowly.",
      "Season with lots of black pepper.",
    ]
  },
];

// ── Substitution Database ─────────────────────────────────────────────────────
const SUBSTITUTES = {
  "butter": [
    { sub: "coconut oil", ratio: "1:1", notes: "Works well in baking; adds subtle coconut flavor" },
    { sub: "vegetable oil", ratio: "7/8 cup per cup", notes: "Use for moist baked goods" },
    { sub: "applesauce", ratio: "1:1", notes: "Reduces fat; adds moisture and sweetness" },
    { sub: "greek yogurt", ratio: "1:1", notes: "Great for muffins and quick breads" },
  ],
  "eggs": [
    { sub: "flax egg", ratio: "1 tbsp flaxseed + 3 tbsp water per egg", notes: "Let sit 5 min; best for binding" },
    { sub: "applesauce", ratio: "1/4 cup per egg", notes: "Adds moisture; best in sweet recipes" },
    { sub: "banana", ratio: "1/4 cup mashed per egg", notes: "Adds flavor and moisture" },
    { sub: "aquafaba", ratio: "3 tbsp per egg", notes: "Chickpea liquid; great for meringues" },
  ],
  "egg": [
    { sub: "flax egg", ratio: "1 tbsp flaxseed + 3 tbsp water", notes: "Let sit 5 min; best for binding" },
    { sub: "applesauce", ratio: "1/4 cup", notes: "Adds moisture; best in sweet recipes" },
    { sub: "banana", ratio: "1/4 cup mashed", notes: "Adds flavor and moisture" },
    { sub: "aquafaba", ratio: "3 tbsp", notes: "Chickpea liquid; great for meringues" },
  ],
  "buttermilk": [
    { sub: "milk + vinegar", ratio: "1 cup milk + 1 tbsp vinegar", notes: "Let sit 5 min before using" },
    { sub: "milk + lemon juice", ratio: "1 cup milk + 1 tbsp lemon juice", notes: "Let sit 5 min" },
    { sub: "yogurt", ratio: "3/4 cup yogurt + 1/4 cup water", notes: "Thin with water to right consistency" },
    { sub: "sour cream", ratio: "3/4 cup + 1/4 cup water", notes: "Thin with water" },
  ],
  "flour": [
    { sub: "almond flour", ratio: "1:1 with adjustments", notes: "Denser; use less baking soda" },
    { sub: "oat flour", ratio: "1:1", notes: "Blend oats into powder; slightly denser result" },
    { sub: "rice flour", ratio: "7/8 cup per cup", notes: "Good for GF baking" },
    { sub: "cake flour", ratio: "1 cup + 2 tbsp per cup all-purpose", notes: "More delicate texture" },
  ],
  "milk": [
    { sub: "oat milk", ratio: "1:1", notes: "Closest to dairy milk in baking" },
    { sub: "almond milk", ratio: "1:1", notes: "Lighter; slightly nutty flavor" },
    { sub: "coconut milk", ratio: "1:1", notes: "Richer; adds coconut flavor" },
    { sub: "water", ratio: "1:1", notes: "Works in a pinch; loses richness" },
  ],
  "sugar": [
    { sub: "honey", ratio: "3/4 cup per cup", notes: "Reduce other liquids by 1/4 cup" },
    { sub: "maple syrup", ratio: "3/4 cup per cup", notes: "Reduce other liquids; adds maple flavor" },
    { sub: "brown sugar", ratio: "1:1", notes: "Adds molasses flavor and moisture" },
    { sub: "coconut sugar", ratio: "1:1", notes: "Similar sweetness; slightly caramel flavor" },
  ],
  "brown sugar": [
    { sub: "white sugar + molasses", ratio: "1 cup sugar + 1 tbsp molasses", notes: "Mix thoroughly" },
    { sub: "coconut sugar", ratio: "1:1", notes: "Slightly less sweet; caramel-like flavor" },
    { sub: "white sugar", ratio: "1:1", notes: "Will lack molasses depth" },
  ],
  "baking powder": [
    { sub: "baking soda + cream of tartar", ratio: "1/4 tsp baking soda + 1/2 tsp cream of tartar per tsp", notes: "Use immediately" },
    { sub: "baking soda + lemon juice", ratio: "1/4 tsp baking soda + 1/2 tsp lemon juice per tsp", notes: "" },
  ],
  "baking soda": [
    { sub: "baking powder", ratio: "3 tsp per 1 tsp baking soda", notes: "Use 3× the amount" },
  ],
  "vanilla extract": [
    { sub: "vanilla bean paste", ratio: "1:1", notes: "More intense vanilla flavor" },
    { sub: "maple syrup", ratio: "1:1", notes: "Adds sweetness and different flavor" },
    { sub: "almond extract", ratio: "1/2:1", notes: "Use half the amount; stronger flavor" },
  ],
  "heavy cream": [
    { sub: "milk + butter", ratio: "3/4 cup milk + 1/4 cup butter per cup", notes: "Melt butter, mix with milk" },
    { sub: "coconut cream", ratio: "1:1", notes: "Full-fat canned coconut milk, skimmed" },
    { sub: "evaporated milk", ratio: "1:1", notes: "Not whippable, but works in sauces" },
  ],
  "vegetable oil": [
    { sub: "canola oil", ratio: "1:1", notes: "Nearly identical" },
    { sub: "melted coconut oil", ratio: "1:1", notes: "Slight coconut flavor" },
    { sub: "melted butter", ratio: "1:1", notes: "Richer flavor" },
    { sub: "applesauce", ratio: "1:1", notes: "For baking; reduces fat" },
  ],
  "olive oil": [
    { sub: "vegetable oil", ratio: "1:1", notes: "Neutral flavor" },
    { sub: "canola oil", ratio: "1:1", notes: "Neutral flavor" },
    { sub: "avocado oil", ratio: "1:1", notes: "High smoke point; mild flavor" },
  ],
  "lemon juice": [
    { sub: "lime juice", ratio: "1:1", notes: "Similar acidity, slightly different flavor" },
    { sub: "white vinegar", ratio: "1/2 tsp per tsp lemon", notes: "More acidic; use less" },
    { sub: "orange juice", ratio: "1:1", notes: "Less acidic; sweeter" },
  ],
  "sour cream": [
    { sub: "greek yogurt", ratio: "1:1", notes: "Best substitute; similar tang" },
    { sub: "cream cheese", ratio: "1:1", notes: "Mix with a little milk to thin" },
    { sub: "creme fraiche", ratio: "1:1", notes: "Richer and less tangy" },
  ],
  "yogurt": [
    { sub: "sour cream", ratio: "1:1", notes: "Slightly richer" },
    { sub: "buttermilk", ratio: "1:1", notes: "Thinner consistency" },
    { sub: "cream cheese", ratio: "1:1", notes: "Thicker; thin with milk if needed" },
  ],
  "honey": [
    { sub: "maple syrup", ratio: "1:1", notes: "Slightly different flavor" },
    { sub: "agave syrup", ratio: "1:1", notes: "Neutral flavor; slightly sweeter" },
    { sub: "sugar", ratio: "1.25 cups per cup honey", notes: "Add 1/4 cup liquid per cup of sugar" },
  ],
  "cornstarch": [
    { sub: "arrowroot powder", ratio: "1:1", notes: "Works in most applications" },
    { sub: "potato starch", ratio: "1:1", notes: "Good for frying and thickening" },
    { sub: "all-purpose flour", ratio: "2 tbsp per 1 tbsp cornstarch", notes: "Use double the amount" },
  ],
  "cocoa powder": [
    { sub: "dark chocolate", ratio: "3 tbsp melted per tbsp cocoa + reduce fat by 1 tbsp", notes: "Rich substitute" },
    { sub: "carob powder", ratio: "1:1", notes: "Naturally sweeter; different flavor" },
  ],
  "cream cheese": [
    { sub: "ricotta cheese", ratio: "1:1", notes: "Blend smooth first" },
    { sub: "mascarpone", ratio: "1:1", notes: "Richer; less tangy" },
    { sub: "greek yogurt (strained)", ratio: "1:1", notes: "More tang; works for cheesecake" },
  ],
  "garlic": [
    { sub: "garlic powder", ratio: "1/4 tsp per clove", notes: "Dried powder" },
    { sub: "garlic flakes", ratio: "1/2 tsp per clove", notes: "Rehydrate in water" },
    { sub: "shallots", ratio: "1 shallot per 2 cloves", notes: "Milder, sweet flavor" },
  ],
  "onion": [
    { sub: "onion powder", ratio: "1/4 tsp per 1/4 cup onion", notes: "Use in cooked dishes" },
    { sub: "shallots", ratio: "1:1", notes: "Milder; use same amount" },
    { sub: "leeks", ratio: "1:1", notes: "Milder flavor" },
  ],
  "maple syrup": [
    { sub: "honey", ratio: "1:1", notes: "Slightly sweeter; different flavor" },
    { sub: "agave syrup", ratio: "1:1", notes: "Neutral sweet flavor" },
    { sub: "simple syrup", ratio: "1:1", notes: "Equal parts sugar + water, heated" },
  ],
  "oats": [
    { sub: "quinoa flakes", ratio: "1:1", notes: "GF option; similar texture" },
    { sub: "buckwheat groats", ratio: "1:1", notes: "More nutritious; different flavor" },
  ],
  "bread crumbs": [
    { sub: "crushed crackers", ratio: "1:1", notes: "Ritz or saltines work well" },
    { sub: "rolled oats", ratio: "1:1", notes: "For meatballs or meatloaf" },
    { sub: "panko", ratio: "1:1", notes: "Lighter, crispier texture" },
  ],
};
