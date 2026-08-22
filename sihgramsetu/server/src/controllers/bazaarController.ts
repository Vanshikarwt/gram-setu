import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middlewares/auth';

/**
 * Create a new Bazaar Post (Need or Offer).
 */
export const createBazaarPost = async (req: AuthRequest, res: Response) => {
  try {
    const authorId = req.user?.id;
    if (!authorId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type, content, location } = req.body;

    if (!type || (type !== 'need' && type !== 'offer')) {
      return res.status(400).json({ error: "Type is required and must be 'need' or 'offer'" });
    }

    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Fetch author's default location if location is not provided
    let postLocation = location ? String(location).trim() : null;
    if (!postLocation) {
      const user = await prisma.user.findUnique({ where: { id: authorId } });
      postLocation = user?.location || null;
    }

    const post = await prisma.bazaarPost.create({
      data: {
        authorId,
        type: String(type).trim(),
        content: String(content).trim(),
        location: postLocation,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            phone: true,
            location: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: 'Bazaar post created successfully',
      post,
    });
  } catch (err: any) {
    console.error('Create Bazaar Post Error:', err);
    return res.status(500).json({ error: 'Server error creating Bazaar post' });
  }
};

/**
 * Get feed of Bazaar posts (ordered newest first).
 * Optional query parameter: ?type=need or ?type=offer
 */
export const getBazaarPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query;

    const whereClause: any = {};
    if (type && (type === 'need' || type === 'offer')) {
      whereClause.type = String(type);
    }

    const posts = await prisma.bazaarPost.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            phone: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      posts,
    });
  } catch (err: any) {
    console.error('Get Bazaar Posts Error:', err);
    return res.status(500).json({ error: 'Server error fetching Bazaar posts' });
  }
};

/**
 * Delete a Bazaar post. Author ownership required.
 */
export const deleteBazaarPost = async (req: AuthRequest, res: Response) => {
  try {
    const authorId = req.user?.id;
    const { id } = req.params;

    if (!authorId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const existingPost = await prisma.bazaarPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return res.status(404).json({ error: 'Bazaar post not found' });
    }

    if (existingPost.authorId !== authorId) {
      return res.status(401).json({ error: 'Unauthorized: You did not author this post' });
    }

    await prisma.bazaarPost.delete({
      where: { id },
    });

    return res.status(200).json({
      message: 'Bazaar post deleted successfully',
    });
  } catch (err: any) {
    console.error('Delete Bazaar Post Error:', err);
    return res.status(500).json({ error: 'Server error deleting Bazaar post' });
  }
};
