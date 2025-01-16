import * as ai from '../services/gemini.service.js';

export const getResult = async (req, res) => {
    const { prompt } = req.query;
    console.log(req.query);
    try {
        const result = await ai.generateResult(prompt);
        res.send(result);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message }); 
    }
}