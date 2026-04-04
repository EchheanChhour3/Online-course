"use client";

import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Loader2,
  Lock,
  SearchX,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

type ErrorKind = "access" | "auth" | "notfound" | "generic";

function classifyError(message: string): ErrorKind {
  const m = message.toLowerCase();
  if (m.includes("sign in") || m.includes("sign-in")) return "auth";
  if (
    m.includes("access") ||
    m.includes("unauthorized") ||
    m.includes("forbidden") ||
    m.includes("permission")
  ) {
    return "access";
  }
  if (m.includes("not found") || m.includes("invalid course")) return "notfound";
  return "generic";
}

function CourseGateShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-[calc(100vh-0px)] bg-gradient-to-br from-slate-50 via-white to-teal-50/50",
        className,
      )}
    >
      <div className="mx-auto flex min-h-[min(560px,85vh)] max-w-lg flex-col items-center justify-center px-6 py-16 sm:px-8">
        {children}
      </div>
    </div>
  );
}

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
      <CourseGateShell>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full rounded-3xl border border-slate-200/90 bg-white p-10 text-center shadow-xl shadow-slate-200/40"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-8 ring-amber-50/80">
            <SearchX className="h-8 w-8" strokeWidth={1.75} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            That link isn’t valid
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            The course address is missing or malformed. Check the URL or open a
            course from your dashboard.
          </p>
          <Button
            className="mt-8 h-11 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-8 font-semibold shadow-lg shadow-teal-600/20 hover:from-teal-500 hover:to-emerald-500"
            onClick={() => router.push("/dashboard/course")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to my courses
          </Button>
        </motion.div>
      </CourseGateShell>
    );
  }

  if (loading) {
    return (
      <CourseGateShell>
        <div className="flex flex-col items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/30">
            <Loader2 className="h-8 w-8 animate-spin" strokeWidth={2} />
          </div>
          <p className="text-sm font-medium text-slate-600">Loading course…</p>
        </div>
      </CourseGateShell>
    );
  }

  if (error || !course) {
    const message = error ?? "Course not found.";
    const kind = classifyError(message);

    const copy: Record<
      ErrorKind,
      { title: string; body: string; icon: typeof Lock; accent: string }
    > = {
      access: {
        title: "This course isn’t available to you",
        body: "You’re not enrolled in this course and it isn’t assigned through your groups. Ask your administrator if you think you should have access.",
        icon: Lock,
        accent: "from-rose-50 to-orange-50 text-rose-600 ring-rose-100",
      },
      auth: {
        title: "Sign in to continue",
        body: "Your session may have expired. Sign in again to view this course.",
        icon: ShieldAlert,
        accent: "from-slate-100 to-slate-50 text-slate-700 ring-slate-200/80",
      },
      notfound: {
        title: "We couldn’t find this course",
        body: "It may have been removed or the link is outdated. Return to your course list and try again.",
        icon: BookOpen,
        accent: "from-slate-100 to-slate-50 text-slate-600 ring-slate-200/80",
      },
      generic: {
        title: "Something went wrong",
        body: message,
        icon: ShieldAlert,
        accent: "from-amber-50 to-orange-50 text-amber-700 ring-amber-100/80",
      },
    };

    const c = copy[kind];
    const Icon = c.icon;

    return (
      <CourseGateShell>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50"
        >
          <div
            className={cn(
              "bg-gradient-to-r px-8 py-10 text-center",
              kind === "access" && "from-rose-50/90 via-white to-orange-50/50",
              kind === "auth" && "from-slate-100/80 via-white to-slate-50/50",
              kind === "notfound" && "from-slate-50 via-white to-teal-50/30",
              kind === "generic" && "from-amber-50/80 via-white to-orange-50/40",
            )}
          >
            <div
              className={cn(
                "mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg ring-8",
                c.accent,
              )}
            >
              <Icon className="h-10 w-10" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {c.title}
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-600">
              {c.body}
            </p>
            {courseId != null && kind === "access" && (
              <p className="mt-4 inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200/80">
                Course ID · {courseId}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-6 sm:flex-row sm:justify-center sm:gap-4">
            <Button
              className="h-11 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 font-semibold shadow-md shadow-teal-600/15 hover:from-teal-500 hover:to-emerald-500"
              onClick={() => router.push("/dashboard/course")}
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              My courses
            </Button>
            {kind === "access" && (
              <Button
                variant="outline"
                className="h-11 rounded-2xl border-slate-200 bg-white"
                onClick={() => router.push("/dashboard/enrollment")}
              >
                View enrollments
              </Button>
            )}
          </div>
        </motion.div>
      </CourseGateShell>
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
