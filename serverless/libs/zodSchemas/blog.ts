import { z } from "zod";

export const blogSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description is too long"),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  author: z.object({
    name: z.string().min(1, "Author name is required"),
    avatar: z.string().url().optional(),
  }),
  publishedAt: z
    .union([z.string(), z.date()])
    .optional()
    .default(() => new Date()),
  readingTime: z.number().int().positive().optional(),
  imageUrl: z.string().url().optional(),
  seo: z.object({
    metaTitle: z
      .string()
      .min(1, "Meta title is required")
      .max(60, "Meta title too long"),
    metaDescription: z
      .string()
      .min(1, "Meta description is required")
      .max(160, "Meta description too long"),
    keywords: z.array(z.string()).min(1, "At least one keyword is required"),
  }),
});

export type BlogSchema = z.infer<typeof blogSchema>;
