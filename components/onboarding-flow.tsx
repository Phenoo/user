"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, BookOpen, Target, Sparkles } from "lucide-react"

const TOTAL_STEPS = 5

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    challenges: [] as string[],
    shortTermGoal: "",
    longTermGoal: "",
    reminderPreference: "",
    studyTime: "",
    name: "",
  })

  const progress = (currentStep / TOTAL_STEPS) * 100

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleChallengeToggle = (challenge: string) => {
    setFormData((prev) => ({
      ...prev,
      challenges: prev.challenges.includes(challenge)
        ? prev.challenges.filter((c) => c !== challenge)
        : [...prev.challenges, challenge],
    }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Welcome to StudyFlow</h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto text-pretty">
                We understand that managing your studies can feel overwhelming. You're not alone in this journey, and
                we're here to help make it easier.
              </p>
            </div>
            <div className="space-y-4">
              <Input
                placeholder="What should we call you?"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="max-w-sm mx-auto"
              />
              <p className="text-sm text-muted-foreground">Let's start by getting to know you better</p>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                {formData.name ? `${formData.name}, what` : "What"} challenges do you face?
              </h2>
              <p className="text-muted-foreground text-pretty">
                It's completely normal to struggle with these. Select all that apply - we'll help you tackle them
                together.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: "procrastination",
                  label: "Procrastination",
                  icon: Clock,
                  description: "Putting off tasks until the last minute",
                },
                {
                  id: "time-management",
                  label: "Time Management",
                  icon: Clock,
                  description: "Struggling to organize your schedule",
                },
                {
                  id: "focus",
                  label: "Staying Focused",
                  icon: Target,
                  description: "Getting distracted while studying",
                },
                {
                  id: "motivation",
                  label: "Lack of Motivation",
                  icon: Sparkles,
                  description: "Finding it hard to get started",
                },
                {
                  id: "overwhelm",
                  label: "Feeling Overwhelmed",
                  icon: BookOpen,
                  description: "Too many tasks and deadlines",
                },
                {
                  id: "burnout",
                  label: "Academic Burnout",
                  icon: CheckCircle,
                  description: "Feeling exhausted and stressed",
                },
              ].map((challenge) => (
                <Card
                  key={challenge.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.challenges.includes(challenge.id)
                      ? "ring-2 ring-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleChallengeToggle(challenge.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={formData.challenges.includes(challenge.id)}
                        onChange={() => handleChallengeToggle(challenge.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <challenge.icon className="w-4 h-4 text-primary" />
                          <h3 className="font-medium text-foreground">{challenge.label}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">What do you want to achieve?</h2>
              <p className="text-muted-foreground text-pretty">
                Setting clear goals helps us create a personalized experience that works for you.
              </p>
            </div>
            <div className="space-y-6 max-w-lg mx-auto">
              <div className="space-y-2">
                <Label htmlFor="short-term" className="text-base font-medium">
                  Short-term goal (next few weeks)
                </Label>
                <Input
                  id="short-term"
                  placeholder="e.g., Finish assignments on time, improve study habits"
                  value={formData.shortTermGoal}
                  onChange={(e) => setFormData((prev) => ({ ...prev, shortTermGoal: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="long-term" className="text-base font-medium">
                  Long-term goal (this semester/year)
                </Label>
                <Textarea
                  id="long-term"
                  placeholder="e.g., Maintain a 3.5 GPA, develop better work-life balance"
                  value={formData.longTermGoal}
                  onChange={(e) => setFormData((prev) => ({ ...prev, longTermGoal: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Tip:</strong> The best goals are specific and achievable. We'll help you break them down
                  into manageable steps.
                </p>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">How can we support you?</h2>
              <p className="text-muted-foreground text-pretty">
                Customize your experience so StudyFlow works the way you do.
              </p>
            </div>
            <div className="space-y-6 max-w-lg mx-auto">
              <div className="space-y-4">
                <Label className="text-base font-medium">When do you prefer to study?</Label>
                <RadioGroup
                  value={formData.studyTime}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, studyTime: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="morning" id="morning" />
                    <Label htmlFor="morning">Early morning (6-9 AM)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="day" id="day" />
                    <Label htmlFor="day">During the day (9 AM-6 PM)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="evening" id="evening" />
                    <Label htmlFor="evening">Evening (6-10 PM)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="night" id="night" />
                    <Label htmlFor="night">Late night (10 PM+)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">How would you like to be reminded?</Label>
                <RadioGroup
                  value={formData.reminderPreference}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, reminderPreference: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gentle" id="gentle" />
                    <Label htmlFor="gentle">Gentle nudges - I prefer subtle reminders</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="regular" id="regular" />
                    <Label htmlFor="regular">Regular check-ins - Keep me on track</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="minimal" id="minimal" />
                    <Label htmlFor="minimal">Minimal notifications - I'll check in myself</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">You're all set, {formData.name || "there"}!</h2>
              <div className="max-w-md mx-auto space-y-4">
                <p className="text-muted-foreground text-pretty">
                  Remember, it's completely okay to ask for help along the way. We're here to support you, and every
                  small step counts toward your success.
                </p>
                <div className="bg-primary/5 p-4 rounded-lg text-left">
                  <h3 className="font-medium text-foreground mb-2">Your personalized plan includes:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {formData.challenges.length > 0 && (
                      <li>• Strategies for {formData.challenges.slice(0, 2).join(" and ")}</li>
                    )}
                    {formData.shortTermGoal && <li>• Steps toward: {formData.shortTermGoal}</li>}
                    {formData.studyTime && <li>• Optimized for {formData.studyTime} study sessions</li>}
                    <li>• Progress tracking and gentle accountability</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>
              Step {currentStep} of {TOTAL_STEPS}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>

        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur">
          <CardContent className="p-8">
            {renderStep()}

            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-6 bg-transparent"
              >
                Back
              </Button>

              {currentStep === TOTAL_STEPS ? (
                <Button
                  onClick={() => {
                    // Handle completion - redirect to main app
                    console.log("Onboarding completed:", formData)
                  }}
                  className="px-6 bg-primary hover:bg-primary/90"
                >
                  Start Using StudyFlow
                </Button>
              ) : (
                <Button onClick={handleNext} className="px-6 bg-primary hover:bg-primary/90">
                  Continue
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
