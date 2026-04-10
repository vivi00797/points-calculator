import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { db } from './db';
import { images, tags, notes } from './db/schema';

import { eq, desc } from 'drizzle-orm';
import { generateTagsForImage } from './services/ai';
import fs from 'fs';


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 静态图片服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const upload = multer({
  dest: path.join(__dirname, '../uploads/'),
});

app.get('/api/images', async (req, res) => {
  try {
    const allImages = await db.query.images.findMany({
      with: {
        tags: true,
      },
      orderBy: [desc(images.createdAt)]
    });
    res.json(allImages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const { weekNumber, dayOfWeek } = req.body;
    
    // Save to DB
    const imageUrl = `/uploads/${req.file.filename}`;
    const [newImage] = await db.insert(images).values({
      url: imageUrl,
      weekNumber: parseInt(weekNumber) || 1,
      dayOfWeek: parseInt(dayOfWeek) || 1,
    }).returning();

    // Call AI to generate tags
    const generatedTags = await generateTagsForImage(req.file.path);
    
    const tagsToInsert = generatedTags.map(tag => ({
      imageId: newImage.id,
      text: tag
    }));

    if (tagsToInsert.length > 0) {
      await db.insert(tags).values(tagsToInsert);
    }

    const imageWithTags = await db.query.images.findFirst({
      where: eq(images.id, newImage.id),
      with: { tags: true }
    });

    res.json(imageWithTags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.delete('/api/tags/:id', async (req, res) => {
  try {
    const tagId = parseInt(req.params.id);
    await db.delete(tags).where(eq(tags.id, tagId));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

app.delete('/api/images/:id', async (req, res) => {
  try {
    const imageId = parseInt(req.params.id);
    
    const [image] = await db.select().from(images).where(eq(images.id, imageId));

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const filename = path.basename(image.url);
    const filePath = path.join(__dirname, '../uploads/', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await db.delete(images).where(eq(images.id, imageId));

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

app.post('/api/images/:id/reanalyze', async (req, res) => {
  try {
    const imageId = parseInt(req.params.id);
    
    const [image] = await db.select().from(images).where(eq(images.id, imageId));

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const filename = path.basename(image.url);
    const filePath = path.join(__dirname, '../uploads/', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Image file missing on disk' });
    }

    const generatedTags = await generateTagsForImage(filePath);

    await db.delete(tags).where(eq(tags.imageId, imageId));
    
    const tagsToInsert = generatedTags.map(tag => ({
      imageId: imageId,
      text: tag
    }));

    if (tagsToInsert.length > 0) {
      await db.insert(tags).values(tagsToInsert);
    }

    const updatedImage = await db.query.images.findFirst({
      where: eq(images.id, imageId),
      with: { tags: true }
    });

    res.json(updatedImage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Re-analysis failed' });
  }
});


app.get('/api/notes/:weekNumber', async (req, res) => {
  try {
    const weekNumber = parseInt(req.params.weekNumber);
    const note = await db.query.notes.findFirst({
      where: eq(notes.weekNumber, weekNumber)
    });
    res.json(note || { content: '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const { weekNumber, content } = req.body;
    
    // Check if exists
    const existing = await db.query.notes.findFirst({
      where: eq(notes.weekNumber, weekNumber)
    });

    if (existing) {
      // Update
      await db.update(notes)
        .set({ content, updatedAt: new Date().toISOString() })
        .where(eq(notes.weekNumber, weekNumber));
    } else {
      // Insert
      await db.insert(notes).values({
        weekNumber,
        content
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save notes' });
  }
});

app.listen(port, () => {

  console.log(`Backend is running at http://localhost:${port}`);
});
