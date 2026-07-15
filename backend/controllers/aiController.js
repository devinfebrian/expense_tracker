import { GoogleGenAI } from '@google/genai';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import Category from '../models/Category.js';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const getInsights = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user_id: req.user.user_id })
      .sort({ date: -1 })
      .limit(100);

    const budgets = await Budget.find({ user_id: req.user.user_id });

    const transactionsData = transactions.map(t => ({
      amount: t.amount,
      category: t.category_name || t.category || 'Others',
      merchant: t.merchant || '',
      date: t.date ? t.date.toISOString().split('T')[0] : '',
      notes: t.notes || ''
    }));

    const budgetsData = budgets.map(b => ({
      category: b.category_name,
      limit: b.limit,
      type: b.type,
      period: b.period
    }));

    const prompt = `
You are a professional personal finance advisor. Analyze the following user expense and budget data.
Transactions (last 100):
${JSON.stringify(transactionsData, null, 2)}

Active Budgets:
${JSON.stringify(budgetsData, null, 2)}

Provide a structured analysis. You must output ONLY a valid JSON object matching the following structure:
{
  "financialHealthScore": <number between 1 and 100 based on budget limits and expense habits>,
  "insights": [
    {
      "category": "<category name or General>",
      "title": "<short visual title>",
      "description": "<detailed insight analysis, e.g. you spent 30% more on food>",
      "type": "<warning | success | info>"
    }
  ],
  "recommendations": [
    {
      "title": "<recommendation title>",
      "description": "<detailed description of action plan>"
    }
  ]
}
Respond with only the raw JSON. Do not wrap in markdown tags like \`\`\`json.
`;

    console.log(`[AI] Starting Gemini API request for getInsights...`);
    const startTime = Date.now();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
    });
    const duration = Date.now() - startTime;
    console.log(`[AI] Gemini API request for getInsights finished in ${duration}ms`);

    let rawText = response.text || '';
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedData = JSON.parse(rawText);
    res.json({ status: 'success', data: parsedData });
  } catch (err) {
    console.error('AI Insights Error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const parseExpense = async (req, res) => {
  try {
    const { text, image, mimeType } = req.body;

    // Fetch all user categories from DB to map to them
    const categories = await Category.find({});
    const categoryNames = categories.map(c => c.category_name);

    const prompt = `
Analyze the following expense input (which might be a receipt image or a natural language text description).
Extract the transaction details. Map the category to one of these existing categories if applicable:
${JSON.stringify(categoryNames)}
If no existing category matches, map it to "Others".

Respond ONLY with a valid raw JSON object matching the following structure:
{
  "amount": <number representing the total amount/cost, or null if not found>,
  "category": "<best matching category name from the list, or 'Others'>",
  "merchant": "<merchant/store name, or null>",
  "date": "<date of the transaction in YYYY-MM-DD format, or the current date if not found>",
  "notes": "<a short note describing what was bought>"
}
Do not write markdown formatting codeblocks. Just return raw JSON.
`;

    let contents = [];
    if (image) {
      const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;
      contents.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType || 'image/jpeg'
        }
      });
    } else if (text) {
      contents.push(text);
    } else {
      return res.status(400).json({ status: 'error', message: 'Either text or image is required' });
    }

    contents.push(prompt);

    console.log(`[AI] Starting Gemini API request for parseExpense...`);
    const startTime = Date.now();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: contents,
    });
    const duration = Date.now() - startTime;
    console.log(`[AI] Gemini API request for parseExpense finished in ${duration}ms`);

    let rawText = response.text || '';
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedData = JSON.parse(rawText);
    res.json({ status: 'success', data: parsedData });
  } catch (err) {
    console.error('AI Parse Expense Error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
