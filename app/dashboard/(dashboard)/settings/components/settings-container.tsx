"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Settings,
  Shield,
  Bell,
  Timer,
  BookOpen,
  Target,
  Trash2,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type SettingsSection =
  | "profile"
  | "study"
  | "timer"
  | "notifications"
  | "goals"
  | "billing"
  | "account"
  | "privacy";

export function SettingsLayout() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  const searchParams = useSearchParams();
  const router = useRouter();

  const searchSection = searchParams.get("section");

  useEffect(() => {
    if (searchSection) {
      router.push(`/dashboard/settings?section=${searchSection}`);
      //@ts-ignore
      setActiveSection(searchSection);
    }
  }, [searchSection, router]);

  const sidebarItems = [
    { id: "profile" as const, label: "Profile Settings", icon: User },
    { id: "study" as const, label: "Study Preferences", icon: BookOpen },
    { id: "timer" as const, label: "Timer Settings", icon: Timer },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "goals" as const, label: "Study Goals", icon: Target },
    { id: "billing" as const, label: "Billing & Plans", icon: CreditCard },
    { id: "account" as const, label: "Account Security", icon: Shield },
    { id: "privacy" as const, label: "Privacy & Data", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? "bg-primary/10 text-foreground border border-primary/20"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
              <Separator className="my-4" />
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeSection === "profile" && <ProfileSettings />}
            {activeSection === "study" && <StudyPreferences />}
            {activeSection === "timer" && <TimerSettings />}
            {activeSection === "notifications" && <NotificationSettings />}
            {activeSection === "goals" && <GoalSettings />}
            {activeSection === "billing" && <BillingSettings />}
            {activeSection === "account" && <AccountSecurity />}
            {activeSection === "privacy" && <PrivacySettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Profile Settings</h2>
        <p className="text-muted-foreground mt-1">
          Manage your personal information and academic details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your basic profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Enter your full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@university.edu"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="school">School/University</Label>
              <Input id="school" placeholder="Your university name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="major">Major/Course</Label>
              <Input id="major" placeholder="Computer Science" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Academic Year</Label>
              <Input id="year" placeholder="Sophomore" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="City, Country" />
            </div>
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function StudyPreferences() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Study Preferences</h2>
        <p className="text-muted-foreground mt-1">
          Customize your study environment and learning preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Learning Style</CardTitle>
          <CardDescription>Tell us how you learn best</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Visual Learning</Label>
              <p className="text-sm text-muted-foreground">
                Prefer charts, diagrams, and visual aids
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Audio Learning</Label>
              <p className="text-sm text-muted-foreground">
                Learn better with background music or sounds
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Kinesthetic Learning</Label>
              <p className="text-sm text-muted-foreground">
                Need breaks for movement and hands-on activities
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Study Environment</CardTitle>
          <CardDescription>Set your ideal study conditions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="study-location">Preferred Study Location</Label>
            <Input
              id="study-location"
              placeholder="Library, Dorm, Coffee Shop"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Quiet Environment</Label>
              <p className="text-sm text-muted-foreground">
                Prefer complete silence while studying
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Group Study</Label>
              <p className="text-sm text-muted-foreground">
                Enjoy studying with classmates
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TimerSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Timer Settings</h2>
        <p className="text-muted-foreground mt-1">
          Customize your Pomodoro timer and study session preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pomodoro Configuration</CardTitle>
          <CardDescription>
            Adjust timer durations to match your focus patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="work-duration">Work Duration (minutes)</Label>
              <Input
                id="work-duration"
                type="number"
                defaultValue="25"
                min="5"
                max="90"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="short-break">Short Break (minutes)</Label>
              <Input
                id="short-break"
                type="number"
                defaultValue="5"
                min="1"
                max="15"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="long-break">Long Break (minutes)</Label>
              <Input
                id="long-break"
                type="number"
                defaultValue="15"
                min="10"
                max="60"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="long-break-interval">Long Break Interval</Label>
            <Input
              id="long-break-interval"
              type="number"
              defaultValue="4"
              min="2"
              max="8"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Take a long break after this many work sessions
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Auto-start Breaks</Label>
              <p className="text-sm text-muted-foreground">
                Automatically start break timers
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Auto-start Work Sessions</Label>
              <p className="text-sm text-muted-foreground">
                Automatically start work sessions after breaks
              </p>
            </div>
            <Switch />
          </div>
          <Button>Save Timer Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Notifications</h2>
        <p className="text-muted-foreground mt-1">
          Control how and when you receive study reminders and updates.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Study Reminders</CardTitle>
          <CardDescription>
            Get notified about your study schedule and goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Daily Study Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Remind me to start my daily study sessions
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Break Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Alert me when it's time for a break
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Goal Progress Updates</Label>
              <p className="text-sm text-muted-foreground">
                Weekly progress reports on study goals
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Motivational Messages</Label>
              <p className="text-sm text-muted-foreground">
                Encouraging messages during study sessions
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Timing</CardTitle>
          <CardDescription>
            Set when you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quiet-hours-start">Quiet Hours Start</Label>
            <Input id="quiet-hours-start" type="time" defaultValue="22:00" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quiet-hours-end">Quiet Hours End</Label>
            <Input id="quiet-hours-end" type="time" defaultValue="07:00" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GoalSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Study Goals</h2>
        <p className="text-muted-foreground mt-1">
          Set and track your academic and productivity goals.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Goals</CardTitle>
          <CardDescription>
            Set targets for your daily study routine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="daily-hours">Daily Study Hours Target</Label>
            <Input
              id="daily-hours"
              type="number"
              defaultValue="4"
              min="1"
              max="12"
              step="0.5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="daily-pomodoros">
              Daily Pomodoro Sessions Target
            </Label>
            <Input
              id="daily-pomodoros"
              type="number"
              defaultValue="8"
              min="1"
              max="20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subjects-per-day">Subjects to Study Per Day</Label>
            <Input
              id="subjects-per-day"
              type="number"
              defaultValue="3"
              min="1"
              max="8"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Academic Goals</CardTitle>
          <CardDescription>
            Track your semester and course objectives
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target-gpa">Target GPA</Label>
            <Input
              id="target-gpa"
              type="number"
              defaultValue="3.5"
              min="0"
              max="4"
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="graduation-date">Expected Graduation</Label>
            <Input id="graduation-date" type="date" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Honor Roll Goal</Label>
              <p className="text-sm text-muted-foreground">
                Aim for honor roll this semester
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AccountSecurity() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Account Security</h2>
        <p className="text-muted-foreground mt-1">
          Manage your account security and login preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your account password for better security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" />
            </div>
          </div>
          <Button>Change Password</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable 2FA</Label>
              <p className="text-sm text-muted-foreground">
                Require a verification code when signing in
              </p>
            </div>
            <Switch />
          </div>
          <Button variant="outline">Set Up Authenticator App</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage devices where you're currently signed in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Current Device</p>
                <p className="text-sm text-muted-foreground">
                  Chrome on MacOS • Last active now
                </p>
              </div>
              <Button variant="outline" size="sm">
                Current
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">iPhone</p>
                <p className="text-sm text-muted-foreground">
                  Safari on iOS • Last active 2 hours ago
                </p>
              </div>
              <Button variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PrivacySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Privacy & Data</h2>
        <p className="text-muted-foreground mt-1">
          Control your privacy settings and data usage preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Collection</CardTitle>
          <CardDescription>
            Choose what data we can collect to improve your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Study Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Allow collection of study patterns for insights
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Usage Statistics</Label>
              <p className="text-sm text-muted-foreground">
                Help improve the app with anonymous usage data
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Crash Reports</Label>
              <p className="text-sm text-muted-foreground">
                Automatically send crash reports to help fix bugs
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
          <CardDescription>
            Download your data or delete your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline">Download My Data</Button>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium text-destructive">Danger Zone</h4>
            <p className="text-sm text-muted-foreground">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <Button variant="destructive">Delete My Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BillingSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Billing & Plans</h2>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and billing information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Current Plan
            <Badge variant="secondary">Student Free</Badge>
          </CardTitle>
          <CardDescription>
            You're currently on the free student plan with basic features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium">Study Sessions</h4>
              <p className="text-2xl font-bold text-primary">∞</p>
              <p className="text-sm text-muted-foreground">Unlimited</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium">Goal Tracking</h4>
              <p className="text-2xl font-bold text-primary">3</p>
              <p className="text-sm text-muted-foreground">Active goals</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium">Analytics</h4>
              <p className="text-2xl font-bold text-primary">7</p>
              <p className="text-sm text-muted-foreground">Days history</p>
            </div>
          </div>
          <Button className="w-full">
            Upgrade to Student Pro - $4.99/month
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Pro Benefits</CardTitle>
          <CardDescription>
            Unlock advanced features designed for serious students
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Unlimited goal tracking and custom categories</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Advanced analytics and progress insights</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Study group collaboration tools</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Calendar integration and smart scheduling</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Priority customer support</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Export study data and reports</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-6 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                VISA
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/26</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </div>
          <Button variant="outline" className="w-full bg-transparent">
            Add New Payment Method
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View your past payments and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Student Pro - Monthly</p>
                <p className="text-sm text-muted-foreground">Dec 1, 2024</p>
              </div>
              <div className="text-right">
                <p className="font-medium">$4.99</p>
                <Button variant="ghost" size="sm">
                  Download
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Student Pro - Monthly</p>
                <p className="text-sm text-muted-foreground">Nov 1, 2024</p>
              </div>
              <div className="text-right">
                <p className="font-medium">$4.99</p>
                <Button variant="ghost" size="sm">
                  Download
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Verification</CardTitle>
          <CardDescription>
            Verify your student status for discounted pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Student Status Verified</Label>
              <p className="text-sm text-muted-foreground">
                Valid until May 2025
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-green-600 border-green-600"
            >
              Verified
            </Badge>
          </div>
          <Button variant="outline">Update Student Information</Button>
        </CardContent>
      </Card>
    </div>
  );
}
