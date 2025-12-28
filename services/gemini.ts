
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Product, Review, ComparisonVerdict } from "../types";

// Note: API_KEY is managed externally and accessed via process.env.API_KEY

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
  // Consultation logic for personalized shopping assistance
  async consult(
    history: { role: 'user' | 'assistant', content: string }[],
    products: Product[]
  ) {
    /* Always instantiate GoogleGenAI right before use with process.env.API_KEY */
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const productContext = JSON.stringify(products.map(p => ({ id: p.id, name: p.name, category: p.category, tags: p.tags, price: p.price })));
    
    /* Using gemini-3-pro-preview for complex reasoning task */
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `
        You are an elite personal shopper at NovaMart. 
        Inventory: ${productContext}
        
        Conversation History: ${JSON.stringify(history)}
        
        Goal: Ask questions to find the best product. 
        If you have enough information (usually after 2-3 questions), stop asking and provide recommendations.
        
        Rules:
        1. If you are still asking questions, return a JSON object: {"type": "question", "text": "your question here"}
        2. If you are ready to recommend, return a JSON object: {"type": "recommendation", "reasoning": "summary of why these fit", "productIds": ["id1", "id2"]}
      `,
      config: {
        responseMimeType: "application/json",
      }
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      return { type: "question", text: "I'm sorry, I'm having a bit of trouble thinking. What else can you tell me about what you need?" };
    }
  },

  // Vision-based analysis of a room space
  async analyzeSpace(base64Image: string, productName: string) {
    /* Always instantiate GoogleGenAI right before use with process.env.API_KEY */
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    };
    
    /* Using gemini-3-pro-preview for detailed visual reasoning */
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { 
        parts: [
          imagePart, 
          { text: `Analyze this room photo. How would the "${productName}" look in this space? Consider lighting, style, and placement. Provide a professional, encouraging interior design perspective in 3-4 sentences.` }
        ] 
      },
    });

    return response.text;
  },

  // General shopping advice with tool support
  async getShoppingAdvice(
    query: string, 
    context: { products: Product[], cart: any[], history: any[] }
  ) {
    /* Always instantiate GoogleGenAI right before use with process.env.API_KEY */
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    /* Using gemini-3-pro-preview for complex reasoning and tool usage */
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `User Query: ${query}\n\nAvailable Products Context: ${JSON.stringify(context.products.map(p => ({ id: p.id, name: p.name, price: p.price, stock: p.stock })))}\nUser Cart: ${JSON.stringify(context.cart)}\n\nAct as a helpful shopping assistant for NovaMart. Suggest specific products from our inventory. You can use the addToCart tool if a user explicitly asks to add a specific item.`,
      config: {
        tools: [{ functionDeclarations: [addToCartTool] }],
      }
    });

    return {
      text: response.text,
      functionCalls: response.functionCalls
    };
  },

  // Summary generation for product reviews
  async summarizeReviews(productName: string, reviews: Review[]) {
    /* Always instantiate GoogleGenAI right before use with process.env.API_KEY */
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const reviewsText = reviews.map(r => `[Rating: ${r.rating}/5] ${r.comment}`).join('\n');
    /* Using gemini-3-flash-preview for standard text summarization task */
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Product: ${productName}\nReviews:\n${reviewsText}\n\nSummarize these reviews into: 1. Overall Sentiment, 2. Key Pros, 3. Key Cons. Use bullet points. Keep it concise.`,
    });
    return response.text;
  },

  // Side-by-side product comparison reasoning
  async compareProducts(productA: Product, productB: Product): Promise<ComparisonVerdict> {
    /* Always instantiate GoogleGenAI right before use with process.env.API_KEY */
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    /* Using gemini-3-pro-preview for advanced analytical comparison */
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Compare these two products:\nProduct A: ${JSON.stringify(productA)}\nProduct B: ${JSON.stringify(productB)}\n\nProvide a side-by-side comparison in JSON format with summary, key points, and a final verdict on which is better for different user profiles.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            comparisonPoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  feature: { type: Type.STRING },
                  productA: { type: Type.STRING },
                  productB: { type: Type.STRING },
                },
                required: ['feature', 'productA', 'productB']
              }
            },
            verdict: { type: Type.STRING }
          },
          required: ['summary', 'comparisonPoints', 'verdict']
        }
      }
    });
    return JSON.parse(response.text || "{}");
  },

  // Intelligent product bundle suggestions
  async suggestBundle(mainProduct: Product, allProducts: Product[]) {
    /* Always instantiate GoogleGenAI right before use with process.env.API_KEY */
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    /* Using gemini-3-flash-preview for creative product pairing */
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Main Product: ${mainProduct.name} (${mainProduct.category})\nCatalog: ${JSON.stringify(allProducts.map(p => ({ id: p.id, name: p.name, category: p.category })))}\n\nSuggest 2 products that would form a perfect "bundle" or "outfit" with the main product. Return a JSON array of product IDs.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    try {
      const ids = JSON.parse(response.text || "[]");
      return allProducts.filter(p => ids.includes(p.id));
    } catch (e) {
      return [];
    }
  },

  // Semantic search across the product catalog
  async searchProducts(query: string, products: Product[]) {
    /* Always instantiate GoogleGenAI right before use with process.env.API_KEY */
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    /* Using gemini-3-flash-preview for quick semantic mapping */
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search Query: "${query}"\nProducts List: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, tags: p.tags, desc: p.description })))}\n\nReturn ONLY a JSON array of product IDs that match the query.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    try {
        const matchingIds = JSON.parse(response.text || "[]") as string[];
        return products.filter(p => matchingIds.includes(p.id));
    } catch (e) {
        return products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    }
  },

  // Identifying products from uploaded images
  async searchByImage(base64Image: string, products: Product[]) {
    /* Always instantiate GoogleGenAI right before use with process.env.API_KEY */
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    };
    
    /* Using gemini-3-flash-preview for image recognition and catalog matching */
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
        parts: [
          imagePart, 
          { text: `Identify items in this image. Catalog: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name })))}\nReturn JSON array of matching product IDs.` }
        ] 
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    try {
        const matchingIds = JSON.parse(response.text || "[]") as string[];
        return products.filter(p => matchingIds.includes(p.id));
    } catch (e) {
        return [];
    }
  }
};
