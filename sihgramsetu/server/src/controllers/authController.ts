import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { AuthRequest } from '../middlewares/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'gramsetu_super_secret_jwt_key_2026';

export const register = async (req: Request, res: Response) => {
  try {
    const { phone, password, name, location } = req.body;

    if (!phone || !password || !name) {
      return res.status(400).json({ error: 'Phone number, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone: String(phone).trim() },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this phone number already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        phone: String(phone).trim(),
        password: hashedPassword,
        name: String(name).trim(),
        location: location ? String(location).trim() : null,
      },
    });

    // Generate token
    const token = jwt.sign(
      { id: newUser.id, phone: newUser.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userWithoutPassword,
    });
  } catch (err: any) {
    console.error('Registration Error:', err);
    return res.status(500).json({ error: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone number and password are required' });
    }

    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone: String(phone).trim() },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, phone: user.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });
  } catch (err: any) {
    console.error('Login Error:', err);
    return res.status(500).json({ error: 'Server error during login' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      user: userWithoutPassword,
    });
  } catch (err: any) {
    console.error('GetMe Error:', err);
    return res.status(500).json({ error: 'Server error fetching user profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, village, state, preferredLanguage, location } = req.body;

    let newLocation = location;
    if (!newLocation && (village || state)) {
      const v = village ? String(village).trim() : '';
      const s = state ? String(state).trim() : '';
      newLocation = v && s ? `${v}, ${s}` : (v || s || undefined);
    }

    const updateData: any = {};
    if (name) updateData.name = String(name).trim();
    if (newLocation !== undefined) updateData.location = String(newLocation).trim();
    if (preferredLanguage) updateData.preferredLanguage = String(preferredLanguage).trim();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: userWithoutPassword,
    });
  } catch (err: any) {
    console.error('Update Profile Error:', err);
    return res.status(500).json({ error: 'Server error updating profile' });
  }
};
