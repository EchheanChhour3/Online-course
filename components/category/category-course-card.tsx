"use client";

export interface CategoryCourseCardProps {
  title: string;
  instructor: string;
  imageSrc?: string;
}

export function CategoryCourseCard({
  title,
  instructor,
  imageSrc,
}: CategoryCourseCardProps) {
  return (
    <article className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all">
      <div className="aspect-video bg-gray-100 flex items-center justify-center">
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
        <p className="text-gray-500 text-sm">By prof. {instructor}</p>
      </div>
    </article>
  );
}
