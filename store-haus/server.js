import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Hardcoded catalog JSON
const catalog = [
  {
    "title": "Gift Card",
    "url": "/products/gift-card",
    "image": "http://127.0.0.1:9292/cdn/shop/files/gift_card.png?v=1762879716&width=533",
    "price": "From $10.00 USD"
  },
  {
    "title": "Selling Plans Ski Wax",
    "url": "/products/selling-plans-ski-wax",
    "image": "http://127.0.0.1:9292/cdn/shop/files/snowboard_wax.png?v=1762879717&width=533",
    "price": "From $9.95 USD"
  },
  {
    "title": "The 3p Fulfilled Snowboard",
    "url": "/products/the-3p-fulfilled-snowboard",
    "image": "http://127.0.0.1:9292/cdn/shop/files/Main_b9e0da7f-db89-4d41-83f0-7f417b02831d.jpg?v=1762879717&width=533",
    "price": "$2,629.95 USD"
  },
  {
    "title": "The Collection Snowboard: Hydrogen",
    "url": "/products/the-collection-snowboard-hydrogen",
    "image": "http://127.0.0.1:9292/cdn/shop/files/Main_0a40b01b-5021-48c1-80d1-aa8ab4876d3d.jpg?v=1762879716&width=533",
    "price": "$600.00 USD"
  },
  {
    "title": "The Collection Snowboard: Liquid",
    "url": "/products/the-collection-snowboard-liquid",
    "image": "http://127.0.0.1:9292/cdn/shop/files/Main_b13ad453-477c-4ed1-9b43-81f3345adfd6.jpg?v=1762879718&width=533",
    "price": "$749.95 USD"
  },
  {
    "title": "The Collection Snowboard: Oxygen",
    "url": "/products/the-collection-snowboard-oxygen",
    "image": "http://127.0.0.1:9292/cdn/shop/files/Main_d624f226-0a89-4fe1-b333-0d1548b43c06.jpg?v=1762879718&width=533",
    "price": "$1,025.00 USD"
  },
  {
    "title": "The Compare at Price Snowboard",
    "url": "/products/the-compare-at-price-snowboard",
    "image": "http://127.0.0.1:9292/cdn/shop/files/snowboard_sky.png?v=1762879716&width=533",
    "price": "$785.95 USD"
  },
  {
    "title": "The Complete Snowboard",
    "url": "/products/the-complete-snowboard",
    "image": "http://127.0.0.1:9292/cdn/shop/files/Main_589fc064-24a2-4236-9eaf-13b2bd35d21d.jpg?v=1762879716&width=533",
    "price": "$699.95 USD"
  },
  {
    "title": "The Inventory Not Tracked Snowboard",
    "url": "/products/the-inventory-not-tracked-snowboard",
    "image": "http://127.0.0.1:9292/cdn/shop/files/snowboard_purple_hydrogen.png?v=1762879716&width=533",
    "price": "$949.95 USD"
  },
  {
    "title": "The Multi-location Snowboard",
    "url": "/products/the-multi-location-snowboard",
    "image": "http://127.0.0.1:9292/cdn/shop/files/Main_0a4e9096-021a-4c1e-8750-24b233166a12.jpg?v=1762879716&width=533",
    "price": "$729.95 USD"
  },
  {
    "title": "The Multi-managed Snowboard",
    "url": "/products/the-multi-managed-snowboard",
    "image": "http://127.0.0.1:9292/cdn/shop/files/Main_9129b69a-0c7b-4f66-b6cf-c4222f18028a.jpg?v=1762879718&width=533",
    "price": "$629.95 USD"
  },
  {
    "title": "The Out of Stock Snowboard",
    "url": "/products/the-out-of-stock-snowboard",
    "image": "http://127.0.0.1:9292/cdn/shop/files/Main_f44a9605-cd62-464d-b095-d45cdaa0d0d7.jpg?v=1762879716&width=533",
    "price": "$885.95 USD"
  },
  {
    "title": "The Videographer Snowboard",
    "url": "/products/the-videographer-snowboard",
    "image": "http://127.0.0.1:9292/cdn/shop/files/Main.jpg?v=1762879716&width=533",
    "price": "$885.95 USD"
  }
];


// Instantiate Google Gemini AI client with API key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY // Your Gemini API key here from .env
});

app.post('/recommend', async (req, res) => {
  const cart = req.body.cart;

  console.log(cart);
  console.clear();
  console.log("catalog: ");
  console.log(catalog);

  try {
    const cartDescription = cart.items.map(item =>
      `${item.title} (quantity: ${item.quantity})`
    ).join(',');

    const catalogDescription = catalog.map(prod =>
      prod.title
    ).join(',');

    const prompt = `You are a helpful Shopify AI.
Given the complete catalog: ${catalogDescription}.
And given the user's cart contents: ${cartDescription}.
Recommend 2 products from the catalog to complement the user's selection.
Return each suggestion as JSON objects in format: { title, reason, handle }.
Respond with only a JSON array of these objects.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt
    });

    const completionText = response.text;

    let suggestions;
    try {
      suggestions = JSON.parse(completionText);
    } catch (e) {
      const objectStrings = completionText.match(/\{[^}]*\}/g) || [];
      suggestions = objectStrings.map(objStr => {
        try {
          return JSON.parse(objStr);
        } catch {
          return null;
        }
      }).filter(Boolean);
    }

    res.json({ suggestions });
  } catch (err) {
    console.error('Gemini API backend error', err);
    res.json({ error: 'AI error', suggestions: [] });
  }
});


app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
