import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { User as PrismaUser } from '@prisma/client';

const SALT_ROUNDS = 10;

// Define a type for the user we return (without password)
export type SafeUser = Omit<PrismaUser, 'password'> & {
    id: string;
    email: string;
    name?: string | null;
};

export const saltAndHashPassword = async (password: string): Promise<string> => {
    try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Password hashing failed');
    }
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        console.error('Error verifying password:', error);
        throw new Error('Password verification failed');
    }
}

export const getUserFromDb = async (email: string, password: string): Promise<SafeUser | null> => {
    try {
        const user = await db.user.findUnique({
            where: { email }
        });

        if (!user) {
            return null;
        }

        const isValidPassword = await verifyPassword(password, user.password);

        if (!isValidPassword) {
            return null;
        }

        // Omit password from the returned user object
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;

    } catch (error) {
        console.error('Error getting user from database:', error);
        throw new Error('Database query failed');
    }
}

export const createUser = async (email: string, password: string, name?: string): Promise<SafeUser> => {
    try {
        const hashedPassword = await saltAndHashPassword(password);

        const user = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || null
            }
        });

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;

    } catch (error) {
        console.error('Error creating user:', error);
        throw new Error('Failed to create user');
    }
}