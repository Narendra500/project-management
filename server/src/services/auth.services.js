import prisma from "#config/prisma.client";
import { generateRandomName } from "#utils/random.name.generator";

export async function createUser(userName, hashedPassword) {
    return await prisma.user.create({
        data: {
            name: userName,
            hashedPassword: hashedPassword,
            displayName: generateRandomName(),
        },
    });
}

export async function checkIfUserExists(userName) {
    return await prisma.user.findFirst({
        where: {
            name: userName,
        },
    });
}

export async function resetPassword(userName, newHashedPassword) {
    await prisma.user.update({
        data: {
            hashedPassword: newHashedPassword,
        },
        where: {
            userName: userName,
        },
    });
}

export async function addUserEmailVerificationToken(userId, token, expiresAt) {
    return await prisma.userEmailVerificationToken.create({
        data: {
            userId: userId,
            verificationToken: token,
            expiresAt: expiresAt,
        },
    });
}

export async function verifyEmail(userId, token) {
    return await prisma.$transaction(async (tx) => {
        // get all user tokens
        const userTokens = await tx.userEmailVerificationToken.findMany({
            where: {
                userId: userId,
            },
        });

        for (const userToken of userTokens) {
            // user token is same as given token and it is not expired
            if (token === userToken.verificationToken && userToken.expiresAt > new Date()) {
                const verifyUser = await tx.user.update({
                    where: {
                        id: userId,
                    },
                    data: {
                        isVerified: true,
                    },
                });

                if (verifyUser) return true; // user verification updated
                return false; // if user table isn't updated we weren't able to update the verification status
            }
        }

        return false; // no user token matchs the given token
    });
}

export async function getUserTokens(userId) {
    return await prisma.userEmailVerificationToken.findMany({
        where: {
            userId: userId,
        },
    });
}
