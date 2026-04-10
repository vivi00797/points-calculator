import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

export const images = sqliteTable("images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url").notNull(),
  weekNumber: integer("week_number").notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  imageId: integer("image_id").references(() => images.id, { onDelete: "cascade" }).notNull(),
  text: text("text").notNull(),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const imagesRelations = relations(images, ({ many }) => ({
  tags: many(tags),
}));

export const tagsRelations = relations(tags, ({ one }) => ({
  image: one(images, {
    fields: [tags.imageId],
    references: [images.id],
  }),
}));

export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  weekNumber: integer("week_number").unique().notNull(),
  content: text("content").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});
