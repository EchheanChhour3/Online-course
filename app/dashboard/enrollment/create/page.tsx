"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, ChevronLeft } from "lucide-react"; // Renamed for clarity
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const courses = [
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "javascript", label: "JavaScript" },
  { value: "react", label: "React" },
  { value: "nodejs", label: "Node.js" },
];

const genders = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function CreateEnrollmentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    course: "",
    studentName: "",
    gender: "",
    email: "",
    phoneNumber: "",
    enrollmentDate: undefined as Date | undefined, // Changed to Date object for better compatibility
    additionalNote: "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form data:", formData);
    router.push("/dashboard/enrollment");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto mt-10">
      {" "}
      {/* Fixed margins and width */}
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        <button
          onClick={() => router.push("/dashboard/enrollment")}
          className="hover:text-blue-600 transition-colors"
        >
          Enrollments
        </button>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Create</span>
      </nav>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Create New Enrollment
        </h1>
        <p className="text-gray-500 mt-2">
          Fill in the details to register a new student.
        </p>
      </div>
      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-white p-8 rounded-xl border border-gray-200 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Select Course - Full Width */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="course">Select Course</Label>
            <Select
              value={formData.course}
              onValueChange={(value) => handleInputChange("course", value)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.value} value={course.value}>
                    {course.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Student Full Name */}
          <div className="space-y-2">
            <Label htmlFor="studentName">Student Full Name</Label>
            <Input
              id="studentName"
              placeholder="John Doe"
              value={formData.studentName}
              onChange={(e) => handleInputChange("studentName", e.target.value)}
              className="h-11"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleInputChange("gender", value)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {genders.map((gender) => (
                  <SelectItem key={gender.value} value={gender.value}>
                    {gender.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="h-11"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              className="h-11"
            />
          </div>

          {/* Enrollment Date - Full Width */}
          <div className="space-y-2 md:col-span-2">
            <Label>Enrollment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-11 border-gray-300",
                    !formData.enrollmentDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                  {formData.enrollmentDate ? (
                    format(formData.enrollmentDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.enrollmentDate}
                  onSelect={(date) => handleInputChange("enrollmentDate", date)}
                  initialFocus
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Additional Note */}
        <div className="space-y-2">
          <Label htmlFor="additionalNote">Additional Note</Label>
          <Textarea
            id="additionalNote"
            placeholder="Any specific requirements or notes..."
            value={formData.additionalNote}
            onChange={(e) =>
              handleInputChange("additionalNote", e.target.value)
            }
            className="min-h-[120px] resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/dashboard/enrollment")}
            className="h-11 px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-8"
          >
            Create Enrollment
          </Button>
        </div>
      </form>
    </div>
  );
}
