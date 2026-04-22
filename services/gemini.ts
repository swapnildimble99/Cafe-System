import { GoogleGenAI } from "@google/genai";
import { MenuItem } from "../types";

const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.warn("API_KEY not found in environment variables");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const getChefRecommendation = async (selectedItems: MenuItem[]): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "Our chef recommends trying our signature pastries!";

    const itemNames = selectedItems.map(i => i.name).join(", ");
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `The customer has ordered: ${itemNames}. 
            Suggest ONE complementary item from a general cafe menu (like a specific pastry, drink, or side) that pairs well with these. 
            Keep it short (max 20 words). Tone: Sophisticated cafe chef.`,
        });
        return response.text || "Try our house special cheesecake!";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Enjoy your meal!";
    }
};

export const getBillNote = async (customerName: string, total: number): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "Thank you for dining with us!";

    try {
         const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write a very short, warm, poetic thank you note for a cafe receipt. Customer: ${customerName}, Total: $${total}. Max 15 words.`,
        });
        return response.text || "Thank you for visiting Cafe Aura.";
    } catch (error) {
        return "Thank you for visiting Cafe Aura.";
    }
}
