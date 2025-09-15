"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Clock,
  BookOpen,
  Target,
  Sparkles,
  User,
  GraduationCap,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { CountryDropdown } from "./country-dropdown";
import { universities_data } from "@/app/dashboard/(dashboard)/list-universities";

const TOTAL_STEPS = 5;

export function MainOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);

  const router = useRouter();
  const [formData, setFormData] = useState({
    schoolEmail: "",
    school: "",
    course: "",
    year: "",
    major: "",
    location: "United States",
    challenges: [] as string[],
    shortTermGoal: "",
    longTermGoal: "",
    reminderPreference: "",
    studyTime: "",
    name: "",
    isOnboarding: false,
    userId: "" as Id<"users">,
  });

  const [selectedCountry, setSelectedCountry] = useState("USA");
  const [universities, setUniversities] = useState<any[]>([]);
  const [didntFind, setDidntFind] = useState(false);

  // Fetch universities whenever country changes
  // useEffect(() => {
  //   if (!formData.location) return;
  //   fetch(
  //     `http://universities.hipolabs.com/search?country=${formData.location}`
  //   )
  //     .then((res) => res.json())
  //     .then((data) => setUniversities(data))
  //     .catch((err) => console.error(err));
  // }, [formData.location]);
  useEffect(() => {
    if (!formData.location) return;

    const country = universities_data.filter(
      (item, i) => item.country === formData.location
    );
    setUniversities(country);
  }, [formData.location]);
  const searchParams = useSearchParams();

  const updateUser = useMutation(api.users.updateUser);
  const user = useQuery(api.users.currentUser);

  const step = Number(searchParams.get("step") || currentStep);

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const saveProgress = async (data: typeof formData) => {
    try {
      await updateUser(data);
      toast.success(`Step ${step} sucess!`);
    } catch (err) {
      console.error("Failed to save onboarding data", err);
    }
  };

  const handleNext = async () => {
    await saveProgress(formData);
    if (step < TOTAL_STEPS) {
      const nextStep = step + 1;
      setCurrentStep(nextStep);
      router.push(`/dashboard/onboarding?step=${nextStep}`);
    }
  };

  const handleBack = async () => {
    await saveProgress(formData);
    if (step > 1) {
      const prevStep = step - 1;
      setCurrentStep(prevStep);
      router.push(`/dashboard/onboarding?step=${prevStep}`);
    }
  };

  const handleChallengeToggle = (challenge: string) => {
    setFormData((prev) => ({
      ...prev,
      challenges: prev.challenges.includes(challenge)
        ? prev.challenges.filter((c) => c !== challenge)
        : [...prev.challenges, challenge],
    }));
  };

  useEffect(() => {
    if (user) {
      setFormData({
        schoolEmail: user.schoolEmail || "",
        school: user.school || "",
        course: user.course || "",
        year: user.year || "",
        major: user.major || "",
        location: user.location || "",
        challenges: user.challenges || [],
        shortTermGoal: user.shortTermGoal || "",
        longTermGoal: user.longTermGoal || "",
        reminderPreference: user.reminderPreference || "",
        studyTime: user.studyTime || "",
        name: user.name || "",
        isOnboarding: false,
        userId: user._id,
      });
    }
  }, [user]);

  const renderStep = () => {
    switch (Number(step)) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-xl md:text-3xl font-bold text-foreground">
                Welcome to StudyFlow
              </h1>
              <p className="text-sm md:text-lg text-muted-foreground max-w-md mx-auto text-pretty">
                We understand that managing your studies can feel overwhelming.
                Let's get to know you and create a personalized experience.
              </p>
            </div>
            <div className="space-y-4 max-w-sm mx-auto">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-left block">
                  What should we call you?
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-left block">
                  School Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@university.edu"
                  value={formData.schoolEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      schoolEmail: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Tell us about your studies
              </h2>
              <p className="text-muted-foreground text-pretty">
                This helps us understand your academic environment and provide
                relevant resources.
              </p>
            </div>
            <div className="space-y-4 max-w-lg mx-auto">
              <CountryDropdown
                placeholder="Select country"
                defaultValue={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.alpha3);
                  setFormData((prev) => ({
                    ...prev,
                    location: e.name,
                  }));
                }}
              />
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school" className="text-base font-medium">
                    School/University
                  </Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="School/University" />
                    </SelectTrigger>
                    <SelectContent>
                      {universities.map((item, i) => (
                        <SelectItem value={item.name} key={i}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2 items-center my-4 text-sm md:text-base">
                    <Checkbox
                      checked={didntFind}
                      onCheckedChange={() => setDidntFind(!didntFind)}
                      className="size-5 border-foreground"
                    />
                    Didn&apos;t find my university here
                  </div>
                  {didntFind && (
                    <Input
                      id="school"
                      placeholder="e.g., Stanford University"
                      value={formData.school}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          school: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="major" className="text-base font-medium">
                  Major/Field of Study
                </Label>
                <Input
                  id="major"
                  placeholder="e.g., Computer Science, Psychology"
                  value={formData.major}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, major: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course" className="text-base font-medium">
                    Current Program
                  </Label>
                  <Input
                    id="course"
                    placeholder="e.g., Bachelor's in Engineering"
                    value={formData.course}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        course: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-medium">Academic Year</Label>
                  <Select
                    value={formData.year}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, year: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="freshman">
                        Freshman/1st Year
                      </SelectItem>
                      <SelectItem value="sophomore">
                        Sophomore/2nd Year
                      </SelectItem>
                      <SelectItem value="junior">Junior/3rd Year</SelectItem>
                      <SelectItem value="senior">Senior/4th Year</SelectItem>
                      <SelectItem value="graduate">Graduate Student</SelectItem>
                      <SelectItem value="phd">PhD Student</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                {formData.name ? `${formData.name}, what` : "What"} challenges
                do you face?
              </h2>
              <p className="text-muted-foreground text-pretty">
                It's completely normal to struggle with these. Select all that
                apply - we'll help you tackle them together.
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
                  className={`cursor-pointer transition-all border hover:shadow-md ${
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
                          <h3 className="font-medium text-foreground">
                            {challenge.label}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {challenge.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                What do you want to achieve?
              </h2>
              <p className="text-muted-foreground text-pretty">
                Setting clear goals helps us create a personalized experience
                that works for you.
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      shortTermGoal: e.target.value,
                    }))
                  }
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      longTermGoal: e.target.value,
                    }))
                  }
                  rows={5}
                />
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Tip:</strong> The best goals are specific and
                  achievable. We'll help you break them down into manageable
                  steps.
                </p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                How can we support you?
              </h2>
              <p className="text-muted-foreground text-pretty">
                Customize your experience so StudyFlow works the way you do.
              </p>
            </div>
            <div className="space-y-6 max-w-lg mx-auto">
              <div className="space-y-4">
                <Label className="text-base font-medium">
                  When do you prefer to study?
                </Label>
                <RadioGroup
                  value={formData.studyTime}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, studyTime: value }))
                  }
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
                <Label className="text-base font-medium">
                  How would you like to be reminded?
                </Label>
                <RadioGroup
                  value={formData.reminderPreference}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      reminderPreference: value,
                    }))
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gentle" id="gentle" />
                    <Label htmlFor="gentle">
                      Gentle nudges - I prefer subtle reminders
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="regular" id="regular" />
                    <Label htmlFor="regular">
                      Regular check-ins - Keep me on track
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="minimal" id="minimal" />
                    <Label htmlFor="minimal">
                      Minimal notifications - I'll check in myself
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="text-center pt-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  You're all set, {formData.name || "there"}!
                </h3>
                <p className="text-muted-foreground text-pretty mb-4">
                  Remember, it's completely okay to ask for help along the way.
                  We're here to support you, and every small step counts toward
                  your success.
                </p>
                <div className="bg-primary/5 p-4 rounded-lg text-left">
                  <h4 className="font-medium text-foreground mb-2">
                    Your personalized plan includes:
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {formData.challenges.length > 0 && (
                      <li>
                        • Strategies for{" "}
                        {formData.challenges.slice(0, 2).join(" and ")}
                      </li>
                    )}
                    {formData.shortTermGoal && (
                      <li>• Steps toward: {formData.shortTermGoal}</li>
                    )}
                    {formData.studyTime && (
                      <li>
                        • Optimized for {formData.studyTime} study sessions
                      </li>
                    )}
                    <li>• Progress tracking and gentle accountability</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full h-full max-w-2xl">
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>
              Step {step} of {TOTAL_STEPS}
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
                disabled={step === 1}
                className="px-6 bg-transparent"
              >
                Back
              </Button>

              {currentStep === TOTAL_STEPS ? (
                <Button
                  onClick={async () => {
                    await saveProgress({ ...formData, isOnboarding: true });
                    router.push("/dashboard/pricing");
                  }}
                  className="px-6 bg-primary hover:bg-primary/90"
                >
                  Start Using StudyFlow
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="px-6 bg-primary hover:bg-primary/90"
                >
                  Continue
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
