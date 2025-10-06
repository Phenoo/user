"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CiEdit } from "react-icons/ci";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CountryDropdown } from "@/components/country-dropdown";
import { Checkbox } from "@/components/ui/checkbox";
import { universities_data } from "../../list-universities";
import LoadingComponent from "@/components/loader";

import { countries } from "country-data-list";
import { X } from "lucide-react";

const ProfileSettings = () => {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [didntFind, setDidntFind] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
    userId: "" as Id<"users">,
  });

  const user = useQuery(api.users.currentUser);

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
        userId: user._id,
      });
    }
  }, [user]);

  useEffect(() => {
    const defaultLocation = countries.all.filter(
      (item, i) => item.name == user?.location
    );
    if (defaultLocation.length > 0) {
      setSelectedCountry(defaultLocation[0].alpha3 as string);
    } else {
      setSelectedCountry("");
    }
  }, [user]);

  if (!user) {
    return <LoadingComponent />;
  }

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
          <div className="flex justify-between flex-row items-center">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your basic profile information
              </CardDescription>
            </div>
            <div>
              <Button
                variant={isEditing ? "destructive" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    Cancel Edit <X className="h-4 w-4 ml-1" />{" "}
                  </>
                ) : (
                  <>
                    Edit <CiEdit className="h-4 w-4 ml-1" />{" "}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">School Email</Label>
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
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Academic Year</Label>
              <Select
                value={formData.year}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, year: value }))
                }
                disabled={!isEditing}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="freshman">Freshman/1st Year</SelectItem>
                  <SelectItem value="sophomore">Sophomore/2nd Year</SelectItem>
                  <SelectItem value="junior">Junior/3rd Year</SelectItem>
                  <SelectItem value="senior">Senior/4th Year</SelectItem>
                  <SelectItem value="graduate">Graduate Student</SelectItem>
                  <SelectItem value="phd">PhD Student</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="major">Major/Course</Label>
              <Input
                id="major"
                placeholder="e.g., Computer Science, Psychology"
                value={formData.major}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, major: e.target.value }))
                }
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
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
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="school">School/University</Label>
              <Select
                value={formData.school}
                onValueChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    school: e,
                  }))
                }
                disabled={
                  universities_data &&
                  universities_data.length <= 0 &&
                  !isEditing
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="School/University" />
                </SelectTrigger>
                <SelectContent>
                  {universities_data.map((item, i) => (
                    <SelectItem value={item.name} key={item.name + i}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!formData.school && (
                <div className="flex gap-2 items-center my-4 text-sm md:text-base">
                  <Checkbox
                    checked={didntFind}
                    onCheckedChange={() => setDidntFind(!didntFind)}
                    className="size-5 border-foreground"
                  />
                  Didn&apos;t find my university here
                </div>
              )}
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
                  disabled={!isEditing}
                />
              )}
            </div>
          </div>
          <Button disabled={!isEditing}>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
