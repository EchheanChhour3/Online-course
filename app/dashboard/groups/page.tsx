"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  BookOpen,
  UserPlus,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  Loader2,
  UsersRound,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRole } from "@/contexts/role-context";
import {
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  addGroupMember,
  removeGroupMember,
  addGroupCourse,
  removeGroupCourse,
  type GroupItem,
} from "@/services/group.service";
import { getUsers, type UserItem } from "@/services/user.service";
import { getCourses, type CourseItem } from "@/services/course.service";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function GroupsPage() {
  const { data: session, status } = useSession();
  const { role } = useRole();

  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [allUsers, setAllUsers] = useState<UserItem[]>([]);
  const [allCourses, setAllCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");

  const [editingGroup, setEditingGroup] = useState<GroupItem | null>(null);
  const [editName, setEditName] = useState("");

  const [deletingGroup, setDeletingGroup] = useState<GroupItem | null>(null);

  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);

  const [addMemberGroupId, setAddMemberGroupId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [memberSearch, setMemberSearch] = useState("");

  const [addCourseGroupId, setAddCourseGroupId] = useState<number | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [courseSearch, setCourseSearch] = useState("");

  const fetchData = useCallback(async () => {
    if (status === "unauthenticated") {
      setLoading(false);
      setError("Please sign in.");
      return;
    }
    const token = session?.accessToken;
    if (!token && status === "authenticated") {
      setLoading(false);
      setError("Session expired. Please sign in again.");
      return;
    }
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const [groupsRes, usersList, coursesRes] = await Promise.all([
        getAllGroups(token, { page: 1, size: 200 }),
        getUsers(token),
        getCourses(token, { page: 1, size: 500 }),
      ]);
      setGroups(groupsRes.items ?? []);
      setAllUsers(Array.isArray(usersList) ? usersList : []);
      setAllCourses(coursesRes.payload?.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, status]);

  useEffect(() => {
    if (status === "loading") return;
    fetchData();
  }, [fetchData, status]);

  const filteredGroups = groups.filter((g) =>
    g.group_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;
    const token = session?.accessToken;
    if (!token) return;

    setSubmitting(true);
    try {
      await createGroup(token, createName.trim());
      toast.success("Group created successfully");
      setCreateName("");
      setIsCreateOpen(false);
      await fetchData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create group",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup || !editName.trim()) return;
    const token = session?.accessToken;
    if (!token) return;

    setSubmitting(true);
    try {
      await updateGroup(token, editingGroup.group_id, editName.trim());
      toast.success("Group updated successfully");
      setEditingGroup(null);
      setEditName("");
      await fetchData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update group",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingGroup) return;
    const token = session?.accessToken;
    if (!token) return;

    setSubmitting(true);
    try {
      await deleteGroup(token, deletingGroup.group_id);
      toast.success("Group deleted successfully");
      setDeletingGroup(null);
      if (expandedGroupId === deletingGroup.group_id) setExpandedGroupId(null);
      await fetchData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete group",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async () => {
    if (!addMemberGroupId || !selectedUserId) return;
    const token = session?.accessToken;
    if (!token) return;

    setSubmitting(true);
    try {
      await addGroupMember(token, addMemberGroupId, Number(selectedUserId));
      toast.success("Member added successfully");
      setSelectedUserId("");
      setMemberSearch("");
      setAddMemberGroupId(null);
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (groupId: number, userId: number) => {
    const token = session?.accessToken;
    if (!token) return;

    setSubmitting(true);
    try {
      await removeGroupMember(token, groupId, userId);
      toast.success("Member removed");
      await fetchData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove member",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCourse = async () => {
    if (!addCourseGroupId || !selectedCourseId) return;
    const token = session?.accessToken;
    if (!token) return;

    setSubmitting(true);
    try {
      await addGroupCourse(token, addCourseGroupId, Number(selectedCourseId));
      toast.success("Course added to group");
      setSelectedCourseId("");
      setCourseSearch("");
      setAddCourseGroupId(null);
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add course");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveCourse = async (groupId: number, courseId: number) => {
    const token = session?.accessToken;
    if (!token) return;

    setSubmitting(true);
    try {
      await removeGroupCourse(token, groupId, courseId);
      toast.success("Course removed from group");
      await fetchData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove course",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailableUsers = (group: GroupItem) => {
    const memberIds = new Set(group.members.map((m) => m.user_id));
    return allUsers.filter(
      (u) =>
        !memberIds.has(u.user_id) &&
        (u.full_name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
          u.email?.toLowerCase().includes(memberSearch.toLowerCase())),
    );
  };

  const getAvailableCourses = (group: GroupItem) => {
    const courseIds = new Set(group.courses.map((c) => c.course_id));
    return allCourses.filter(
      (c) =>
        !courseIds.has(c.course_id) &&
        c.course_name?.toLowerCase().includes(courseSearch.toLowerCase()),
    );
  };

  if (role !== "admin") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center rounded-3xl border border-slate-200/80 bg-white p-10 shadow-xl shadow-slate-200/50"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-8 ring-amber-50/80">
            <ShieldAlert className="h-8 w-8" strokeWidth={1.75} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Restricted area
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Group management is available to administrators only. Contact an
            admin if you need changes.
          </p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/25">
          <Loader2 className="h-7 w-7 animate-spin" strokeWidth={2} />
        </div>
        <p className="text-sm font-medium text-slate-600">Loading groups…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8">
        <div className="max-w-md w-full rounded-3xl border border-red-100 bg-red-50/50 p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-red-700">{error}</p>
          <Button
            variant="outline"
            className="mt-6 border-red-200 bg-white text-red-800 hover:bg-red-50"
            onClick={fetchData}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12"
      >
        {/* Page header */}
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-800 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Administration
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Learning groups
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-600">
              Bundle students and courses so everyone in a group gets the same
              access—without enrolling one by one.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200/80">
                <UsersRound className="h-3.5 w-3.5 text-teal-600" />
                {groups.length} group{groups.length !== 1 ? "s" : ""}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200/80">
                <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                {allCourses.length} course{allCourses.length !== 1 ? "s" : ""}{" "}
                in catalog
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[280px] sm:items-end">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search groups…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 rounded-2xl border-slate-200 bg-white/90 pl-10 shadow-sm transition-shadow focus-visible:ring-teal-500/30"
              />
            </div>
            <Button
              onClick={() => {
                setCreateName("");
                setIsCreateOpen(true);
              }}
              className="h-11 w-full rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:from-teal-500 hover:to-emerald-500 sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              New group
            </Button>
          </div>
        </header>

        {/* Group list */}
        <div className="space-y-4">
          {filteredGroups.map((group, index) => {
            const isExpanded = expandedGroupId === group.group_id;
            return (
              <motion.div
                key={group.group_id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300",
                  isExpanded
                    ? "border-teal-200/70 shadow-md shadow-teal-900/5 ring-1 ring-teal-100"
                    : "border-slate-200/90 hover:border-slate-300 hover:shadow-md",
                )}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setExpandedGroupId(isExpanded ? null : group.group_id);
                    }
                  }}
                  className="flex cursor-pointer flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                  onClick={() =>
                    setExpandedGroupId(isExpanded ? null : group.group_id)
                  }
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div
                      className={cn(
                        "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md transition",
                        isExpanded
                          ? "bg-gradient-to-br from-teal-500 to-emerald-600 shadow-teal-500/30"
                          : "bg-gradient-to-br from-slate-600 to-slate-800 shadow-slate-900/20",
                      )}
                    >
                      <Users className="h-7 w-7" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 space-y-2">
                      <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">
                        {group.group_name}
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {group.member_count} member
                          {group.member_count !== 1 ? "s" : ""}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                          {group.course_count} course
                          {group.course_count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex shrink-0 flex-wrap items-center gap-2 pl-[4.5rem] sm:pl-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      onClick={() => {
                        setEditingGroup(group);
                        setEditName(group.group_name);
                      }}
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Rename
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setDeletingGroup(group)}
                      disabled={submitting}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete
                    </Button>
                    <button
                      type="button"
                      className="ml-1 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="border-t border-slate-100 bg-gradient-to-b from-slate-50/90 to-white"
                    >
                      <div className="grid gap-8 p-5 sm:p-6 lg:grid-cols-2">
                        <section className="space-y-4">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                                <Users className="h-4 w-4" />
                              </span>
                              Members
                            </h3>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 rounded-xl border-teal-200 bg-white text-teal-800 hover:bg-teal-50"
                              onClick={() => {
                                setAddMemberGroupId(group.group_id);
                                setSelectedUserId("");
                                setMemberSearch("");
                              }}
                            >
                              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                              Add
                            </Button>
                          </div>
                          {group.members.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-slate-200 bg-white/60 py-8 text-center text-sm text-slate-500">
                              No members yet. Add students from your directory.
                            </p>
                          ) : (
                            <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
                              {group.members.map((member) => (
                                <li
                                  key={member.user_id}
                                  className="group flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition hover:border-teal-200/60 hover:shadow"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-slate-900">
                                      {member.full_name}
                                    </p>
                                    <p className="truncate text-xs text-slate-500">
                                      {member.email}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveMember(
                                        group.group_id,
                                        member.user_id,
                                      )
                                    }
                                    disabled={submitting}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                                    title="Remove member"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </section>

                        <section className="space-y-4">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                <BookOpen className="h-4 w-4" />
                              </span>
                              Courses
                            </h3>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 rounded-xl border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-50"
                              onClick={() => {
                                setAddCourseGroupId(group.group_id);
                                setSelectedCourseId("");
                                setCourseSearch("");
                              }}
                            >
                              <Plus className="mr-1.5 h-3.5 w-3.5" />
                              Add
                            </Button>
                          </div>
                          {group.courses.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-slate-200 bg-white/60 py-8 text-center text-sm text-slate-500">
                              No courses linked. Add courses to grant access to
                              the whole group.
                            </p>
                          ) : (
                            <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
                              {group.courses.map((course) => (
                                <li
                                  key={course.course_id}
                                  className="group flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition hover:border-emerald-200/60 hover:shadow"
                                >
                                  <p className="min-w-0 truncate text-sm font-medium text-slate-900">
                                    {course.course_name}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveCourse(
                                        group.group_id,
                                        course.course_id,
                                      )
                                    }
                                    disabled={submitting}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                                    title="Remove course"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </section>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {filteredGroups.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 py-16 text-center shadow-inner">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <UsersRound className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <p className="text-base font-medium text-slate-800">
                {searchTerm
                  ? "No groups match your search"
                  : "No groups yet"}
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                {searchTerm
                  ? "Try a different search term or clear the filter."
                  : "Create your first group to assign members and courses in one place."}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => {
                    setCreateName("");
                    setIsCreateOpen(true);
                  }}
                  className="mt-6 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 font-semibold shadow-lg shadow-teal-600/20"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create a group
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Dialogs */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="gap-0 overflow-hidden rounded-2xl border-slate-200/80 p-0 shadow-2xl sm:max-w-md">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-5 text-white">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="text-xl text-white">
                Create group
              </DialogTitle>
              <DialogDescription className="text-teal-50">
                Name your cohort or class. You can add people and courses next.
              </DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleCreate} className="space-y-5 p-6">
            <div className="space-y-2">
              <Label htmlFor="group-name" className="text-slate-700">
                Group name
              </Label>
              <Input
                id="group-name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. Design cohort — Spring 2026"
                required
                className="h-11 rounded-xl border-slate-200"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setIsCreateOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-teal-600 hover:bg-teal-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create group"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingGroup}
        onOpenChange={(open) => !open && setEditingGroup(null)}
      >
        <DialogContent className="rounded-2xl border-slate-200/80 shadow-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename group</DialogTitle>
            <DialogDescription>
              This updates the display name for everyone in the dashboard.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-group-name">Group name</Label>
              <Input
                id="edit-group-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setEditingGroup(null)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-teal-600 hover:bg-teal-700"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deletingGroup}
        onOpenChange={(open) => !open && setDeletingGroup(null)}
      >
        <DialogContent className="rounded-2xl border-slate-200/80 shadow-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete group?</DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              <span className="font-medium text-slate-800">
                &quot;{deletingGroup?.group_name}&quot;
              </span>{" "}
              will be removed. Members will lose access granted only through
              this group.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setDeletingGroup(null)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete group"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={addMemberGroupId !== null}
        onOpenChange={(open) => !open && setAddMemberGroupId(null)}
      >
        <DialogContent className="rounded-2xl border-slate-200/80 shadow-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add member</DialogTitle>
            <DialogDescription>
              Choose a user from your directory. They must not already be in
              this group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Search users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Name or email…"
                  className="h-11 rounded-xl pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {addMemberGroupId !== null &&
                    getAvailableUsers(
                      groups.find((g) => g.group_id === addMemberGroupId)!,
                    ).map((u) => (
                      <SelectItem key={u.user_id} value={String(u.user_id)}>
                        {u.full_name}
                        {u.email ? ` (${u.email})` : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setAddMemberGroupId(null)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-teal-600 hover:bg-teal-700"
              onClick={handleAddMember}
              disabled={submitting || !selectedUserId}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add member"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={addCourseGroupId !== null}
        onOpenChange={(open) => !open && setAddCourseGroupId(null)}
      >
        <DialogContent className="rounded-2xl border-slate-200/80 shadow-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add course</DialogTitle>
            <DialogDescription>
              Everyone in this group will be able to open this course from
              their dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Search courses</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="Filter by title…"
                  className="h-11 rounded-xl pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Course</Label>
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {addCourseGroupId !== null &&
                    getAvailableCourses(
                      groups.find((g) => g.group_id === addCourseGroupId)!,
                    ).map((c) => (
                      <SelectItem key={c.course_id} value={String(c.course_id)}>
                        {c.course_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setAddCourseGroupId(null)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
              onClick={handleAddCourse}
              disabled={submitting || !selectedCourseId}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add course"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
