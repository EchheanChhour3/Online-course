"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CourseDetailHeader,
  CourseVideoPlayer,
  CourseTabs,
  type CourseTab,
  CourseOverview,
  InstructorProfile,
  CourseCompletionSidebar,
  type CourseModule,
  type Lesson,
} from "@/components/course-detail";
import { getCourseById, type CourseItem } from "@/services/course.service";

function getFirstLessonVideoUrl(course: CourseItem | null): string | undefined {
  if (!course?.modules?.length) return undefined;
  const modules = [...course.modules].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  for (const m of modules) {
    const lessons = [...(m.lessons ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    const first = lessons.find((l) => l.video_url?.trim());
    if (first?.video_url?.trim()) return first.video_url.trim();
  }
  return undefined;
}

function toSidebarModules(course: CourseItem | null): CourseModule[] {
  if (!course?.modules?.length) return [];
  return course.modules
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((m) => ({
      id: String(m.module_id),
      title: m.module_title ?? "Module",
      lessons: (m.lessons ?? [])
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((l) => ({
          id: `${m.module_id}-${l.lesson_id}`,
          title: l.title ?? "Lesson",
          duration: l.duration != null ? `${l.duration}min` : "—",
          completed: false,
          videoUrl: l.video_url?.trim() || undefined,
        })),
    }));
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const slug = params.slug as string;
  const courseId = slug && /^\d+$/.test(slug) ? Number(slug) : null;

  const [course, setCourse] = useState<CourseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CourseTab>("details");
  const [selectedLesson, setSelectedLesson] = useState<{
    id: string;
    videoUrl: string;
    title: string;
  } | null>(null);
  const [userSelectedLesson, setUserSelectedLesson] = useState(false);

  const fetchCourse = useCallback(async () => {
    if (!courseId || !session?.accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getCourseById(session.accessToken, courseId);
      setCourse(res.payload ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load course");
      setCourse(null);
    } finally {
      setLoading(false);
    }
  }, [courseId, session?.accessToken]);

  useEffect(() => {
    if (course) {
      const modules = toSidebarModules(course);
      for (const m of modules) {
        const found = m.lessons.find((l) => l.videoUrl?.trim());
        if (found) {
          setSelectedLesson((prev) =>
            prev ? prev : { id: found.id, videoUrl: found.videoUrl!, title: found.title }
          );
          break;
        }
      }
    }
  }, [course]);

  const handleLessonClick = useCallback(
    (lesson: { id: string; title: string; videoUrl?: string }) => {
      if (lesson.videoUrl?.trim()) {
        setUserSelectedLesson(true);
        setSelectedLesson({ id: lesson.id, videoUrl: lesson.videoUrl.trim(), title: lesson.title });
      }
    },
    []
  );

  useEffect(() => {
    if (status === "loading" || !courseId) {
      setLoading(!courseId ? false : true);
      if (!courseId) setError("Invalid course");
      return;
    }
    if (status === "unauthenticated" || !session?.accessToken) {
      setLoading(false);
      setError("Please sign in to view this course.");
      return;
    }
    fetchCourse();
  }, [fetchCourse, status, session?.accessToken, courseId]);

  const breadcrumbs = [
    { label: "Courses", href: "/dashboard/course" },
    { label: "All", href: "/dashboard/course/all" },
    { label: course?.course_name ?? "Course" },
  ];

  if (!courseId) {
    return (
      <div className="min-h-screen bg-white p-8 sm:p-10 lg:p-12">
        <p className="text-red-500">Invalid course.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/course")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to courses
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8 sm:p-10 lg:p-12">
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white p-8 sm:p-10 lg:p-12">
        <p className="text-red-500">{error ?? "Course not found."}</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/course")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to courses
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8 sm:p-10 lg:p-12">
      <CourseDetailHeader
        title={course.course_name ?? "Course Page"}
        breadcrumbs={breadcrumbs}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <CourseVideoPlayer
            key={selectedLesson?.id ?? "intro"}
            title={selectedLesson?.title ?? course.course_name ?? "Course Introduction"}
            videoUrl={selectedLesson?.videoUrl ?? getFirstLessonVideoUrl(course)}
            autoPlay={userSelectedLesson}
          />

          <CourseTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "details" && (
            <>
              <CourseOverview
                overview={
                  course.description ||
                  "No description available for this course."
                }
                objectives={["Complete the course modules", "Practice the concepts", "Apply what you learn"]}
              />
              <div className="mt-8">
                <InstructorProfile
                  name={course.instructor_name ?? "Instructor"}
                  title="Course Instructor"
                  bio={course.instructor_description ?? ""}
                />
              </div>
            </>
          )}

          {activeTab === "instructor" && (
            <InstructorProfile
              name={course.instructor_name ?? "Instructor"}
              title="Course Instructor"
              bio={course.instructor_description ?? ""}
            />
          )}

          {activeTab === "courses" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Course content
              </h3>
              {toSidebarModules(course).length > 0 ? (
                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
                  {toSidebarModules(course).map((mod) => (
                    <div key={mod.id} className="p-4">
                      <h4 className="font-medium text-gray-900">{mod.title}</h4>
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        {mod.lessons.map((l) => {
                          const hasVideo = Boolean(l.videoUrl?.trim());
                          return (
                            <li key={l.id} className="flex gap-2 items-center">
                              <span>•</span>
                              <button
                                type="button"
                                onClick={() => hasVideo && handleLessonClick(l)}
                                className={`text-left hover:underline ${hasVideo ? "text-blue-600 hover:text-blue-800 cursor-pointer" : "text-gray-600 cursor-default"}`}
                              >
                                {l.title}
                              </button>
                              {l.duration && l.duration !== "—" && (
                                <span className="text-gray-400">{l.duration}</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No modules yet.</p>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
              Reviews coming soon
            </div>
          )}
        </div>

        <div className="lg:w-80 shrink-0">
          <CourseCompletionSidebar
            modules={toSidebarModules(course)}
            activeLessonId={selectedLesson?.id}
            onLessonClick={handleLessonClick}
          />
        </div>
      </div>
    </div>
  );
}
