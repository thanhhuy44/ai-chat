import OpenAI from 'openai'

export const aiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, // This is the default and can be omitted
  baseURL: process.env.OPENAI_API_BASE_URL,
})
