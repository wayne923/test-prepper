'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

interface Question {
  id: string
  prompt: string
  choices: Record<string, string>
  correctChoice: string
}

export default function DiagnosticFlow() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [selectedChoice, setSelectedChoice] = useState<string>('')
  const [startTime, setStartTime] = useState<number>(Date.now())

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    const response = await fetch('/api/diagnostic')
    const data = await response.json()
    setQuestions(data)
  }

  const handleNext = async () => {
    // Record answer
    const timeSpent = Date.now() - startTime
    setAnswers({
      ...answers,
      [questions[currentStep].id]: {
        selectedIdx: selectedChoice.charCodeAt(0) - 65, // Convert A->0, B->1, etc
        msTaken: timeSpent
      }
    })

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
      setSelectedChoice('')
      setStartTime(Date.now())
    } else {
      // Submit diagnostic
      await submitDiagnostic()
    }
  }

  const submitDiagnostic = async () => {
    const response = await fetch('/api/diagnostic/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: Object.entries(answers).map(([questionId, data]) => ({
        questionId,
        ...data
      })) })
    })
    
    if (response.ok) {
      router.push('/result')
    }
  }

  if (questions.length === 0) {
    return <div>Loading...</div>
  }

  const currentQuestion = questions[currentStep]
  const progress = ((currentStep + 1) / questions.length) * 100

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500">
            Question {currentStep + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="mb-4" />
        <CardTitle>{currentQuestion.prompt}</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedChoice} onValueChange={setSelectedChoice}>
          {Object.entries(currentQuestion.choices).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value={key} id={key} />
              <Label htmlFor={key} className="cursor-pointer">
                {key}. {value}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <Button 
          onClick={handleNext} 
          disabled={!selectedChoice}
          className="w-full mt-6"
        >
          {currentStep < questions.length - 1 ? 'Next Question' : 'See Results'}
        </Button>
      </CardContent>
    </Card>
  )
}