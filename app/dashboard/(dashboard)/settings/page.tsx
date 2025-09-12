import { SettingsLayout } from "./components/settings-container";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return <SettingsLayout />;
}

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Separator } from "@/components/ui/separator";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Slider } from "@/components/ui/slider";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   User,
//   GraduationCap,
//   Bell,
//   Shield,
//   Palette,
//   Trash2,
//   Camera,
//   Target,
//   Clock,
//   BookOpen,
//   Moon,
//   Sun,
//   Download,
//   LogOut,
//   ArrowLeft,
// } from "lucide-react";
// import Link from "next/link";

// export default function SettingsPage() {
//   const [gpaTarget, setGpaTarget] = useState([3.8]);
//   const [studyHoursGoal, setStudyHoursGoal] = useState([25]);
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [notifications, setNotifications] = useState({
//     taskReminders: true,
//     deadlineAlerts: true,
//     studyBreaks: false,
//     achievements: true,
//     weeklyReports: true,
//   });

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
//       {/* Header */}
//       <div className="border-b bg-card/50 backdrop-blur-sm">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center gap-4">
//             <div>
//               <h1 className="text-2xl font-bold">Settings</h1>
//               <p className="text-muted-foreground">
//                 Manage your account and study preferences
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-8">
//         <Tabs defaultValue="profile" className="space-y-6">
//           <TabsList className="grid w-full grid-cols-5 lg:w-fit">
//             <TabsTrigger value="profile" className="gap-2">
//               <User className="h-4 w-4" />
//               Profile
//             </TabsTrigger>
//             <TabsTrigger value="academic" className="gap-2">
//               <GraduationCap className="h-4 w-4" />
//               Academic
//             </TabsTrigger>
//             <TabsTrigger value="notifications" className="gap-2">
//               <Bell className="h-4 w-4" />
//               Notifications
//             </TabsTrigger>
//             <TabsTrigger value="privacy" className="gap-2">
//               <Shield className="h-4 w-4" />
//               Privacy
//             </TabsTrigger>
//             <TabsTrigger value="appearance" className="gap-2">
//               <Palette className="h-4 w-4" />
//               Appearance
//             </TabsTrigger>
//           </TabsList>

//           {/* Profile Settings */}
//           <TabsContent value="profile" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <User className="h-5 w-5" />
//                   Profile Information
//                 </CardTitle>
//                 <CardDescription>
//                   Update your personal information and profile picture
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="flex items-center gap-6">
//                   <Avatar className="h-20 w-20">
//                     <AvatarImage src="/diverse-student-profiles.png" />
//                     <AvatarFallback>PC</AvatarFallback>
//                   </Avatar>
//                   <div className="space-y-2">
//                     <Button variant="outline" className="gap-2 bg-transparent">
//                       <Camera className="h-4 w-4" />
//                       Change Photo
//                     </Button>
//                     <p className="text-sm text-muted-foreground">
//                       JPG, PNG or GIF. Max size 2MB.
//                     </p>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="firstName">First Name</Label>
//                     <Input id="firstName" defaultValue="Paschal" />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="lastName">Last Name</Label>
//                     <Input id="lastName" defaultValue="Chidera" />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="email">Email</Label>
//                     <Input
//                       id="email"
//                       type="email"
//                       defaultValue="paschal.chidera@university.edu"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="studentId">Student ID</Label>
//                     <Input id="studentId" defaultValue="STU2024001" />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="major">Major</Label>
//                   <Select defaultValue="computer-science">
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="computer-science">
//                         Computer Science
//                       </SelectItem>
//                       <SelectItem value="engineering">Engineering</SelectItem>
//                       <SelectItem value="business">
//                         Business Administration
//                       </SelectItem>
//                       <SelectItem value="medicine">Medicine</SelectItem>
//                       <SelectItem value="law">Law</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <Button className="w-full md:w-auto">Save Changes</Button>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Academic Settings */}
//           <TabsContent value="academic" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Target className="h-5 w-5" />
//                   Academic Goals
//                 </CardTitle>
//                 <CardDescription>
//                   Set your academic targets and study preferences
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="space-y-4">
//                   <div className="space-y-2">
//                     <Label>GPA Target: {gpaTarget[0]}</Label>
//                     <Slider
//                       value={gpaTarget}
//                       onValueChange={setGpaTarget}
//                       max={4.0}
//                       min={2.0}
//                       step={0.1}
//                       className="w-full"
//                     />
//                     <div className="flex justify-between text-sm text-muted-foreground">
//                       <span>2.0</span>
//                       <span>4.0</span>
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label>
//                       Weekly Study Hours Goal: {studyHoursGoal[0]} hours
//                     </Label>
//                     <Slider
//                       value={studyHoursGoal}
//                       onValueChange={setStudyHoursGoal}
//                       max={60}
//                       min={5}
//                       step={1}
//                       className="w-full"
//                     />
//                     <div className="flex justify-between text-sm text-muted-foreground">
//                       <span>5 hours</span>
//                       <span>60 hours</span>
//                     </div>
//                   </div>
//                 </div>

//                 <Separator />

//                 <div className="space-y-4">
//                   <h4 className="font-medium flex items-center gap-2">
//                     <BookOpen className="h-4 w-4" />
//                     Current Subjects
//                   </h4>
//                   <div className="flex flex-wrap gap-2">
//                     <Badge variant="secondary">Data Structures</Badge>
//                     <Badge variant="secondary">Algorithms</Badge>
//                     <Badge variant="secondary">Database Systems</Badge>
//                     <Badge variant="secondary">Software Engineering</Badge>
//                     <Button variant="outline" size="sm">
//                       + Add Subject
//                     </Button>
//                   </div>
//                 </div>

//                 <Separator />

//                 <div className="space-y-4">
//                   <h4 className="font-medium flex items-center gap-2">
//                     <Clock className="h-4 w-4" />
//                     Study Preferences
//                   </h4>
//                   <div className="space-y-3">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <Label>Pomodoro Timer</Label>
//                         <p className="text-sm text-muted-foreground">
//                           Use 25-minute focused study sessions
//                         </p>
//                       </div>
//                       <Switch defaultChecked />
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <Label>Study Streak Tracking</Label>
//                         <p className="text-sm text-muted-foreground">
//                           Track consecutive days of studying
//                         </p>
//                       </div>
//                       <Switch defaultChecked />
//                     </div>
//                   </div>
//                 </div>

//                 <Button className="w-full md:w-auto">
//                   Save Academic Settings
//                 </Button>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Notifications */}
//           <TabsContent value="notifications" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Bell className="h-5 w-5" />
//                   Notification Preferences
//                 </CardTitle>
//                 <CardDescription>
//                   Choose what notifications you want to receive
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="space-y-4">
//                   {Object.entries({
//                     taskReminders: {
//                       title: "Task Reminders",
//                       description:
//                         "Get notified about upcoming tasks and deadlines",
//                     },
//                     deadlineAlerts: {
//                       title: "Deadline Alerts",
//                       description:
//                         "Urgent notifications for approaching deadlines",
//                     },
//                     studyBreaks: {
//                       title: "Study Break Reminders",
//                       description:
//                         "Reminders to take breaks during long study sessions",
//                     },
//                     achievements: {
//                       title: "Achievement Notifications",
//                       description:
//                         "Celebrate your academic milestones and achievements",
//                     },
//                     weeklyReports: {
//                       title: "Weekly Progress Reports",
//                       description:
//                         "Summary of your weekly study progress and statistics",
//                     },
//                   }).map(([key, { title, description }]) => (
//                     <div
//                       key={key}
//                       className="flex items-center justify-between"
//                     >
//                       <div>
//                         <Label>{title}</Label>
//                         <p className="text-sm text-muted-foreground">
//                           {description}
//                         </p>
//                       </div>
//                       <Switch
//                         checked={
//                           notifications[key as keyof typeof notifications]
//                         }
//                         onCheckedChange={(checked) =>
//                           setNotifications((prev) => ({
//                             ...prev,
//                             [key]: checked,
//                           }))
//                         }
//                       />
//                     </div>
//                   ))}
//                 </div>

//                 <Separator />

//                 <div className="space-y-4">
//                   <h4 className="font-medium">Notification Timing</h4>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label>Quiet Hours Start</Label>
//                       <Select defaultValue="22:00">
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="20:00">8:00 PM</SelectItem>
//                           <SelectItem value="21:00">9:00 PM</SelectItem>
//                           <SelectItem value="22:00">10:00 PM</SelectItem>
//                           <SelectItem value="23:00">11:00 PM</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div className="space-y-2">
//                       <Label>Quiet Hours End</Label>
//                       <Select defaultValue="07:00">
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="06:00">6:00 AM</SelectItem>
//                           <SelectItem value="07:00">7:00 AM</SelectItem>
//                           <SelectItem value="08:00">8:00 AM</SelectItem>
//                           <SelectItem value="09:00">9:00 AM</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>
//                 </div>

//                 <Button className="w-full md:w-auto">
//                   Save Notification Settings
//                 </Button>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Privacy & Security */}
//           <TabsContent value="privacy" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Shield className="h-5 w-5" />
//                   Privacy & Security
//                 </CardTitle>
//                 <CardDescription>
//                   Manage your account security and privacy settings
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="currentPassword">Current Password</Label>
//                     <Input id="currentPassword" type="password" />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="newPassword">New Password</Label>
//                     <Input id="newPassword" type="password" />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="confirmPassword">
//                       Confirm New Password
//                     </Label>
//                     <Input id="confirmPassword" type="password" />
//                   </div>
//                   <Button variant="outline">Update Password</Button>
//                 </div>

//                 <Separator />

//                 <div className="space-y-4">
//                   <h4 className="font-medium">Privacy Controls</h4>
//                   <div className="space-y-3">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <Label>Profile Visibility</Label>
//                         <p className="text-sm text-muted-foreground">
//                           Allow others to see your study progress
//                         </p>
//                       </div>
//                       <Switch />
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <Label>Analytics Tracking</Label>
//                         <p className="text-sm text-muted-foreground">
//                           Help improve the app with usage analytics
//                         </p>
//                       </div>
//                       <Switch defaultChecked />
//                     </div>
//                   </div>
//                 </div>

//                 <Separator />

//                 <div className="space-y-4">
//                   <h4 className="font-medium">Data Management</h4>
//                   <div className="flex flex-col sm:flex-row gap-2">
//                     <Button variant="outline" className="gap-2 bg-transparent">
//                       <Download className="h-4 w-4" />
//                       Export Data
//                     </Button>
//                     <Button variant="destructive" className="gap-2">
//                       <Trash2 className="h-4 w-4" />
//                       Delete Account
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Appearance */}
//           <TabsContent value="appearance" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Palette className="h-5 w-5" />
//                   Appearance & Accessibility
//                 </CardTitle>
//                 <CardDescription>
//                   Customize the look and feel of your study environment
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="space-y-4">
//                   <h4 className="font-medium">Theme</h4>
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       {isDarkMode ? (
//                         <Moon className="h-4 w-4" />
//                       ) : (
//                         <Sun className="h-4 w-4" />
//                       )}
//                       <Label>Dark Mode</Label>
//                     </div>
//                     <Switch
//                       checked={isDarkMode}
//                       onCheckedChange={setIsDarkMode}
//                     />
//                   </div>
//                 </div>

//                 <Separator />

//                 <div className="space-y-4">
//                   <h4 className="font-medium">Language & Region</h4>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label>Language</Label>
//                       <Select defaultValue="en">
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="en">English</SelectItem>
//                           <SelectItem value="es">Español</SelectItem>
//                           <SelectItem value="fr">Français</SelectItem>
//                           <SelectItem value="de">Deutsch</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div className="space-y-2">
//                       <Label>Time Zone</Label>
//                       <Select defaultValue="utc-5">
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="utc-8">
//                             Pacific Time (UTC-8)
//                           </SelectItem>
//                           <SelectItem value="utc-5">
//                             Eastern Time (UTC-5)
//                           </SelectItem>
//                           <SelectItem value="utc+0">
//                             Greenwich Mean Time (UTC+0)
//                           </SelectItem>
//                           <SelectItem value="utc+1">
//                             Central European Time (UTC+1)
//                           </SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>
//                 </div>

//                 <Separator />

//                 <div className="space-y-4">
//                   <h4 className="font-medium">Accessibility</h4>
//                   <div className="space-y-3">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <Label>High Contrast Mode</Label>
//                         <p className="text-sm text-muted-foreground">
//                           Increase contrast for better visibility
//                         </p>
//                       </div>
//                       <Switch />
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <Label>Reduce Motion</Label>
//                         <p className="text-sm text-muted-foreground">
//                           Minimize animations and transitions
//                         </p>
//                       </div>
//                       <Switch />
//                     </div>
//                   </div>
//                 </div>

//                 <Button className="w-full md:w-auto">
//                   Save Appearance Settings
//                 </Button>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <LogOut className="h-5 w-5" />
//                   Account Actions
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <Button
//                   variant="outline"
//                   className="w-full gap-2 bg-transparent"
//                 >
//                   <LogOut className="h-4 w-4" />
//                   Sign Out
//                 </Button>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// }
