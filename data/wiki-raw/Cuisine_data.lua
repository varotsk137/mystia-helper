return {
    -- Base game
    ["BaseGame"] = {
        "Dark Matter", "Seafood Miso Soup", "Grilled Lamprey", "Fresh Tofu", "Rice Ball", "Boiled Tofu", "Secret Dried Fish Crisps", "Dew Runny Eggs",
        "Stinky Tofu", "Roasted Mushroom", "Pork Bowl", "Fried Cicada Sloughs", "Potato Croquettes", "Cubic Kedama Ice Cream", "Cubic Kedama Volcanic Tofu",
        "Scarlet Devil Cake", "Unconscious Youkai Mousse", "Tonkotsu Ramen", "Pork & Trout Kebab", "Udumbara Cake", "Deep Fried Tofu", "Miso Tofu",
        "Fried Lampreys", "Tofu Stew", "Power Soup", "Scholar's Ginkgo", "Beef Bowl", "Vegetable Salad", "Pork Rice Ball", "Imitation Bear Paw", "Shirayuki",
        "Pink Rice Ball", "Carved Rose Salad", "Hodgepodge", "Fried Pork Cutlet", "Pork Stir Fry", "Daimyo's Feast", "Energy Skewer", "Peach Tapioca",
        "Falling Blossoms", "Niten Ichiryu", "Peach & Shrimp Salad", "Tangyuan", "Dumplings", "Scone", "Salmon Steak", "Pancakes with Syrup",
        "Hunter's Casserole", "Kabayaki Lampreys", "Classic Steak", "Real・Seafood Miso Soup", "Eggs Benedict", "Golden Ribs Soup", "Cantonese Char Siu",
        "Sashimi Platter", "Italian Risotto", "Rainbow Pan-fried Pork Buns", "Creamy Vegetable Chowder", "Pork & Bamboo Shoots Stir Fry", "Mochi",
        "Beef Wellington", "Ino-Shika-Chou", "Flowing Somen", "Peach Yatsuhashi", "Kaguya-hime", "Immortal Turkey", "Steamed Egg & Bamboo Shoots",
        "Mapo Tofu", "Lunar Dango", "Lunar Lover Biscuits", "Sichuan Boiled Fish", "Hourai Branch", "Fuji's Lava"
    },

    ["Dark Matter"] = {
        ["lv"] = 1,
        ["cost"] = 1,
        ["props"] = {"Dark Matter"},
        ["xprops"] = {},
        ["ingredients"] = {},
        ["kitchenware"] = "Any",
        ["cook_time"] = 0.0,
    },

    ["Seafood Miso Soup"] = {
        ["lv"] = 1,
        ["cost"] = 8,
        ["props"] = {"Economical", "Homecooking", "Soup", "Vegetarian"},
        ["xprops"] = {"Greasy"},
        ["ingredients"] = {"Seaweed"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 3.6
    },

    ["Grilled Lamprey"] = {
        ["lv"] = 2,
        ["cost"] = 22,
        ["props"] = {"Aquatic", "Grilled", "Signature"},
        ["xprops"] = {"Meat", "Vegetarian"},
        ["ingredients"] = {"Lamprey"},
        ["kitchenware"] = "Grill",
        ["cook_time"] = 4.2
    },

    ["Fresh Tofu"] = {
        ["lv"] = 2,
        ["cost"] = 21,
        ["props"] = {"Good w/ Alcohol", "Homecooking", "Mild", "Small Portion", "Vegetarian"},
        ["xprops"] = {},
        ["ingredients"] = {"Radish", "Tofu"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 3.0
    },

    ["Rice Ball"] = {
        ["lv"] = 1,
        ["cost"] = 6,
        ["props"] = {"Economical", "Filling", "Homecooking", "Japanese", "Vegetarian"},
        ["xprops"] = {},
        ["ingredients"] = {"Seaweed"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 3.0
    },

    ["Boiled Tofu"] = {
        ["lv"] = 1,
        ["cost"] = 22,
        ["props"] = {"Homecooking", "Mild", "Vegetarian"},
        ["xprops"] = {},
        ["ingredients"] = {"Tofu"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 4.2
    },

    ["Secret Dried Fish Crisps"] = {
        ["lv"] = 2,
        ["cost"] = 30,
        ["props"] = {"Aquatic", "Salty", "Fresh", "Small Portion"},
        ["xprops"] = {},
        ["ingredients"] = {"Trout"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 4.8
    },

    ["Dew Runny Eggs"] = {
        ["lv"] = 2,
        ["cost"] = 18,
        ["props"] = {"Economical", "Mild", "Raw"},
        ["xprops"] = {"Aquatic", "Greasy", "Meat"},
        ["ingredients"] = {"Dew", "Egg"},
        ["kitchenware"] = "Steamer",
        ["cook_time"] = 1.8
    },

    ["Stinky Tofu"] = {
        ["lv"] = 1,
        ["cost"] = 24,
        ["props"] = {"Chinese", "Spicy", "Peculiar", "Vegetarian"},
        ["xprops"] = {"Fruity", "Sweet"},
        ["ingredients"] = {"Tofu", "Chili"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 3.0
    },

    ["Roasted Mushroom"] = {
        ["lv"] = 1,
        ["cost"] = 18,
        ["props"] = {"Grilled", "Economical", "Fungus", "Hot", "Salty", "Vegetarian"},
        ["xprops"] = {},
        ["ingredients"] = {"Mushroom"},
        ["kitchenware"] = "Grill",
        ["cook_time"] = 3.6
    },

    ["Pork Bowl"] = {
        ["lv"] = 2,
        ["cost"] = 20,
        ["props"] = {"Filling", "Homecooking", "Meat"},
        ["xprops"] = {},
        ["ingredients"] = {"Pork"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 4.2
    },

    ["Fried Cicada Sloughs"] = {
        ["lv"] = 1,
        ["cost"] = 19,
        ["props"] = {"Economical", "Greasy", "Peculiar"},
        ["xprops"] = {},
        ["ingredients"] = {"Cicada Slough"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 4.8
    },

    ["Potato Croquettes"] = {
        ["lv"] = 1,
        ["cost"] = 22,
        ["props"] = {"Greasy", "Homecooking", "Vegetarian"},
        ["xprops"] = {"Refreshing"},
        ["ingredients"] = {"Potato"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 3.6
    },

    ["Cubic Kedama Ice Cream"] = {
        ["lv"] = 3,
        ["cost"] = 75,
        ["props"] = {"Refreshing", "Dreamy", "Expensive", "Photogenic", "Sweet", "Western"},
        ["xprops"] = {},
        ["ingredients"] = {"Dew", "Tofu", "Honey", "Egg"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 4.8
    },

    ["Cubic Kedama Volcanic Tofu"] = {
        ["lv"] = 3,
        ["cost"] = 85,
        ["props"] = {"Chinese", "Expensive", "Photogenic", "Fresh", "Vegetarian", "Wonderful"},
        ["xprops"] = {},
        ["ingredients"] = {"Tofu", "Chili", "Beef", "Onion"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 4.8
    },

    ["Scarlet Devil Cake"] = {
        ["lv"] = 3,
        ["cost"] = 60,
        ["props"] = {"Dreamy", "Photogenic", "Peculiar", "Sweet", "Western"},
        ["xprops"] = {},
        ["ingredients"] = {"Dew", "Pumpkin", "Potato", "Honey"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 4.8
    },

    ["Unconscious Youkai Mousse"] = {
        ["lv"] = 3,
        ["cost"] = 60,
        ["props"] = {"Dreamy", "Photogenic", "Premium", "Sweet", "Western"},
        ["xprops"] = {},
        ["ingredients"] = {"Tofu", "Butter", "Honey", "Onion"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 4.8
    },

    ["Tonkotsu Ramen"] = {
        ["lv"] = 3,
        ["cost"] = 60,
        ["props"] = {"Filling", "Homecooking", "Meat", "Salty"},
        ["xprops"] = {},
        ["ingredients"] = {"Pork", "Egg", "Seaweed"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 4.8
    },

    ["Pork & Trout Kebab"] = {
        ["lv"] = 2,
        ["cost"] = 26,
        ["props"] = {"Aquatic", "Grilled", "Homecooking", "Meat"},
        ["xprops"] = {},
        ["ingredients"] = {"Trout", "Pork"},
        ["kitchenware"] = "Grill",
        ["cook_time"] = 4.2
    },

    ["Udumbara Cake"] = {
        ["lv"] = 3,
        ["cost"] = 78,
        ["props"] = {"Dreamy", "Expensive", "Legendary", "Photogenic", "Premium", "Sweet"},
        ["xprops"] = {"Aquatic", "Meat"},
        ["ingredients"] = {"Udumbara", "Dew"},
        ["kitchenware"] = "Steamer",
        ["cook_time"] = 4.2
    },

    ["Deep Fried Tofu"] = {
        ["lv"] = 1,
        ["cost"] = 16,
        ["props"] = {"Economical", "Greasy", "Homecooking", "Japanese", "Vegetarian"},
        ["xprops"] = {},
        ["ingredients"] = {"Tofu"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 4.2
    },

    ["Miso Tofu"] = {
        ["lv"] = 2,
        ["cost"] = 21,
        ["props"] = {"Homecooking", "Japanese", "Mild", "Soup", "Vegetarian"},
        ["xprops"] = {"Greasy"},
        ["ingredients"] = {"Tofu"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 4.2
    },

    ["Fried Lampreys"] = {
        ["lv"] = 2,
        ["cost"] = 27,
        ["props"] = {"Aquatic", "Greasy", "Signature"},
        ["xprops"] = {"Refreshing"},
        ["ingredients"] = {"Lamprey"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 4.2
    },

    ["Tofu Stew"] = {
        ["lv"] = 1,
        ["cost"] = 19,
        ["props"] = {"Economical", "Hot", "Japanese", "Mild", "Vegetarian"},
        ["xprops"] = {},
        ["ingredients"] = {"Tofu"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 3.0
    },

    ["Power Soup"] = {
        ["lv"] = 3,
        ["cost"] = 34,
        ["props"] = {"Hot", "Meat", "Mountain Delicacy", "Soup", "Strength-Boosting"},
        ["xprops"] = {"Refreshing", "Small Portion"},
        ["ingredients"] = {"Seaweed", "Boar Meat"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 7.2
    },

    ["Scholar's Ginkgo"] = {
        ["lv"] = 3,
        ["cost"] = 60,
        ["props"] = {"Chinese", "Cultural Heritage", "Sweet", "Vegetarian"},
        ["xprops"] = {"Salty"},
        ["ingredients"] = {"Ginkgo Nut", "Honey"},
        ["kitchenware"] = "Steamer",
        ["cook_time"] = 4.8
    },

    ["Beef Bowl"] = {
        ["lv"] = 2,
        ["cost"] = 20,
        ["props"] = {"Filling", "Homecooking", "Meat"},
        ["xprops"] = {},
        ["ingredients"] = {"Beef"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 4.2
    },

    ["Vegetable Salad"] = {
        ["lv"] = 3,
        ["cost"] = 56,
        ["props"] = {"Refreshing", "Mild", "Raw", "Vegetarian"},
        ["xprops"] = {"Aquatic", "Hot", "Meat"},
        ["ingredients"] = {"Potato", "Onion", "Pumpkin"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 3.0
    },

    ["Pork Rice Ball"] = {
        ["lv"] = 2,
        ["cost"] = 14,
        ["props"] = {"Economical", "Filling", "Homecooking", "Japanese", "Meat"},
        ["xprops"] = {},
        ["ingredients"] = {"Pork"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 3.6
    },

    ["Imitation Bear Paw"] = {
        ["lv"] = 3,
        ["cost"] = 70,
        ["props"] = {"Aquatic", "Expensive", "Meat", "Mountain Delicacy", "Premium", "Fresh", "Strength-Boosting", "Wonderful"},
        ["xprops"] = {},
        ["ingredients"] = {"Iberico Pork", "Bamboo Shoot", "Pufferfish"},
        ["kitchenware"] = "Steamer",
        ["cook_time"] = 7.2
    },

    ["Shirayuki"] = {
        ["lv"] = 4,
        ["cost"] = 98,
        ["props"] = {"Aquatic", "Cultural Heritage", "Expensive", "Japanese", "Meat", "Premium"},
        ["xprops"] = {},
        ["ingredients"] = {"Pufferfish", "Lamprey", "Seaweed"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 7.2
    },

    ["Pink Rice Ball"] = {
        ["lv"] = 3,
        ["cost"] = 30,
        ["props"] = {"Aquatic", "Filling", "Homecooking", "Hot", "Japanese", "Vegetarian"},
        ["xprops"] = {},
        ["ingredients"] = {"Onion", "Trout"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 4.8
    },

    ["Carved Rose Salad"] = {
        ["lv"] = 1,
        ["cost"] = 20,
        ["props"] = {"Refreshing", "Mild", "Photogenic", "Vegetarian"},
        ["xprops"] = {"Hot", "Meat"},
        ["ingredients"] = {"Radish"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 3.0
    },

    ["Hodgepodge"] = {
        ["lv"] = 2,
        ["cost"] = 40,
        ["props"] = {"Homecooking", "Hot", "Meat", "Fresh"},
        ["xprops"] = {},
        ["ingredients"] = {"Seaweed", "Trout", "Tofu"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 3.0
    },

    ["Fried Pork Cutlet"] = {
        ["lv"] = 2,
        ["cost"] = 25,
        ["props"] = {"Filling", "Greasy", "Homecooking", "Meat"},
        ["xprops"] = {},
        ["ingredients"] = {"Pork"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 4.2
    },

    ["Pork Stir Fry"] = {
        ["lv"] = 1,
        ["cost"] = 15,
        ["props"] = {"Economical", "Chinese", "Good w/ Alcohol", "Greasy", "Homecooking", "Meat"},
        ["xprops"] = {},
        ["ingredients"] = {"Pork"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 4.8
    },

    ["Daimyo's Feast"] = {
        ["lv"] = 3,
        ["cost"] = 105,
        ["props"] = {"Aquatic", "Expensive", "Filling", "Meat", "Mountain Delicacy", "Premium"},
        ["xprops"] = {},
        ["ingredients"] = {"Iberico Pork", "Wagyu Beef", "Pufferfish"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 6.0
    },

    ["Energy Skewer"] = {
        ["lv"] = 3,
        ["cost"] = 50,
        ["props"] = {"Grilled", "Filling", "Meat"},
        ["xprops"] = {},
        ["ingredients"] = {"Beef", "Onion", "Pumpkin"},
        ["kitchenware"] = "Grill",
        ["cook_time"] = 7.2
    },

    ["Peach Tapioca"] = {
        ["lv"] = 2,
        ["cost"] = 55,
        ["props"] = {"Refreshing", "Fruity", "Photogenic", "Soup", "Sweet", "Vegetarian"},
        ["xprops"] = {},
        ["ingredients"] = {"Peach", "Ice Cube", "Dew"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 4.2
    },

    ["Falling Blossoms"] = {
        ["lv"] = 4,
        ["cost"] = 50,
        ["props"] = {"Aquatic", "Japanese", "Photogenic", "Premium", "Raw", "Sea Delicacy", "Small Portion"},
        ["xprops"] = {},
        ["ingredients"] = {"Premium Tuna"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 7.2
    },

    ["Niten Ichiryu"] = {
        ["lv"] = 4,
        ["cost"] = 90,
        ["props"] = {"Aura-Bursting", "Grilled", "Cultural Heritage", "Expensive", "Meat", "Mountain Delicacy", "Premium"},
        ["xprops"] = {"Homecooking"},
        ["ingredients"] = {"Iberico Pork", "Boar Meat"},
        ["kitchenware"] = "Grill",
        ["cook_time"] = 10.8
    },

    ["Peach & Shrimp Salad"] = {
        ["lv"] = 2,
        ["cost"] = 25,
        ["props"] = {"Aquatic", "Fruity", "Mild", "Photogenic", "Sweet", "Vegetarian", "Wonderful"},
        ["xprops"] = {"Meat", "Salty"},
        ["ingredients"] = {"Peach", "Ice Cube", "Shrimp"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 6.0
    },

    ["Tangyuan"] = {
        ["lv"] = 2,
        ["cost"] = 35,
        ["props"] = {"Chinese", "Cultural Heritage", "Homecooking", "Vegetarian"},
        ["xprops"] = {},
        ["ingredients"] = {"Sticky Rice"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 3.0
    },

    ["Dumplings"] = {
        ["lv"] = 2,
        ["cost"] = 35,
        ["props"] = {"Chinese", "Cultural Heritage", "Homecooking", "Vegetarian"},
        ["xprops"] = {},
        ["ingredients"] = {"Flour"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 3.0
    },

    ["Scone"] = {
        ["lv"] = 1,
        ["cost"] = 8,
        ["props"] = {"Economical", "Filling", "Western"},
        ["xprops"] = {},
        ["ingredients"] = {"Butter", "Flour"},
        ["kitchenware"] = "Steamer",
        ["cook_time"] = 4.2
    },

    ["Salmon Steak"] = {
        ["lv"] = 3,
        ["cost"] = 58,
        ["props"] = {"Meat", "Fresh", "Western"},
        ["xprops"] = {},
        ["ingredients"] = {"Salmon", "Bamboo Shoot"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 6.0
    },

    ["Pancakes with Syrup"] = {
        ["lv"] = 2,
        ["cost"] = 22,
        ["props"] = {"Filling", "Sweet", "Western"},
        ["xprops"] = {},
        ["ingredients"] = {"Honey", "Flour", "Egg"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 5.4
    },

    ["Hunter's Casserole"] = {
        ["lv"] = 4,
        ["cost"] = 66,
        ["props"] = {"Expensive", "Filling", "Greasy", "Hot", "Meat", "Mountain Delicacy"},
        ["xprops"] = {},
        ["ingredients"] = {"Potato", "Pumpkin", "Iberico Pork"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 4.8
    },

    ["Kabayaki Lampreys"] = {
        ["lv"] = 3,
        ["cost"] = 42,
        ["props"] = {"Aquatic", "Greasy", "Fresh", "Signature", "Vegetarian"},
        ["xprops"] = {},
        ["ingredients"] = {"Onion", "Lamprey"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 4.8
    },

    ["Classic Steak"] = {
        ["lv"] = 2,
        ["cost"] = 60,
        ["props"] = {"Filling", "Greasy", "Meat", "Western"},
        ["xprops"] = {"Refreshing", "Sweet"},
        ["ingredients"] = {"Wagyu Beef", "Butter"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 4.2
    },

    ["Real・Seafood Miso Soup"] = {
        ["lv"] = 2,
        ["cost"] = 55,
        ["props"] = {"Aquatic", "Homecooking", "Mild", "Soup"},
        ["xprops"] = {},
        ["ingredients"] = {"Salmon", "Trout"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 4.8
    },

    ["Eggs Benedict"] = {
        ["lv"] = 2,
        ["cost"] = 35,
        ["props"] = {"Filling", "Raw", "Small Portion", "Western"},
        ["xprops"] = {"Fruity", "Sweet"},
        ["ingredients"] = {"Egg", "Bamboo Shoot", "Butter", "Flour"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 4.2
    },

    ["Golden Ribs Soup"] = {
        ["lv"] = 2,
        ["cost"] = 65,
        ["props"] = {"Chinese", "Expensive", "Hot", "Meat", "Soup"},
        ["xprops"] = {},
        ["ingredients"] = {"Ginkgo Nut", "Radish", "Pork"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 3.6
    },

    ["Cantonese Char Siu"] = {
        ["lv"] = 3,
        ["cost"] = 70,
        ["props"] = {"Chinese", "Expensive", "Greasy", "Meat", "Sweet", "Wonderful"},
        ["xprops"] = {},
        ["ingredients"] = {"Pork", "Honey"},
        ["kitchenware"] = "Grill",
        ["cook_time"] = 4.2
    },

    ["Sashimi Platter"] = {
        ["lv"] = 3,
        ["cost"] = 88,
        ["props"] = {"Aquatic", "Expensive", "Japanese", "Photogenic", "Premium", "Raw"},
        ["xprops"] = {"Hot"},
        ["ingredients"] = {"Salmon", "Tuna"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 3.0
    },

    ["Italian Risotto"] = {
        ["lv"] = 2,
        ["cost"] = 70,
        ["props"] = {"Expensive", "Filling", "Fungus", "Fresh", "Western"},
        ["xprops"] = {"Sweet"},
        ["ingredients"] = {"Onion", "Mushroom", "Bamboo Shoot", "Butter"},
        ["kitchenware"] = "Steamer",
        ["cook_time"] = 3.6
    },

    ["Rainbow Pan-fried Pork Buns"] = {
        ["lv"] = 4,
        ["cost"] = 128,
        ["props"] = {"Chinese", "Dreamy", "Expensive", "Fungus", "Legendary", "Meat", "Premium"},
        ["xprops"] = {},
        ["ingredients"] = {"Mushroom", "Iberico Pork"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 4.8
    },

    ["Creamy Vegetable Chowder"] = {
        ["lv"] = 2,
        ["cost"] = 20,
        ["props"] = {"Fungus", "Soup", "Vegetarian", "Western"},
        ["xprops"] = {},
        ["ingredients"] = {"Mushroom", "Onion", "Butter"},
        ["kitchenware"] = "Steamer",
        ["cook_time"] = 5.4
    },

    ["Pork & Bamboo Shoots Stir Fry"] = {
        ["lv"] = 2,
        ["cost"] = 25,
        ["props"] = {"Good w/ Alcohol", "Homecooking", "Meat"},
        ["xprops"] = {},
        ["ingredients"] = {"Bamboo Shoot", "Pork"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 6.0
    },

    ["Mochi"] = {
        ["lv"] = 2,
        ["cost"] = 30,
        ["props"] = {"Japanese", "Small Portion", "Sweet"},
        ["xprops"] = {"Aquatic", "Meat", "Salty", "Fresh"},
        ["ingredients"] = {"Sticky Rice"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 4.2
    },

    ["Beef Wellington"] = {
        ["lv"] = 4,
        ["cost"] = 150,
        ["props"] = {"Expensive", "Legendary", "Meat", "Mountain Delicacy", "Premium", "Western"},
        ["xprops"] = {"Refreshing", "Sweet"},
        ["ingredients"] = {"Wagyu Beef", "Flour", "Egg", "Butter", "Truffle"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 8.4
    },

    ["Ino-Shika-Chou"] = {
        ["lv"] = 3,
        ["cost"] = 78,
        ["props"] = {"Cultural Heritage", "Expensive", "Meat", "Photogenic", "Premium"},
        ["xprops"] = {},
        ["ingredients"] = {"Boar Meat", "Venison", "Lunar Herb"},
        ["kitchenware"] = "Steamer",
        ["cook_time"] = 4.8
    },

    ["Flowing Somen"] = {
        ["lv"] = 3,
        ["cost"] = 40,
        ["props"] = {"Refreshing", "Mild", "Vegetarian", "Wonderful"},
        ["xprops"] = {"Greasy"},
        ["ingredients"] = {"Flour", "Bamboo"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 4.2
    },

    ["Peach Yatsuhashi"] = {
        ["lv"] = 2,
        ["cost"] = 55,
        ["props"] = {"Fruity", "Japanese", "Sweet"},
        ["xprops"] = {"Aquatic", "Meat", "Salty", "Fresh"},
        ["ingredients"] = {"Sticky Rice", "Peach"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 3.0
    },

    ["Kaguya-hime"] = {
        ["lv"] = 4,
        ["cost"] = 65,
        ["props"] = {"Cultural Heritage", "Expensive", "Japanese", "Legendary", "Meat", "Photogenic", "Premium", "Specialty"},
        ["xprops"] = {},
        ["ingredients"] = {"Bamboo", "Bamboo Shoot", "Truffle", "Ginkgo Nut", "Iberico Pork"},
        ["kitchenware"] = "Steamer",
        ["cook_time"] = 7.2
    },

    ["Immortal Turkey"] = {
        ["lv"] = 4,
        ["cost"] = 65,
        ["props"] = {"Aura-Bursting", "Grilled", "Expensive", "Legendary", "Photogenic", "Premium", "Western"},
        ["xprops"] = {},
        ["ingredients"] = {"Flour", "Honey", "Potato", "Onion", "Radish"},
        ["kitchenware"] = "Grill",
        ["cook_time"] = 7.2
    },

    ["Steamed Egg & Bamboo Shoots"] = {
        ["lv"] = 2,
        ["cost"] = 40,
        ["props"] = {"Fungus", "Homecooking", "Mild"},
        ["xprops"] = {},
        ["ingredients"] = {"Bamboo", "Egg", "Seaweed", "Mushroom"},
        ["kitchenware"] = "Steamer",
        ["cook_time"] = 3.6
    },

    ["Mapo Tofu"] = {
        ["lv"] = 2,
        ["cost"] = 32,
        ["props"] = {"Chinese", "Hot", "Spicy", "Vegetarian"},
        ["xprops"] = {"Refreshing", "Fruity", "Sweet"},
        ["ingredients"] = {"Tofu", "Pork", "Chili"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 3.6
    },

    ["Lunar Dango"] = {
        ["lv"] = 3,
        ["cost"] = 80,
        ["props"] = {"Expensive", "Japanese", "Specialty", "Sweet", "Wonderful"},
        ["xprops"] = {"Aquatic", "Meat", "Salty", "Fresh"},
        ["ingredients"] = {"Lunar Herb", "Sticky Rice"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 4.8
    },

    ["Lunar Lover Biscuits"] = {
        ["lv"] = 3,
        ["cost"] = 66,
        ["props"] = {"Expensive", "Photogenic", "Small Portion", "Specialty", "Sweet"},
        ["xprops"] = {"Aquatic", "Meat", "Vegetarian"},
        ["ingredients"] = {"Butter", "Flour", "Egg", "Lunar Herb"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 6.0
    },

    ["Sichuan Boiled Fish"] = {
        ["lv"] = 3,
        ["cost"] = 68,
        ["props"] = {"Aquatic", "Aura-Bursting", "Chinese", "Expensive", "Hot", "Spicy"},
        ["xprops"] = {"Refreshing", "Fruity", "Meat", "Sweet"},
        ["ingredients"] = {"Trout", "Chili"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 4.8
    },

    ["Hourai Branch"] = {
        ["lv"] = 5,
        ["cost"] = 125,
        ["props"] = {"Grilled", "Cultural Heritage", "Expensive", "Legendary", "Meat", "Premium"},
        ["xprops"] = {},
        ["ingredients"] = {"Bamboo", "Pork", "Salmon", "Wagyu Beef", "Venison"},
        ["kitchenware"] = "Grill",
        ["cook_time"] = 7.8
    },

    ["Fuji's Lava"] = {
        ["lv"] = 3,
        ["cost"] = 125,
        ["props"] = {"Aquatic", "Expensive", "Filling", "Fungus", "Hot", "Meat", "Premium", "Strength-Boosting"},
        ["xprops"] = {},
        ["ingredients"] = {"Beef", "Wagyu Beef", "Pufferfish", "Truffle"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 4.8
    },

    -- DLC 1
    ["DLC1"] = {
        "Pork & Mushroom Stir Fry", "Secret Savory Mushroom Hotpot", "Deep Fried Shrimp Tempura", "Cream of Mushroom Soup", "Pickles", "Nigiri Sushi",
        "Mushroom Maiden's Tip Tap Pot", "Okonomiyaki", "Shrimp-Stuffed Pumpkin", 'Ordinary "Eat Me" Cupcake', "Golden Crispy Fish Cakes", "Creamy Crab",
        "Takoyaki", "Imitation Shirikodama", "All-Meat Feast", "Buddha Jumps Over The Wall", "Sea Urchin Sashimi", "Seven-Colored Yokan"
    },

    ["Pork & Mushroom Stir Fry"] = {
        ["lv"] = 1,
        ["cost"] = 20,
        ["props"] = {"Fungus", "Greasy", "Homecooking", "Meat"},
        ["xprops"] = {},
        ["ingredients"] = {"Mushroom", "Pork"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 3.6
    },

    ["Secret Savory Mushroom Hotpot"] = {
        ["lv"] = 3,
        ["cost"] = 62,
        ["props"] = {"Expensive", "Fungus", "Japanese", "Fresh", "Specialty"},
        ["xprops"] = {},
        ["ingredients"] = {"Truffle", "Mushroom", "Dew"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 5.4
    },

    ["Deep Fried Shrimp Tempura"] = {
        ["lv"] = 1,
        ["cost"] = 22,
        ["props"] = {"Good w/ Alcohol", "Greasy"},
        ["xprops"] = {"Mild"},
        ["ingredients"] = {"Shrimp", "Flour"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 3.6
    },

    ["Cream of Mushroom Soup"] = {
        ["lv"] = 1,
        ["cost"] = 28,
        ["props"] = {"Fungus", "Homecooking", "Photogenic"},
        ["xprops"] = {},
        ["ingredients"] = {"Mushroom", "Potato", "Cream"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 4.8
    },

    ["Pickles"] = {
        ["lv"] = 1,
        ["cost"] = 16,
        ["props"] = {"Economical", "Good w/ Alcohol", "Salty", "Small Portion", "Vegetarian"},
        ["xprops"] = {},
        ["ingredients"] = {"Cucumber", "Black Salt"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 3.6
    },

    ["Nigiri Sushi"] = {
        ["lv"] = 1,
        ["cost"] = 28,
        ["props"] = {"Aquatic", "Cultural Heritage", "Japanese", "Mild", "Raw", "Fresh"},
        ["xprops"] = {},
        ["ingredients"] = {"Salmon", "Tuna"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 3.6
    },

    ["Mushroom Maiden's Tip Tap Pot"] = {
        ["lv"] = 4,
        ["cost"] = 112,
        ["props"] = {"Aquatic", "Expensive", "Fungus", "Greasy", "Hot", "Photogenic", "Salty", "Fresh", "Spicy"},
        ["xprops"] = {},
        ["ingredients"] = {"Mushroom", "Shrimp", "Octopus", "Chili"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 8.4
    },

    ["Okonomiyaki"] = {
        ["lv"] = 2,
        ["cost"] = 24,
        ["props"] = {"Japanese", "Photogenic", "Signature", "Small Portion"},
        ["xprops"] = {},
        ["ingredients"] = {"Flour", "Egg", "Radish"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 3.6
    },

    ["Shrimp-Stuffed Pumpkin"] = {
        ["lv"] = 2,
        ["cost"] = 55,
        ["props"] = {"Aquatic", "Filling", "Mild", "Photogenic", "Fresh", "Specialty", "Sweet"},
        ["xprops"] = {},
        ["ingredients"] = {"Pumpkin", "Shrimp", "Tofu"},
        ["kitchenware"] = "Steamer",
        ["cook_time"] = 5.4
    },

    ['Ordinary "Eat Me" Cupcake'] = {
        ["lv"] = 2,
        ["cost"] = 56,
        ["props"] = {"Cultural Heritage", "Fruity", "Photogenic", "Premium", "Sweet"},
        ["xprops"] = {},
        ["ingredients"] = {"Egg", "Grapes", "Cream"},
        ["kitchenware"] = "Steamer",
        ["cook_time"] = 4.8
    },

    ["Golden Crispy Fish Cakes"] = {
        ["lv"] = 2,
        ["cost"] = 40,
        ["props"] = {"Aquatic", "Good w/ Alcohol", "Greasy", "Strength-Boosting"},
        ["xprops"] = {},
        ["ingredients"] = {"Trout", "Flour", "Honey"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 5.4
    },

    ["Creamy Crab"] = {
        ["lv"] = 3,
        ["cost"] = 88,
        ["props"] = {"Expensive", "Good w/ Alcohol", "Premium", "Photogenic", "Fresh", "Sea Delicacy", "Signature"},
        ["xprops"] = {},
        ["ingredients"] = {"Cream", "Crab"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 7.2
    },

    ["Takoyaki"] = {
        ["lv"] = 2,
        ["cost"] = 36,
        ["props"] = {"Aquatic", "Filling", "Photogenic", "Small Portion", "Signature"},
        ["xprops"] = {},
        ["ingredients"] = {"Flour", "Seaweed", "Octopus"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 4.8
    },

    ["Imitation Shirikodama"] = {
        ["lv"] = 4,
        ["cost"] = 120,
        ["props"] = {"Dreamy", "Expensive", "Good w/ Alcohol", "Hot", "Legendary", "Small Portion", "Peculiar"},
        ["xprops"] = {},
        ["ingredients"] = {"Venison", "Truffle", "Cicada Slough"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 7.2
    },

    ["All-Meat Feast"] = {
        ["lv"] = 4,
        ["cost"] = 115,
        ["props"] = {"Expensive", "Good w/ Alcohol", "Hot", "Large Portion", "Meat", "Mountain Delicacy", "Photogenic", "Premium", "Salty"},
        ["xprops"] = {},
        ["ingredients"] = {"Boar Meat", "Venison", "Iberico Pork", "Wagyu Beef"},
        ["kitchenware"] = "Grill",
        ["cook_time"] = 8.4
    },

    ["Buddha Jumps Over The Wall"] = {
        ["lv"] = 4,
        ["cost"] = 160,
        ["props"] = {"Aquatic", "Chinese", "Cultural Heritage", "Expensive", "Fungus", "Legendary", "Meat", "Mountain Delicacy", "Photogenic", "Premium", "Specialty", "Strength-Boosting"},
        ["xprops"] = {},
        ["ingredients"] = {"Wagyu Beef", "Premium Tuna", "Iberico Pork", "Pufferfish", "Truffle"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 10.8
    },

    ["Sea Urchin Sashimi"] = {
        ["lv"] = 4,
        ["cost"] = 108,
        ["props"] = {"Expensive", "Photogenic", "Premium", "Sea Delicacy", "Small Portion", "Specialty", "Sweet", "Wonderful"},
        ["xprops"] = {},
        ["ingredients"] = {"Sea Urchin", "Dew"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 4.8
    },

    ["Seven-Colored Yokan"] = {
        ["lv"] = 4,
        ["cost"] = 92,
        ["props"] = {"Cultural Heritage", "Dreamy", "Expensive", "Fruity", "Photogenic", "Premium", "Sweet", "Wonderful"},
        ["xprops"] = {},
        ["ingredients"] = {"Seaweed", "Grapes", "Dew", "Udumbara"},
        ["kitchenware"] = "Steamer",
        ["cook_time"] = 4.8
    },

    -- DLC 2
    ["DLC2"] = {
        "Cheese Omelette", "Lion's Head", "Neko-manma", "Sakura Pudding", "Salmon Tempura", "Instant☆Death", "Crispy Spirals", "Misery Cheese Sticks",
        "Giant Tamagoyaki", "Ceiling-Longing Pie", "Energy Pudding", "Dragon Carp", "Oedo Boat Feast", "Burn-out Pudding", "CAUTION!! Hellish Spice!",
        "Kabuto Steamed Cake", "Gloomy Fruit Pie", "Agony Oden"
    },

    ["Cheese Omelette"] = {
        ["lv"] = 1,
        ["cost"] = 26,
        ["props"] = {"Greasy", "Raw", "Salty", "Fresh"},
        ["xprops"] = {"Meat"},
        ["ingredients"] = {"Egg", "Cheese"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 3.6
    },

    ["Lion's Head"] = {
        ["lv"] = 1,
        ["cost"] = 28,
        ["props"] = {"Good w/ Alcohol", "Meat", "Fresh", "Signature", "Specialty"},
        ["xprops"] = {"Aquatic", "Filling"},
        ["ingredients"] = {"Beef"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 4.2
    },

    ["Neko-manma"] = {
        ["lv"] = 1,
        ["cost"] = 26,
        ["props"] = {"Aquatic", "Fresh", "Small Portion"},
        ["xprops"] = {"Greasy"},
        ["ingredients"] = {"Trout", "Dew", "Flour"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 3
    },

    ["Sakura Pudding"] = {
        ["lv"] = 2,
        ["cost"] = 32,
        ["props"] = {"Refreshing", "Fruity", "Photogenic", "Small Portion", "Specialty", "Sweet"},
        ["xprops"] = {"Greasy", "Salty"},
        ["ingredients"] = {"Honey", "Peach"},
        ["kitchenware"] = "Steamer",
        ["cook_time"] = 3.6
    },

    ["Salmon Tempura"] = {
        ["lv"] = 2,
        ["cost"] = 44,
        ["props"] = {"Aquatic", "Greasy", "Premium", "Fresh", "Small Portion"},
        ["xprops"] = {},
        ["ingredients"] = {"Salmon", "Butter", "Egg", "Flour"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 4.8
    },

    ["Instant☆Death"] = {
        ["lv"] = 3,
        ["cost"] = 62,
        ["props"] = {"Grilled", "Expensive", "Filling", "Greasy", "Meat", "Mountain Delicacy", "Strength-Boosting"},
        ["xprops"] = {},
        ["ingredients"] = {"Boar Meat", "Venison", "Onion"},
        ["kitchenware"] = "Grill",
        ["cook_time"] = 5.4
    },

    ["Crispy Spirals"] = {
        ["lv"] = 1,
        ["cost"] = 42,
        ["props"] = {"Filling", "Raw", "Specialty", "Peculiar"},
        ["xprops"] = {"Greasy"},
        ["ingredients"] = {"Flour", "Honey", "Cicada Slough"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 3
    },

    ["Misery Cheese Sticks"] = {
        ["lv"] = 1,
        ["cost"] = 25,
        ["props"] = {"Good w/ Alcohol", "Salty", "Fresh", "Specialty"},
        ["xprops"] = {},
        ["ingredients"] = {"Cheese", "Ginkgo Nut", "Ginkgo Nut"},
        ["kitchenware"] = "Steamer",
        ["cook_time"] = 3.6
    },

    ["Giant Tamagoyaki"] = {
        ["lv"] = 2,
        ["cost"] = 60,
        ["props"] = {"Filling", "Japanese", "Premium", "Strength-Boosting", "Sweet"},
        ["xprops"] = {"Good w/ Alcohol"},
        ["ingredients"] = {"Flour", "Flour", "Egg", "Egg"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 7.2
    },

    ["Ceiling-Longing Pie"] = {
        ["lv"] = 2,
        ["cost"] = 66,
        ["props"] = {"Expensive", "Good w/ Alcohol", "Photogenic", "Sea Delicacy", "Signature", "Specialty", "Peculiar"},
        ["xprops"] = {"Meat"},
        ["ingredients"] = {"Trout", "Flour", "Peach"},
        ["kitchenware"] = "Steamer",
        ["cook_time"] = 5.4
    },

    ["Energy Pudding"] = {
        ["lv"] = 2,
        ["cost"] = 42,
        ["props"] = {"Refreshing", "Fruity", "Small Portion", "Sour", "Strength-Boosting", "Sweet"},
        ["xprops"] = {"Greasy", "Salty"},
        ["ingredients"] = {"Grapes", "Grapes", "Lemon"},
        ["kitchenware"] = "Steamer",
        ["cook_time"] = 4.8
    },

    ["Dragon Carp"] = {
        ["lv"] = 4,
        ["cost"] = 142,
        ["props"] = {"Aquatic", "Chinese", "Cultural Heritage", "Dreamy", "Expensive", "Fungus", "Large Portion", "Meat", "Premium", "Fresh", "Sea Delicacy", "Sweet" },
        ["xprops"] = {},
        ["ingredients"] = {"Premium Tuna", "Venison", "Honey", "Lunar Herb", "Truffle"},
        ["kitchenware"] = "Steamer",
        ["cook_time"] = 7.2
    },

    ["Oedo Boat Feast"] = {
        ["lv"] = 4,
        ["cost"] = 206,
        ["props"] = {"Aquatic", "Cultural Heritage", "Expensive", "Good w/ Alcohol", "Japanese", "Legendary", "Photogenic", "Premium", "Raw", "Fresh", "Sea Delicacy", "Signature"},
        ["xprops"] = {},
        ["ingredients"] = {"Salmon", "Tuna", "Premium Tuna", "Trout", "Ice Cube"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 14.4
    },

    ["Burn-out Pudding"] = {
        ["lv"] = 4,
        ["cost"] = 73,
        ["props"] = {"Refreshing", "Dreamy", "Expensive", "Fruity", "Signature", "Small Portion", "Sour", "Strength-Boosting", "Sweet"},
        ["xprops"] = {"Greasy", "Salty"},
        ["ingredients"] = {"Grapes", "Honey", "Lemon", "Lemon"},
        ["kitchenware"] = "Steamer",
        ["cook_time"] = 4.8
    },

    ["CAUTION!! Hellish Spice!"] = {
        ["lv"] = 4,
        ["cost"] = 108,
        ["props"] = {"Expensive", "Greasy", "Hot", "Meat", "Photogenic", "Salty", "Spicy", "Peculiar", "Strength-Boosting" },
        ["xprops"] = {"Mild", "Vegetarian"},
        ["ingredients"] = {"Chili", "Chili", "Chili", "Cheese", "Beef"},
        ["kitchenware"] = "Frying Pan",
        ["cook_time"] = 7.2
    },

    ["Kabuto Steamed Cake"] = {
        ["lv"] = 3,
        ["cost"] = 105,
        ["props"] = {"Expensive", "Filling", "Photogenic", "Premium", "Raw", "Fresh", "Signature", "Peculiar", "Strength-Boosting", "Specialty"},
        ["xprops"] = {},
        ["ingredients"] = {"Flour", "Iberico Pork", "Honey", "Cicada Slough"},
        ["kitchenware"] = "Steamer",
        ["cook_time"] = 7.2
    },

    ["Gloomy Fruit Pie"] = {
        ["lv"] = 2,
        ["cost"] = 36,
        ["props"] = {"Fruity", "Salty", "Fresh", "Sour", "Specialty"},
        ["xprops"] = {},
        ["ingredients"] = {"Lemon", "Grapes", "Cheese"},
        ["kitchenware"] = "Cutting Board",
        ["cook_time"] = 4.8
    },

    ["Agony Oden"] = {
        ["lv"] = 4,
        ["cost"] = 92,
        ["props"] = {"Expensive", "Filling", "Hot", "Large Portion", "Meat", "Premium", "Fresh", "Specialty", "Spicy", "Strength-Boosting"},
        ["xprops"] = {},
        ["ingredients"] = {"Chili", "Chili", "Beef", "Radish", "Tofu"},
        ["kitchenware"] = "Boiling Pot",
        ["cook_time"] = 7.2
    },
    
    --DLC 3
    ["DLC3"] = {
    	"Baked Sweet Potato", "Yashouma Dango", "Heart-Throbbing Surprise!", "Biscay Biscuits", "Smoked Buccaneer", "Buddha's Delight", "Unzan Cotton Candy", "Pure White Lotus", "Star Lotus Ship", "Pine Nut Cake", "White Deer, Unyielding Pine", "Eight Trigram Fish Maws", "Honeyed Chestnut", "Tianshi's Stewed Mushrooms", "Lotus Fish Lamps", "Candied Sweet Potato", "Golden Two-Shroom Wrap", "Tempura Platter"
    },
    
    ["Baked Sweet Potato"] = {
    	["lv"] = 1,
    	["cost"] = 25,
    	["props"] = {"Economical", "Filling", "Homecooking", "Sweet"},
    	["xprops"] = {"Good w/ Alcohol"},
    	["ingredients"] = {"Sweet Potato"},
    	["kitchenware"] = "Grill",
    	["cook_time"] = 3.6
    },
    
    ["Yashouma Dango"] = {
    	["lv"] = 2,
    	["cost"] = 45,
    	["props"] = {"Cultural Heritage", "Filling", "Photogenic", "Peculiar"},
    	["xprops"] = {"Meat"},
    	["ingredients"] = {"Sticky Rice", "Sticky Rice"},
    	["kitchenware"] = "Cutting Board",
    	["cook_time"] = 5.4
    },
   
    ["Heart-Throbbing Surprise!"] = {
    	["lv"] = 4,
    	["cost"] = 90,
    	["props"] = {"Dreamy", "Expensive", "Photogenic", "Specialty", "Peculiar", "Strength-Boosting", "Wonderful"},
    	["xprops"] = {"Homecooking"},
    	["ingredients"] = {"Mushroom", "Udumbara", "Honey", "Cream"},
    	["kitchenware"] = "Steamer",
    	["cook_time"] = 7.2
    },
    
    ["Biscay Biscuits"] = {
    	["lv"] = 1,
    	["cost"] = 26,
    	["props"] = {"Filling", "Hot", "Salty"},
    	["xprops"] = {"Sour"},
    	["ingredients"] = {"Flour", "Cheese"},
    	["kitchenware"] = "Grill",
    	["cook_time"] = 3
    },
    
    ["Smoked Buccaneer"] = {
    	["lv"] = 2,
    	["cost"] = 58,
    	["props"] = {"Large Portion", "Legendary", "Meat", "Specialty", "Strength-Boosting"},
    	["xprops"] = {"Sour"},
    	["ingredients"] = {"Beef", "Black Salt", "Chili", "Honey"},
    	["kitchenware"] = "Grill",
    	["cook_time"] = 5.4
    },
    
    ["Buddha's Delight"] = {
    	["lv"] = 4,
    	["cost"] = 97,
    	["props"] = {"Refreshing", "Cultural Heritage", "Dreamy", "Expensive", "Mild", "Premium", "Fresh", "Specialty", "Vegetarian"},
    	["xprops"] = {"Meat", "Spicy"},
    	["ingredients"] = {"Udumbara", "Bamboo Shoot", "Truffle", "Pine Nut", "Lotus Seed"},
    	["kitchenware"] = "Boiling Pot",
    	["cook_time"] = 7.2
    },
    
    ["Unzan Cotton Candy"] = {
    	["lv"] = 1,
    	["cost"] = 20,
    	["props"] = {"Fruity", "Specialty", "Sweet", "Wonderful"},
    	["xprops"] = {"Meat", "Salty"},
    	["ingredients"] = {"Honey", "Peach"},
    	["kitchenware"] = "Frying Pan",
    	["cook_time"] = 4.8
    },
    
    ["Pure White Lotus"] = {
    	["lv"] = 2,
    	["cost"] = 56,
    	["props"] = {"Mild", "Photogenic", "Small Portion", "Specialty", "Vegetarian"},
    	["xprops"] = {"Spicy"},
    	["ingredients"] = {"Ginkgo Nut", "Lotus Seed", "Flour", "Butter"},
    	["kitchenware"] = "Steamer",
    	["cook_time"] = 6
    },
    
    ["Star Lotus Ship"] = {
    	["lv"] = 4,
    	["cost"] = 132,
    	["props"] = {"Refreshing", "Dreamy", "Expensive", "Photogenic", "Premium", "Raw", "Fresh", "Signature", "Specialty", "Wonderful"},
    	["xprops"] = {"Peculiar"},
    	["ingredients"] = {"Pumpkin", "Lotus Seed", "Tuna", "Bingdi Lotus", "Lunar Herb"},
    	["kitchenware"] = "Cutting Board",
    	["cook_time"] = 7.8
    },
    
    ["Pine Nut Cake"] = {
    	["lv"] = 2,
    	["cost"] = 46,
    	["props"] = {"Mild", "Specialty"},
    	["xprops"] = {},
    	["ingredients"] = {"Sticky Rice", "Pine Nut"},
    	["kitchenware"] = "Steamer",
    	["cook_time"] = 4.8
    },
    
    ["White Deer, Unyielding Pine"] = {
    	["lv"] = 3,
    	["cost"] = 72,
    	["props"] = {"Cultural Heritage", "Expensive", "Meat", "Mountain Delicacy", "Premium", "Specialty"},
    	["xprops"] = {"Sour"},
    	["ingredients"] = {"Venison", "Ginkgo Nut", "Pine Nut"},
    	["kitchenware"] = "Steamer",
    	["cook_time"] = 7.2
    },
    
    ["Eight Trigram Fish Maws"] = {
    	["lv"] = 4,
    	["cost"] = 136,
    	["props"] = {"Aquatic", "Refreshing", "Cultural Heritage", "Expensive", "Mild", "Premium", "Fresh"},
    	["xprops"] = {},
    	["ingredients"] = {"Premium Tuna", "Mushroom", "Radish", "Egg", "Ginkgo Nut"},
    	["kitchenware"] = "Boiling Pot",
    	["cook_time"] = 8.4
    },
    
    ["Honeyed Chestnut"] = {
    	["lv"] = 1,
    	["cost"] = 30,
    	["props"] = {"Small Portion", "Specialty", "Sweet"},
    	["xprops"] = {},
    	["ingredients"] = {"Honey", "Chestnut"},
    	["kitchenware"] = "Cutting Board",
    	["cook_time"] = 3.6
    },
    
    ["Tianshi's Stewed Mushrooms"] = {
    	["lv"] = 2,
    	["cost"] = 55,
    	["props"] = {"Chinese", "Fungus", "Homecooking", "Specialty", "Vegetarian"},
    	["xprops"] = {},
    	["ingredients"] = {"Chestnut", "Mushroom", "Truffle"},
    	["kitchenware"] = "Boiling Pot",
    	["cook_time"] = 4.8
    },
    
    ["Lotus Fish Lamps"] = {
    	["lv"] = 4,
    	["cost"] = 94,
    	["props"] = {"Aquatic", "Chinese", "Cultural Heritage", "Dreamy", "Expensive", "Legendary", "Mild", "Wonderful"},
    	["xprops"] = {},
    	["ingredients"] = {"Premium Tuna", "Bingdi Lotus", "Lotus Seed", "Dew"},
    	["kitchenware"] = 'Steamer',
    	["cook_time"] = 6.6
    },
    
    ["Candied Sweet Potato"] = {
    	["lv"] = 1,
    	["cost"] = 30,
    	["props"] = {"Filling", "Homecooking", "Sweet", "Vegetarian"},
    	["xprops"] = {"Raw"},
    	["ingredients"] = {"Sweet Potato", "Honey"},
    	["kitchenware"] = "Frying Pan",
    	["cook_time"] = 3.6
    },
    
    ["Golden Two-Shroom Wrap"] = {
    	["lv"] = 3,
    	["cost"] = 63,
    	["props"] = {"Expensive", "Fungus", "Good w/ Alcohol", "Greasy", "Homecooking", "Hot", "Meat", "Signature"},
    	["xprops"] = {"Refreshing"},
    	["ingredients"] = {"Pork", "Mushroom", "Truffle"},
    	["kitchenware"] = "Frying Pan",
    	["cook_time"] = 5.4
    },
    
    ["Tempura Platter"] = {
    	["lv"] = 3,
    	["cost"] = 72,
    	["props"] = {"Expensive", "Meat", "Fungus", "Good w/ Alcohol", "Greasy", "Homecooking", "Japanese", "Signature", "Strength-Boosting"},
    	["xprops"] = {},
    	["ingredients"] = {"Iberico Pork", "Truffle", "Lamprey", "Lunar Herb"},
    	["kitchenware"] = "Frying Pan",
    	["cook_time"] = 4.2
    },
    
    --DLC 4
    ["DLC4"] = {
    	"Tomato Fries", "Peach Braised Pork", "Against The World!", "Red Bean Daifuku", "Dorayaki", "Palace of the Han", "Bamboo Meat Pot", "Rice Powder Meat", "Bamboo Spring", "Plum Tea Rice", "Urchin Steamed Egg", "Scrumptious Storm", "Mushroom Herb Road", "Nature's Beauty", "Faint Dream", "Toon Pancake", "Miasma Garden", "Little Sweet \"Poison\""
    },
    
    ["Tomato Fries"] = {
    	["lv"] = 1,
    	["cost"] = 26,
    	["props"] = {"Peculiar", "Wonderful", "Small Portion"},
    	["xprops"] = {"Aquatic"},
    	["ingredients"] = {"Tomato", "Potato"},
    	["kitchenware"] = "Frying Pan",
    	["cook_time"] = 3.6
    },
    
    ["Peach Braised Pork"] = {
    	["lv"] = 2,
    	["cost"] = 42,
    	["props"] = {"Meat", "Good w/ Alcohol", "Wonderful", "Fruity"},
    	["xprops"] = {},
    	["ingredients"] = {"Honey", "Peach", "Pork"},
    	["kitchenware"] = "Frying Pan",
    	["cook_time"] = 4.8
    },
   
    ["Against The World!"] = {
    	["lv"] = 4,
    	["cost"] = 124,
    	["props"] = {"Expensive", "Mountain Delicacy", "Refreshing", "Peculiar", "Fungus", "Wonderful", "Dreamy", "Aura-Bursting"},
    	["xprops"] = {},
    	["ingredients"] = {"Bamboo", "Flower", "Plum", "Iberico Pork", "Truffle"},
    	["kitchenware"] = "Cutting Board",
    	["cook_time"] = 7.2
    },
    
    ["Red Bean Daifuku"] = {
    	["lv"] = 2,
    	["cost"] = 28,
    	["props"] = {"Japanese", "Sweet", "Small Portion"},
    	["xprops"] = {},
    	["ingredients"] = {"Red Bean", "Sticky Rice"},
    	["kitchenware"] = "Cutting Board",
    	["cook_time"] = 4.2
    },
    
    ["Dorayaki"] = {
    	["lv"] = 2,
    	["cost"] = 40,
    	["props"] = {"Vegetarian", "Japanese", "Sweet", "Specialty"},
    	["xprops"] = {"Meat"},
    	["ingredients"] = {"Red Bean", "Egg", "Flour"},
    	["kitchenware"] = "Frying Pan",
    	["cook_time"] = 3.6
    },
    
    ["Palace of the Han"] = {
    	["lv"] = 4,
    	["cost"] = 115,
    	["props"] = {"Expensive", "Aquatic", "Premium", "Legendary", "Chinese", "Peculiar", "Cultural Heritage", "Soup"},
    	["xprops"] = {"Greasy"},
    	["ingredients"] = {"Lamprey", "Tofu", "Crab", "Bamboo", "Dew"},
    	["kitchenware"] = "Boiling Pot",
    	["cook_time"] = 7.2
    },
    
    ["Bamboo Meat Pot"] = {
    	["lv"] = 3,
    	["cost"] = 42,
    	["props"] = {"Meat", "Homecooking", "Filling"},
    	["xprops"] = {},
    	["ingredients"] = {"Bamboo", "Bamboo Shoot", "Beef"},
    	["kitchenware"] = "Boiling Pot",
    	["cook_time"] = 4.2
    },
    
    ["Rice Powder Meat"] = {
    	["lv"] = 3,
    	["cost"] = 72,
    	["props"] = {"Expensive", "Meat", "Homecooking", "Mountain Delicacy"},
    	["xprops"] = {"Raw"},
    	["ingredients"] = {"Bamboo", "Dew", "Iberico Pork"},
    	["kitchenware"] = "Steamer",
    	["cook_time"] = 5.4
    },
    
    ["Bamboo Spring"] = {
    	["lv"] = 4,
    	["cost"] = 99,
    	["props"] = {"Expensive", "Premium", "Mountain Delicacy", "Signature", "Photogenic", "Cultural Heritage"},
    	["xprops"] = {"Peculiar", "Fungus"},
    	["ingredients"] = {"Cucumber", "Egg", "Radish", "Venison", "Lunar Herb"},
    	["kitchenware"] = "Steamer",
    	["cook_time"] = 8.4
    },
    
    ["Plum Tea Rice"] = {
    	["lv"] = 1,
    	["cost"] = 32,
    	["props"] = {"Homecooking", "Japanese"},
    	["xprops"] = {},
    	["ingredients"] = {"Plum", "Seaweed"},
    	["kitchenware"] = "Boiling Pot",
    	["cook_time"] = 2.4
    },
    
    ["Urchin Steamed Egg"] = {
    	["lv"] = 3,
    	["cost"] = 112,
    	["props"] = {"Expensive", "Sea Delicacy", "Fresh", "Photogenic"},
    	["xprops"] = {"Mountain Delicacy"},
    	["ingredients"] = {"Sea Urchin", "Egg"},
    	["kitchenware"] = "Steamer",
    	["cook_time"] = 4.2
    },
    
    ["Scrumptious Storm"] = {
    	["lv"] = 5,
    	["cost"] = 185,
    	["props"] = {"Expensive", "Meat", "Greasy", "Filling", "Raw", "Signature", "Photogenic", "Strength-Boosting"},
    	["xprops"] = {"Refreshing", "Mild"},
    	["ingredients"] = {"Onion", "Boar Meat", "Beef", "Truffle", "Tomato"},
    	["kitchenware"] = "Grill",
    	["cook_time"] = 10.8
    },
    
    ["Mushroom Herb Road"] = {
    	["lv"] = 1,
    	["cost"] = 24,
    	["props"] = {"Mild", "Cultural Heritage", "Fungus", "Specialty"},
    	["xprops"] = {},
    	["ingredients"] = {"Red Toon", "Mushroom"},
    	["kitchenware"] = "Boiling Pot",
    	["cook_time"] = 3.6
    },
    
    ["Nature's Beauty"] = {
    	["lv"] = 3,
    	["cost"] = 78,
    	["props"] = {"Expensive", "Premium", "Wonderful", "Dreamy", "Specialty"},
    	["xprops"] = {"Hot", "Greasy"},
    	["ingredients"] = {"Flower", "Lunar Herb", "Cream"},
    	["kitchenware"] = "Steamer",
    	["cook_time"] = 5.4
    },
    
    ["Faint Dream"] = {
    	["lv"] = 4,
    	["cost"] = 133,
    	["props"] = {"Expensive", "Premium", "Mild", "Western", "Sweet", "Photogenic", "Refreshing", "Dreamy"},
    	["xprops"] = {"Meat", "Good w/ Alcohol", "Aquatic"},
    	["ingredients"] = {"Flower", "Udumbara", "Lunar Herb", "Dew", "Cream"},
    	["kitchenware"] = 'Steamer',
    	["cook_time"] = 7.2
    },
    
    ["Toon Pancake"] = {
    	["lv"] = 1,
    	["cost"] = 30,
    	["props"] = {"Signature", "Specialty"},
    	["xprops"] = {},
    	["ingredients"] = {"Red Toon", "Egg"},
    	["kitchenware"] = "Frying Pan",
    	["cook_time"] = 3.6
    },
    
    ["Miasma Garden"] = {
    	["lv"] = 3,
    	["cost"] = 58,
    	["props"] = {"Aquatic", "Signature", "Peculiar", "Poison"},
    	["xprops"] = {},
    	["ingredients"] = {"Pufferfish", "Plum", "Lamprey", "Ginkgo Nut"},
    	["kitchenware"] = "Boiling Pot",
    	["cook_time"] = 4.8
    },
    
    ["Little Sweet \"Poison\""] = {
    	["lv"] = 3,
    	["cost"] = 87,
    	["props"] = {"Expensive", "Premium", "Sweet", "Photogenic", "Small Portion", "Dreamy"},
    	["xprops"] = {"Meat"},
    	["ingredients"] = {"Udumbara", "Cream", "Grapes", "Ginkgo Nut"},
    	["kitchenware"] = "Steamer",
    	["cook_time"] = 6
    },
    
    --DLC 5
    ["DLC5"] = {
    	"Eel Bowl with Egg", "Drunk Shrimp in Bamboo", "Two-flavor Beef Hotpot", "Kitten Canele", "Kitten Pizza", "Kitten's Water Play", "Long Hair Princess", "Urchin Raindrop Cake", "Mad Hatter's Tea Party", "Peach Flower Crystal Roll", "Moonlight over the Lotus Pond", "Dragonsong Peach", "Molecular Egg", "Origin of Life", "Planet Mars", "Heart-warming Congee", "Hot Pepper Soup", "Supreme Seafood Noodles"
    },
    
    ["Eel Bowl with Egg"] = {
    	["lv"] = 2,
    	["cost"] = 45,
    	["props"] = {"Aquatic", "Raw", "Signature"},
    	["xprops"] = {},
    	["ingredients"] = {"Lamprey", "Egg"},
    	["kitchenware"] = "Frying Pan",
    	["cook_time"] = 3
    },
    
    ["Drunk Shrimp in Bamboo"] = {
    	["lv"] = 3,
    	["cost"] = 60,
    	["props"] = {"Aquatic", "Fresh", "Raw", "Peculiar"},
    	["xprops"] = {"Filling"},
    	["ingredients"] = {"Bamboo", "Shrimp", "Broccoli"},
    	["kitchenware"] = "Cutting Board",
    	["cook_time"] = 3
    },
   
    ["Two-flavor Beef Hotpot"] = {
    	["lv"] = 4,
    	["cost"] = 188,
    	["props"] = {"Expensive", "Meat", "Homecooking", "Mountain Delicacy", "Chinese", "Hot", "Strength-Boosting", "Fungus", "Spicy"},
    	["xprops"] = {"Refreshing", "Dreamy"},
    	["ingredients"] = {"Chili", "Radish", "Truffle", "Beef", "Wagyu Beef"},
    	["kitchenware"] = "Boiling Pot",
    	["cook_time"] = 3
    },
    
    ["Kitten Canele"] = {
    	["lv"] = 2,
    	["cost"] = 45,
    	["props"] = {"Filling", "Sweet", "Photogenic"},
    	["xprops"] = {"Peculiar"},
    	["ingredients"] = {"Cocoa Bean", "Flour", "Egg"},
    	["kitchenware"] = "Grill",
    	["cook_time"] = 4.2
    },
    
    ["Kitten Pizza"] = {
    	["lv"] = 3,
    	["cost"] = 75,
    	["props"] = {"Expensive", "Filling", "Western", "Photogenic", "Fungus"},
    	["xprops"] = {"Refreshing"},
    	["ingredients"] = {"Mushroom", "Onion", "Broccoli", "Boar Meat"},
    	["kitchenware"] = "Grill",
    	["cook_time"] = 6
    },
    
    ["Kitten's Water Play"] = {
    	["lv"] = 4,
    	["cost"] = 120,
    	["props"] = {"Expensive", "Vegetarian", "Sweet", "Photogenic", "Refreshing", "Wonderful", "Dreamy"},
    	["xprops"] = {"Good w/ Alcohol", "Hot"},
    	["ingredients"] = {"Peach", "Creeping Fig", "Cream", "Cocoa Bean", "Flour"},
    	["kitchenware"] = "Cutting Board",
    	["cook_time"] = 7.2
    },
    
    ["Long Hair Princess"] = {
    	["lv"] = 2,
    	["cost"] = 36,
    	["props"] = {"Aquatic", "Filling", "Photogenic"},
    	["xprops"] = {"Peculiar"},
    	["ingredients"] = {"Pumpkin", "Shrimp"},
    	["kitchenware"] = "Steamer",
    	["cook_time"] = 3
    },
    
    ["Urchin Raindrop Cake"] = {
    	["lv"] = 4,
    	["cost"] = 128,
    	["props"] = {"Expensive", "Aquatic", "Premium", "Refreshing", "Small Portion", "Dreamy"},
    	["xprops"] = {"Filling"},
    	["ingredients"] = {"Sea Urchin", "Tuna", "Snow Fungus", "Dew"},
    	["kitchenware"] = "Boiling Pot",
    	["cook_time"] = 7.2
    },
    
    ["Mad Hatter's Tea Party"] = {
    	["lv"] = 5,
    	["cost"] = 188,
    	["props"] = {"Expensive", "Western", "Sweet", "Photogenic", "Fungus", "Wonderful", "Dreamy", "Specialty"},
    	["xprops"] = {"Greasy"},
    	["ingredients"] = {"Cocoa Bean", "Cream", "Flour", "Mushroom", "Broccoli"},
    	["kitchenware"] = "Steamer",
    	["cook_time"] = 9
    },
    
    ["Peach Flower Crystal Roll"] = {
    	["lv"] = 3,
    	["cost"] = 60,
    	["props"] = {"Premium", "Japanese", "Sweet", "Photogenic", "Small Portion", "Dreamy", "Specialty"},
    	["xprops"] = {"Meat", "Peculiar", "Filling", "Fungus"},
    	["ingredients"] = {"Peach", "Red Bean", "Creeping Fig"},
    	["kitchenware"] = "Steamer",
    	["cook_time"] = 4.8
    },
    
    ["Moonlight over the Lotus Pond"] = {
    	["lv"] = 4,
    	["cost"] = 128,
    	["props"] = {"Expensive", "Premium", "Mild", "Chinese", "Sweet", "Photogenic", "Refreshing", "Cultural Heritage"},
    	["xprops"] = {"Meat", "Peculiar", "Good w/ Alcohol", "Hot"},
    	["ingredients"] = {"Grapes", "Creeping Fig", "Cream", "Snow Fungus"},
    	["kitchenware"] = "Cutting Board",
    	["cook_time"] = 7.2
    },
    
    ["Dragonsong Peach"] = {
    	["lv"] = 5,
    	["cost"] = 199,
    	["props"] = {"Expensive", "Premium", "Legendary", "Mild", "Sweet", "Refreshing", "Wonderful", "Specialty", "Fruity"},
    	["xprops"] = {"Fungus", "Meat", "Sea Delicacy", "Peculiar", "Raw"},
    	["ingredients"] = {"Cocoa Bean", "Peach", "Peach", "Peach", "Peach"},
    	["kitchenware"] = "Cutting Board",
    	["cook_time"] = 10.8
    },
    
    ["Molecular Egg"] = {
    	["lv"] = 3,
    	["cost"] = 80,
    	["props"] = {"Expensive", "Vegetarian", "Premium", "Mild", "Sweet", "Wonderful", "Small Portion"},
    	["xprops"] = {"Mountain Delicacy"},
    	["ingredients"] = {"Cocoa Bean", "Pumpkin", "Cream"},
    	["kitchenware"] = "Cutting Board",
    	["cook_time"] = 4.2
    },
    
    ["Origin of Life"] = {
    	["lv"] = 4,
    	["cost"] = 124,
    	["props"] = {"Expensive", "Premium", "Legendary", "Mild", "Raw", "Fungus", "Wonderful", "Soup"},
    	["xprops"] = {"Mountain Delicacy"},
    	["ingredients"] = {"Cocoa Bean", "Snow Fungus", "Pumpkin", "Dew"},
    	["kitchenware"] = "Steamer",
    	["cook_time"] = 7.8
    },
    
    ["Planet Mars"] = {
    	["lv"] = 5,
    	["cost"] = 198,
    	["props"] = {"Expensive", "Aquatic", "Premium", "Legendary", "Sea Delicacy", "Photogenic", "Cultural Heritage", "Wonderful", "Fruity"},
    	["xprops"] = {"Mountain Delicacy"},
    	["ingredients"] = {"Creeping Fig", "Grapes", "Crab", "Dew"},
    	["kitchenware"] = 'Steamer',
    	["cook_time"] = 14.4
    },
    
    ["Heart-warming Congee"] = {
    	["lv"] = 1,
    	["cost"] = 35,
    	["props"] = {"Mild", "Sweet", "Specialty"},
    	["xprops"] = {},
    	["ingredients"] = {"Snow Fungus", "Lotus Seed"},
    	["kitchenware"] = "Boiling Pot",
    	["cook_time"] = 3
    },
    
    ["Hot Pepper Soup"] = {
    	["lv"] = 2,
    	["cost"] = 60,
    	["props"] = {"Homecooking", "Chinese", "Hot", "Soup", "Spicy", "Aura-Bursting"},
    	["xprops"] = {},
    	["ingredients"] = {"Chili", "Beef", "Tofu"},
    	["kitchenware"] = "Frying Pan",
    	["cook_time"] = 4.8
    },
    
    ["Supreme Seafood Noodles"] = {
    	["lv"] = 4,
    	["cost"] = 135,
    	["props"] = {"Expensive", "Aquatic", "Homecooking", "Premium", "Filling", "Sea Delicacy", "Fresh"},
    	["xprops"] = {},
    	["ingredients"] = {"Premium Tuna", "Seaweed", "Octopus", "Crab", "Shrimp"},
    	["kitchenware"] = "Boiling Pot",
    	["cook_time"] = 6
    }
}