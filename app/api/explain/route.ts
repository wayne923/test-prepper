import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY!,
// })

export async function POST(req: NextRequest) {

    try {
        // Initialize OpenAI inside the function
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY || '',
        })
        
        // Check if API key exists
        if (!process.env.OPENAI_API_KEY) {
          return NextResponse.json(
            { error: 'OpenAI API key not configured' },
            { status: 500 }
          )
        }
    
        const { questionId, userAnswerChoice } = await req.json()

        const question = await prisma.question.findUnique({
            where: { id: questionId }
        })

        if (!question) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404})
        }

        const prompt = `
        You are a friendly SAT Math tutor. A student just answered incorrectly.

        Question: "${question.prompt}"
        Student chose: ${userAnswerChoice}
        Correct answer: ${question.correctChoice}

        Provide a helpful 2-3 sentence explanation that:
        1. Ackonwledges their mistake kindly
        2. Explains why their answer is wrong
        3. Shows how to get the correct answer

        Keep it conversational and encouraging.
        `

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0,
            max_tokens: 150
        })

        return NextResponse.json({
            explanation: response.choices[0].message.content
        })
    } catch (error) {
        console.error('OpenAI API error:', error)
        return NextResponse.json(
            { error: 'Failed to generated explanation' },
            { status: 500 }
        )
    }
}