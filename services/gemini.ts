
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Product, Review, ComparisonVerdict } from "../types";

const addToCartTool: FunctionDeclaration = {
  name: 'addToCart',
  parameters: {
    type: Type.OBJECT,
    description: 'Adds a product to the users shopping cart by its ID.',
    properties: {
      productId: {
        type: Type.STRING,
        description: 'The unique ID of the product to add.',
      },
    },
    required: ['productId'],
  },
};

export const geminiService = {
  async analyzeFace(base64Image: string, productName: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart = {
      inlineData: { mimeType: 'image/jpeg', data: base64Image },
    };
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { 
        parts: [
          imagePart, 
          { text: `Act as a luxury eyewear and beauty consultant. Analyze the user's face shape in this image. 
            The user is trying on: "${productName}". 
            1. Identify their face shape (Heart, Oval, Square, etc.). 
            2. Explain if this specific product complements that shape. 
            3. Give 1 professional styling tip. 
            Keep it under 60 words.` 
          }
        ] 
      }
    });
    return response.text || "You have a versatile facial structure that works well with this selection.";
  },

  async negotiate(product: Product, userOffer: string, history: any[]) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const minPrice = product.price * 0.92;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Product: ${product.name}. Price: $${product.price}. Min: $${minPrice.toFixed(2)}. User: "${userOffer}". History: ${JSON.stringify(history)}. Role: Silas, the witty merchant. Return JSON: {"message": "...", "dealClosed": boolean, "couponCode": "..."}`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  },

  async checkVibeCompatibility(base64Image: string, product: Product) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image } };
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [imagePart, { text: `Vibe Check for ${product.name}. Return JSON: {"score": number, "synergyReason": "...", "proTip": "..."}` }] },
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  },

  async searchByImage(base64Image: string, products: Product[]) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image } };
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, { text: "Detect items for search. Keywords only." }] }
    });
    return response.text?.trim() || "";
  },

  async searchProducts(query: string, products: Product[]) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Query: ${query}. Inventory: ${JSON.stringify(products.map(p=>({id:p.id,name:p.name})))}. Return JSON IDs array.`,
      config: { responseMimeType: "application/json" }
    });
    const ids = JSON.parse(response.text || "[]");
    return products.filter(p => ids.includes(p.id));
  },

  async compareProducts(p1: Product, p2: Product): Promise<ComparisonVerdict> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Compare: ${p1.name} vs ${p2.name}. Return JSON: summary, comparisonPoints, verdict.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  },

  async getGiftRecommendations(criteria: any, products: Product[]) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gift Finder for ${JSON.stringify(criteria)}. Catalog provided. Return JSON: intro, recommendations[productId, aiReason].`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  },

  async consult(history: any[], products: Product[]) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Personal Shopper. History: ${JSON.stringify(history)}. Return JSON: type (question/recommendation), text/reasoning, productIds.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  },

  async getShoppingAdvice(query: string, context: any) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Query: ${query}. Use addToCart tool if asked.`,
      config: { tools: [{ functionDeclarations: [addToCartTool] }] }
    });
    return { text: response.text, functionCalls: response.functionCalls };
  },

  async analyzeSpace(base64Image: string, productName: string): Promise<string> {
    return this.analyzeFace(base64Image, productName); // Aliased for consistency
  },

  async summarizeReviews(productName: string, reviews: Review[]) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize: ${productName} reviews. Bullet pros/cons.`,
    });
    return response.text;
  }
};
