"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Crown, Settings, UserPlus } from "lucide-react";
import { SubscriptionGuard } from "@/components/subscription-guard";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function TeamPage() {
  // Mock user ID - in a real app, you'd get this from authentication
  const user = useQuery(api.users.currentUser);
  const userId = user?._id as Id<"users">;

  return (
    <SubscriptionGuard
      userId={userId}
      requiredPlan="PRO"
      feature="Team Collaboration Tools"
    >
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-bold">Team Management</h1>
                  <Badge variant="secondary">
                    <Crown className="h-3 w-3 mr-1" />
                    Pro Feature
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Manage your team members and collaborate on study materials
                </p>
              </div>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </div>
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm text-muted-foreground">
                      Team Members
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Settings className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-sm text-muted-foreground">
                      Active Projects
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Crown className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">38</p>
                    <p className="text-sm text-muted-foreground">
                      Shared Resources
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "John Doe",
                    role: "Admin",
                    email: "john@example.com",
                    status: "Active",
                  },
                  {
                    name: "Jane Smith",
                    role: "Member",
                    email: "jane@example.com",
                    status: "Active",
                  },
                  {
                    name: "Bob Johnson",
                    role: "Member",
                    email: "bob@example.com",
                    status: "Pending",
                  },
                ].map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          member.role === "Admin" ? "default" : "secondary"
                        }
                      >
                        {member.role}
                      </Badge>
                      <Badge
                        variant={
                          member.status === "Active" ? "default" : "outline"
                        }
                      >
                        {member.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SubscriptionGuard>
  );
}
