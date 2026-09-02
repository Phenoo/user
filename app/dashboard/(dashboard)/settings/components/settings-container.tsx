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
  ArrowLeft,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import ProfileSettings from "./profile-settings";
import { BillingTabs } from "../../billing/_components/BillingTabs";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SubscriptionHistory } from "../../billing/_components/subscription-history";
import { InvoiceTable } from "../../billing/_components/invoice-table";
import { BillingOverview } from "../../billing/_components/billing-overview";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

type SettingsSection =
  | "profile"
  | "study"
  | "timer"
  | "notifications"
  | "goals"
  | "billing"
  | "account"
  | "privacy";

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

export function SettingsLayout() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  const searchParams = useSearchParams();
  const router = useRouter();

  const pathname = usePathname();

  const searchSection = searchParams.get("section") || "profile";

  useEffect(() => {
    if (searchSection) {
      router.push(`/dashboard/settings?section=${searchSection}`);
      //@ts-ignore
      setActiveSection(searchSection);
    }
  }, [searchSection, router]);

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="max-w-7xl mx-auto w-full  py-8">
        <div className="flex flex-col w-full lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 px-4 w-full">
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
  const user = useQuery(api.users.currentUser);
  const settings = useQuery(
    api.settings.getUserSettings,
    user?._id ? { userId: user._id } : "skip"
  );
  const updateSettings = useMutation(api.settings.updateUserSettings);
  const [reminderTime, setReminderTime] = useState("09:00");

  useEffect(() => {
    if (settings?.reminderTime) setReminderTime(settings.reminderTime);
  }, [settings?.reminderTime]);

  const updatePreference = async (
    preference:
      | "emailNotifications"
      | "pushNotifications"
      | "studyReminders"
      | "assignmentReminders"
      | "examReminders"
      | "weeklyReport",
    value: boolean
  ) => {
    try {
      await updateSettings({ [preference]: value });
    } catch (error) {
      console.error("Failed to update notification preference:", error);
      toast.error("Could not save notification preference");
    }
  };

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
          <CardTitle>Reminder Types</CardTitle>
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
            <Switch
              checked={settings?.studyReminders ?? true}
              disabled={!settings}
              onCheckedChange={(checked) =>
                void updatePreference("studyReminders", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Assignment Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Alert me when an assignment is due within seven days
              </p>
            </div>
            <Switch
              checked={settings?.assignmentReminders ?? true}
              disabled={!settings}
              onCheckedChange={(checked) =>
                void updatePreference("assignmentReminders", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Exam Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Notify me about upcoming exams, tests, and quizzes
              </p>
            </div>
            <Switch
              checked={settings?.examReminders ?? true}
              disabled={!settings}
              onCheckedChange={(checked) =>
                void updatePreference("examReminders", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Weekly Progress Report</Label>
              <p className="text-sm text-muted-foreground">
                Receive a weekly summary of study progress
              </p>
            </div>
            <Switch
              checked={settings?.weeklyReport ?? true}
              disabled={!settings}
              onCheckedChange={(checked) =>
                void updatePreference("weeklyReport", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery</CardTitle>
          <CardDescription>
            Set when you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Allow important reminders by email</p>
            </div>
            <Switch
              checked={settings?.emailNotifications ?? true}
              disabled={!settings}
              onCheckedChange={(checked) =>
                void updatePreference("emailNotifications", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Allow browser and device notifications</p>
            </div>
            <Switch
              checked={settings?.pushNotifications ?? true}
              disabled={!settings}
              onCheckedChange={(checked) =>
                void updatePreference("pushNotifications", checked)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminder-time">Daily Reminder Time</Label>
            <div className="flex gap-2">
              <Input
                id="reminder-time"
                type="time"
                value={reminderTime}
                onChange={(event) => setReminderTime(event.target.value)}
              />
              <Button
                disabled={!settings}
                onClick={() =>
                  void updateSettings({ reminderTime })
                    .then(() => toast.success("Reminder time saved"))
                    .catch(() => toast.error("Could not save reminder time"))
                }
              >
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GoalSettings() {
  const user = useQuery(api.users.currentUser);
  const settings = useQuery(
    api.settings.getUserSettings,
    user?._id ? { userId: user._id } : "skip"
  );
  const updateSettings = useMutation(api.settings.updateUserSettings);

  const [gpaScale, setGpaScale] = useState<"5.0" | "4.0">("5.0");
  const [targetGpa, setTargetGpa] = useState<string>("4.5");
  const [dailyHours, setDailyHours] = useState<string>("4");
  const [dailyPomodoros, setDailyPomodoros] = useState<string>("8");
  const [subjectsPerDay, setSubjectsPerDay] = useState<string>("3");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setGpaScale((settings.gpaScale as "5.0" | "4.0") || "5.0");
      setTargetGpa(
        settings.gpaTarget !== undefined
          ? String(settings.gpaTarget)
          : settings.gpaScale === "4.0"
            ? "3.8"
            : "4.5"
      );
      setDailyHours(
        settings.dailyStudyGoal
          ? String(settings.dailyStudyGoal / 60)
          : "4"
      );
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const parsedGpa = parseFloat(targetGpa);
      const maxGpa = gpaScale === "4.0" ? 4.0 : 5.0;
      const validGpa = !isNaN(parsedGpa)
        ? Math.min(Math.max(parsedGpa, 0), maxGpa)
        : gpaScale === "4.0"
          ? 3.8
          : 4.5;

      await updateSettings({
        gpaScale,
        gpaTarget: validGpa,
        dailyStudyGoal: parseFloat(dailyHours) ? parseFloat(dailyHours) * 60 : 240,
      });

      toast.success("Study goals and GPA scale updated successfully!");
    } catch (error) {
      console.error("Failed to update goal settings:", error);
      toast.error("Failed to update goal settings");
    } finally {
      setIsSaving(false);
    }
  };

  const maxAllowedGpa = gpaScale === "4.0" ? 4.0 : 5.0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Study Goals & GPA System</h2>
        <p className="text-muted-foreground mt-1">
          Set and track your academic targets and choose your institution's GPA scale.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grading System & GPA Scale</CardTitle>
          <CardDescription>
            Choose the grading system used by your university or program
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gpa-scale">Grading Scale</Label>
            <Select
              value={gpaScale}
              onValueChange={(val: "5.0" | "4.0") => {
                setGpaScale(val);
                if (val === "4.0" && parseFloat(targetGpa) > 4.0) {
                  setTargetGpa("3.8");
                } else if (val === "5.0" && parseFloat(targetGpa) <= 4.0) {
                  setTargetGpa("4.5");
                }
              }}
            >
              <SelectTrigger id="gpa-scale" className="w-full">
                <SelectValue placeholder="Select grading scale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5.0">
                  Nigerian 5-Point System (NUC) — 70%+ = A (5.0)
                </SelectItem>
                <SelectItem value="4.0">
                  Standard 4.0 Scale (US) — 93%+ = A (4.0)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {gpaScale === "5.0"
                ? "Nigerian NUC Standard: A (70-100%) = 5.0, B (60-69%) = 4.0, C (50-59%) = 3.0, D (45-49%) = 2.0, E (40-44%) = 1.0, F (<40%) = 0.0"
                : "Standard US Scale: A+/A (93-100%) = 4.0, B (83-86%) = 3.0, C (73-76%) = 2.0, D (60-66%) = 1.0, F (<60%) = 0.0"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-gpa">
              Target GPA (0.0 – {maxAllowedGpa.toFixed(1)})
            </Label>
            <Input
              id="target-gpa"
              type="number"
              value={targetGpa}
              onChange={(e) => setTargetGpa(e.target.value)}
              min="0"
              max={maxAllowedGpa}
              step="0.05"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Study Routine</CardTitle>
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
              value={dailyHours}
              onChange={(e) => setDailyHours(e.target.value)}
              min="1"
              max="16"
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
              value={dailyPomodoros}
              onChange={(e) => setDailyPomodoros(e.target.value)}
              min="1"
              max="30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subjects-per-day">Subjects to Study Per Day</Label>
            <Input
              id="subjects-per-day"
              type="number"
              value={subjectsPerDay}
              onChange={(e) => setSubjectsPerDay(e.target.value)}
              min="1"
              max="10"
            />
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="mt-2">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving Goals...
              </>
            ) : (
              "Save Goal Settings"
            )}
          </Button>
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const user = useQuery(api.users.currentUser);
  const cancelSub = useMutation(api.subscriptions.cancelSubscription);
  const subscription = useQuery(
    api.subscriptions.getCurrentSubscription,
    user ? { userId: user._id } : "skip"
  );
  const invoices = useQuery(
    api.subscriptions.getInvoices,
    user ? { userId: user._id } : "skip"
  );
  const totalSpent =
    invoices?.reduce((sum, invoice) => sum + invoice.amount, 0) || 0;
  const nextBillingDate = subscription?.currentPeriodEnd;

  const handleOpen = async () => {
    if (!subscription?.polarCustomerId) {
      toast.error("No active subscription found for user");
      return;
    }

    try {
      const response = await fetch("/api/customer-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: subscription.polarCustomerId,
        }),
      });

      const result = await response.json();
      const portalUrl =
        result?.data?.customer_portal_url ||
        result?.data?.url ||
        result?.customer_portal_url ||
        result?.url;

      if (portalUrl) {
        window.open(portalUrl, "_blank", "noopener,noreferrer");
      } else {
        toast.error("Could not retrieve customer portal URL");
      }
    } catch (error) {
      console.error("Failed to open customer portal:", error);
      toast.error("Failed to open customer portal");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <BillingOverview
            //@ts-ignore
            subscription={subscription || null}
            totalSpent={totalSpent}
            nextBillingDate={nextBillingDate}
          />
        );

      case "payment-methods":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods and billing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Payment methods are managed through Polar
                </p>
                <Button variant="outline" onClick={handleOpen}>
                  Open Polar Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "billing-history":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View all your past invoices and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoices && invoices.length > 0 ? (
                <InvoiceTable invoices={invoices} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No billing history available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "subscription-history":
        return (
          <SubscriptionHistory
            events={subscription ? [subscription as any] : []}
          />
        );

      default:
        return null;
    }
  };

  if (
    user === undefined ||
    subscription === undefined ||
    invoices === undefined
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold">Billing & Plans</h1>
            <p className="text-muted-foreground mt-1">
              Manage your subscription and billing information
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <BillingTabs />
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
