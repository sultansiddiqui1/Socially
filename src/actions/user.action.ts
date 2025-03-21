// a server action,from next.js. they are asynchronous functions that are exectued in the server and can be called from the server and client,, used for form submisisons and data mutations.
"use server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
export async function syncUser() {
  // syncing user to database:
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return;
    }
    //check if user exists:
    const existingUser = await prisma.user.findUnique({
      where: {
        ClerkId: userId,
      },
    });

    if (existingUser) {
      return existingUser;
    }
    const dbUser = await prisma.user.create({
      // user is the name of the table
      data: {
        ClerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        // just making sure the username is defined and not null and just getting the part before the @
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });

    return dbUser;
  } catch (error) {
    console.log("error in sync user", error);
  }
}

export async function getUserByClerkId(ClerkId: string) {
  return prisma.user.findUnique({
    where: {
      ClerkId,
    },
    include: {
      // include basically is the equivalent of join
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
}

// utility function:

export async function getDbUserId() {
  // coming from clerk
  const { userId: ClerkId } = await auth();
  if (!ClerkId) return null;

  const user = await getUserByClerkId(ClerkId);
  if (!user) throw new Error("user not found");
  // we  just want to return the id
  return user.id;
}

export async function getRnadomUsers() {
  try {
    const userId = await getDbUserId();
    // so it should get 3 users,excvluding ourselves and users we follow:
    if (!userId) return [];

    const randomUsers = await prisma.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } },
          {
            NOT: {
              followers: {
                some: {
                  followerId: userId,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
      take: 3,
    });

    return randomUsers;
  } catch (error) {
    console.log("error fetching random users");
    return [];
  }
}

export async function toggleFollow(targetUserId: string) {
  try {
    const userId = await getDbUserId();
    // checking if we are trying to follow ourselves:
    if (targetUserId === userId) throw new Error("You cannot follow yourself");
    if (!userId) return;

    const existingFollow = await prisma.follows.findUnique({
      where: {
        // using the @@id to see if we follow the user:
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    // if its a existing follower, we are trying to unfollow:
    if (existingFollow) {
      // unfollow
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      //follow
      // we use transaction to do this. we would like to create a notification and a follow record. either both should success or both should fail, which is only possible through a transaction.
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId,
          },
        }),
        prisma.notification.create({
          data: {
            type: "FOLLOW",
            userId: targetUserId,
            creatorId: userId,
          },
        }),
      ]);
    }

    //revalidate home page:
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error };
  }
}
