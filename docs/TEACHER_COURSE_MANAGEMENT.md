# Teacher Course Content Management – User Flow

This guide shows how teachers manage courses and course content in the platform.

## Access

1. Log in to the dashboard
2. In the sidebar, click **"Manage Courses"** (FolderEdit icon)
3. Or go directly to: **`/dashboard/course/manage`**

---

## Flow Overview

```
Sidebar → Manage Courses
    ↓
List of all courses (search, filter by category)
    ↓
[Add Course]  |  [Content] [Edit] [Delete] per course
    ↓
Click "Content" on a course
    ↓
Course content editor: modules and lessons
```

---

## 1. Manage Courses Page (`/dashboard/course/manage`)

**What teachers see:**

- All courses across all categories
- Search (by title, instructor, or category)
- Filter by category dropdown
- **Add Course** button

**For each course card:**

| Column | Content |
|--------|---------|
| Course info | Title, instructor name, category |
| Stats | Module count, lesson count |
| Actions | **Content** – edit modules/lessons |
| | **Edit** – change title, instructor, category, description |
| | **Delete** – remove course (with confirmation) |

**Add/Edit Course dialog:**

- **Category** – dropdown (Programming, Networking, Design, etc.)
- **Title** – course name
- **Instructor** – dropdown of teachers from Manage Teachers
- **Description** – optional

---

## 2. Course Content Editor (`/dashboard/course/manage/[courseId]`)

Reached by clicking **Content** on a course.

**Page header:**

- Breadcrumb: Manage Courses → Course Title → Content
- **Add Module** button

**Structure: modules → lessons**

Each **module** has:

- Title
- Collapsible list of lessons
- Actions: **Lesson** (add), Edit, Delete

Each **lesson** shows:

- Title
- Duration (e.g. `5min`)
- Optional video URL
- Actions: Edit, Delete

**Module actions:**

- **Add Module** – new section (e.g. “Introduction to React”)
- **Lesson** – add lesson under that module
- **Edit** – change module title
- **Delete** – delete module and its lessons

**Lesson form (Add / Edit):**

- **Lesson Title** (required)
- **Duration** (e.g. `5min`, `10min`)
- **Video URL** (optional)

---

## Example Flow

1. **Create a course**  
   Manage Courses → Add Course → Fill form → Create

2. **Add content**  
   Click **Content** on the new course

3. **Add first module**  
   Add Module → e.g. “Introduction” → Add Module

4. **Add lessons**  
   Click **Lesson** under the module → Add “What is React?” (5min) → Add Lesson → Add more lessons as needed

5. **Add more modules**  
   Add Module → e.g. “Components & Props” → Add lessons to it

6. **Edit**  
   Use Edit on modules/lessons to update titles, duration, or video URLs

---

## Data Model

```
Course
├── title, instructor, description, category
└── modules[]
    └── Module
        ├── title
        └── lessons[]
            └── Lesson
                ├── title
                ├── duration
                └── videoUrl (optional)
```

---

## Sidebar Navigation

| Item           | Path                        |
|----------------|-----------------------------|
| Course         | `/dashboard/course`          |
| **Manage Courses** | `/dashboard/course/manage` |
| Category       | `/dashboard/category`        |
| Enrollment     | `/dashboard/enrollment`      |
| Teachers       | `/dashboard/teachers`        |
