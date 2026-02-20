"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { getProfile } from "@/services/auth.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Settings,
  LogOut,
  ChevronLeft,
  FileText,
  Grid3x3,
  BookOpen,
  Star,
  Users,
} from "lucide-react";

interface FavoriteCourse {
  name: string;
  description: string;
  icon: React.ReactNode;
}

const favoriteCourses: FavoriteCourse[] = [
  {
    name: "HTML5",
    description: "Hyper text markup language...",
    icon: (
      <div className="w-10 h-10 bg-orange-500 rounded flex items-center justify-center">
        <span className="text-white font-bold text-sm">5</span>
      </div>
    ),
  },
  {
    name: "CSS",
    description: "Cascadign stylesheet....",
    icon: (
      <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center">
        <span className="text-white font-bold text-xs">CSS</span>
      </div>
    ),
  },
  {
    name: "Javascript",
    description: "Server script programing.....",
    icon: (
      <div className="w-10 h-10 bg-yellow-400 rounded flex items-center justify-center">
        <span className="text-black font-bold text-xs">JS</span>
      </div>
    ),
  },
];

export default function EnrollmentSidebar({
  onCollapseChange,
}: {
  onCollapseChange?: (collapsed: boolean) => void;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleCollapseChange = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    onCollapseChange?.(collapsed);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.accessToken) {
        try {
          const profile = await getProfile(session.accessToken);
          setProfileData(profile.payload);
        } catch (error) {
          console.error("Failed to fetch profile:", error);
          toast.error("Failed to load profile data");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session?.accessToken]);

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      toast.success("Signed out successfully!");
      router.push("/login");
    } catch (error) {
      toast.error("Error signing out. Please try again.");
    }
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const mainNavItems = [
    {
      label: "Course",
      icon: <FileText className="w-5 h-5" />,
      href: "/dashboard/course",
    },
    {
      label: "Category",
      icon: <Grid3x3 className="w-5 h-5" />,
      href: "/dashboard/category",
    },
    {
      label: "Enrollment",
      icon: <BookOpen className="w-5 h-5" />,
      href: "/dashboard/enrollment",
    },
    {
      label: "Teachers",
      icon: <Users className="w-5 h-5" />,
      href: "/dashboard/teachers",
    },
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white shadow-2xl transition-all duration-300 z-40 ${
        isCollapsed ? "w-20" : "w-80"
      }`}
    >
      {/* User Profile Section */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {profileData?.full_name?.charAt(0).toUpperCase() ||
                  session?.user?.name?.charAt(0).toUpperCase() ||
                  "A"}
              </span>
            </div>
            {!isCollapsed && (
              <div>
                <p className="text-gray-900 font-semibold">
                  {profileData?.full_name ||
                    session?.user?.name ||
                    "Andrew Smith"}
                </p>
                <p className="text-gray-500 text-xs">
                  {profileData?.role?.[0] || session?.user?.role?.[0] || "User"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => handleCollapseChange(!isCollapsed)}
        className={`absolute top-8 bg-white rounded-full p-3 hover:bg-gray-50 transition-colors z-50 shadow-md ${
          isCollapsed ? "-right-8" : "-right-8"
        }`}
      >
        <ChevronLeft
          className={`w-6 h-6 text-gray-600 transition-transform ${
            isCollapsed ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Main Navigation */}
      <div className="px-4 py-4 border-b border-gray-200">
        {!isCollapsed && (
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            MAIN
          </h3>
        )}
        <nav className="space-y-2">
          {mainNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
            return (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {item.icon}
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Favorite Courses */}
      {!isCollapsed && (
        <div className="px-4 py-4 border-b border-gray-200 flex-1">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            FAVORITE COURSE
          </h3>
          <div className="space-y-3">
            {favoriteCourses.map((course, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 mx-2 py-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {course.icon}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900 text-sm font-medium truncate">
                      {course.name}
                    </p>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <p className="text-gray-500 text-xs truncate">
                    {course.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-gray-200">
        <div className="space-y-2">
          <button
            onClick={() => handleNavigation("/dashboard/settings")}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <Settings className="w-5 h-5" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Settings</span>
            )}
          </button>

          <Dialog
            open={isLogoutDialogOpen}
            onOpenChange={setIsLogoutDialogOpen}
          >
            <DialogTrigger asChild>
              <button
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-red-500 hover:bg-red-50 hover:text-red-600 ${
                  isCollapsed ? "justify-center" : ""
                }`}
              >
                <LogOut className="w-5 h-5" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">Logout Account</span>
                )}
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogDescription>
                  Are you sure you want to logout? You will need to sign in
                  again to access your account.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsLogoutDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    setIsLogoutDialogOpen(false);
                    await handleSignOut();
                  }}
                >
                  Logout
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
