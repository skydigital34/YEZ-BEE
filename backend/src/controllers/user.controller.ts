import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';
import { delFromCache } from '../config/redis';

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const allowedFields = ['name', 'phone'];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new AppError('No valid fields to update', 400);
    }

    const user = await User.findByIdAndUpdate(userId, updateData);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    await delFromCache(`user:${userId}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required', 400);
    }

    if (newPassword.length < 8) {
      throw new AppError('New password must be at least 8 characters', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await User.comparePassword(currentPassword, user.password as string);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401);
    }

    user.password = newPassword;
    await User.findByIdAndUpdate(userId, { password: newPassword });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getAddresses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { label, fullName, phone, line1, line2, city, state, pincode, country, isDefault, addressType } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.addresses.length >= 10) {
      throw new AppError('Maximum 10 addresses allowed', 400);
    }

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      label: label || 'Home',
      fullName,
      phone,
      line1,
      line2,
      city,
      state,
      pincode,
      country: country || 'India',
      isDefault: isDefault || user.addresses.length === 0,
      addressType: addressType || 'home',
    });

    await User.findByIdAndUpdate(userId, { addresses: user.addresses });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const addressIndex = user.addresses.findIndex((addr: any) => (addr.id === id || addr._id === id));
    if (addressIndex === -1) {
      throw new AppError('Address not found', 404);
    }

    if (updateData.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses[addressIndex] = { ...user.addresses[addressIndex], ...updateData };
    await User.findByIdAndUpdate(userId, { addresses: user.addresses });

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const addressIndex = user.addresses.findIndex((addr: any) => (addr.id === id || addr._id === id));
    if (addressIndex === -1) {
      throw new AppError('Address not found', 404);
    }

    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await User.findByIdAndUpdate(userId, { addresses: user.addresses });

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    if (!req.file) {
      throw new AppError('No image file provided', 400);
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'yezbee-fashion/avatars',
      width: 400,
      height: 400,
      crop: 'fill',
    });

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.avatar?.publicId) {
      await deleteFromCloudinary(user.avatar.publicId).catch(() => {});
    }

    const avatar = {
      url: result.url,
      publicId: result.publicId,
    };

    await User.findByIdAndUpdate(userId, { avatar });

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: { url: result.url },
    });
  } catch (error) {
    next(error);
  }
};
