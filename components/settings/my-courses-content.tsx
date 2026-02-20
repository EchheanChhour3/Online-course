"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-react";

interface MyCourseCardProps {
  title: string;
  instructor: string;
  rating: number;
  ratingsCount: number;
  imageSrc?: string;
}

function MyCourseCard({
  title,
  instructor,
  rating,
  ratingsCount,
  imageSrc,
}: MyCourseCardProps) {
  const router = useRouter();

  return (
    <article
      onClick={() => router.push("/dashboard/course/basic-ux")}
      className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
    >
      <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-300 w-16 h-16">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-full h-full"
            >
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 line-clamp-1 mb-1">{title}</h3>
        <p className="text-gray-500 text-sm mb-2">By {instructor}</p>
        <div className="flex items-center gap-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-gray-500 text-sm ml-1">
            ({ratingsCount.toLocaleString()} Ratings)
          </span>
        </div>
      </div>
    </article>
  );
}

const mockCourses: MyCourseCardProps[] = [
  {
    title: "Beginner's Guide to Design",
    instructor: "Ronald Richards",
    rating: 5,
    ratingsCount: 1200,
  },
  {
    title: "Advanced React Patterns",
    instructor: "Sarah Chen",
    rating: 4.9,
    ratingsCount: 856,
  },
  {
    title: "Python for Data Science",
    instructor: "Emily Davis",
    rating: 4.8,
    ratingsCount: 642,
  },
  {
    title: "UI/UX Fundamentals",
    instructor: "Ronald Richards",
    rating: 4.9,
    ratingsCount: 1200,
  },
  {
    title: "Node.js Mastery",
    instructor: "Mike Johnson",
    rating: 4.7,
    ratingsCount: 534,
  },
  {
    title: "Docker & Kubernetes",
    instructor: "Alex Kumar",
    rating: 4.6,
    ratingsCount: 421,
  },
  {
    title: "TypeScript Essentials",
    instructor: "John Smith",
    rating: 4.8,
    ratingsCount: 789,
  },
  {
    title: "GraphQL APIs",
    instructor: "Lisa Wong",
    rating: 4.5,
    ratingsCount: 312,
  },
  {
    title: "Machine Learning Basics",
    instructor: "David Lee",
    rating: 4.9,
    ratingsCount: 945,
  },
];

export function MyCoursesContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalCourses = 12;
  const totalPages = 3;

  return (
    <div className="flex-1 min-w-0">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button
          onClick={() => window.history.back()}
          className="p-1 rounded hover:bg-gray-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span>Profile</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">My Courses</span>
      </nav>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Title and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Courses ({totalCourses})
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:flex-initial min-w-[200px]">
              <Input
                placeholder="Search courses"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-3 pr-10 h-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <Select defaultValue="relevance">
              <SelectTrigger className="w-[140px] h-10">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-10">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCourses.map((course, index) => (
            <MyCourseCard key={`${course.title}-${index}`} {...course} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-9 w-9 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {[1, 2, 3].map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={`h-9 w-9 p-0 ${
                currentPage === page
                  ? "bg-gray-900 hover:bg-gray-800"
                  : ""
              }`}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
            disabled={currentPage === totalPages}
            className="h-9 w-9 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
