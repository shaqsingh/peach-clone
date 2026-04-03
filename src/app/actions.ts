"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";

export async function createPost(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const content = formData.get("content") as string;
  const file = formData.get("media") as File;
  
  let mediaUrl = null;
  let type = "TEXT";

  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split('.').pop() || 'tmp';
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);
    
    mediaUrl = `/uploads/${filename}`;
    type = file.type.startsWith("video/") ? "VIDEO" : "IMAGE";
  }

  if ((!content || content.trim() === "") && !mediaUrl) return;

  await prisma.post.create({
    data: {
      content: content ? content.trim() : null,
      type,
      mediaUrl,
      authorId: session.user.id,
    },
  });

  if (session.user.username) {
    revalidatePath(`/${session.user.username}`);
  }
}

export async function toggleFollow(usernameToFollow: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const targetUser = await prisma.user.findUnique({ where: { username: usernameToFollow } });
  if (!targetUser) throw new Error("User not found");

  if (targetUser.id === session.user.id) throw new Error("You cannot follow yourself");

  const existingFollow = await prisma.follows.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetUser.id,
      },
    },
  });

  if (existingFollow) {
    await prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUser.id,
        },
      },
    });
  } else {
    await prisma.follows.create({
      data: {
        followerId: session.user.id,
        followingId: targetUser.id,
      },
    });
  }

  revalidatePath(`/${usernameToFollow}`);
  revalidatePath(`/`);
}

export async function saveSettings(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const displayName = formData.get("displayName") as string;
  const themePrimary = formData.get("themePrimary") as string;
  const themeSecondary = formData.get("themeSecondary") as string;
  const showActivity = formData.get("showActivity") === "on";
  const bgImageFile = formData.get("bgImage") as File;
  const avatarFile = formData.get("avatar") as File;

  let bgImageUrl = undefined;
  let avatarUrl = undefined;

  if (bgImageFile && bgImageFile.size > 0) {
    const bytes = await bgImageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = bgImageFile.name.split('.').pop() || 'tmp';
    const filename = `bg_${Date.now()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);
    bgImageUrl = `/uploads/${filename}`;
  }

  if (avatarFile && avatarFile.size > 0) {
    const bytes = await avatarFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = avatarFile.name.split('.').pop() || 'tmp';
    const filename = `avatar_${session.user.id}_${Date.now()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);
    avatarUrl = `/uploads/${filename}`;
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      displayName: displayName || undefined,
      themePrimary: themePrimary || undefined,
      themeSecondary: themeSecondary || undefined,
      showActivity,
      ...(bgImageUrl !== undefined && { bgImageUrl }),
      ...(avatarUrl !== undefined && { image: avatarUrl }),
    }
  });

  if (session.user.username) {
    revalidatePath(`/${session.user.username}`);
  }
  revalidatePath("/settings");
}

export async function updateUserActivity() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { lastActive: new Date() },
  });
}


export async function setUsername(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const username = formData.get("username") as string;
  if (!username || username.trim().length < 3) throw new Error("Invalid username (min 3 chars)");

  const cleanedUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");

  const existing = await prisma.user.findFirst({ where: { username: cleanedUsername } });
  if (existing) throw new Error("Username already taken");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { username: cleanedUsername, displayName: cleanedUsername }
  });

  revalidatePath("/");
}

export async function deletePost(postId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Post not found");

  if (post.authorId !== session.user.id) throw new Error("Unauthorized to delete this post");

  await prisma.post.delete({ where: { id: postId } });

  if (post.mediaUrl) {
    const uploadDir = join(process.cwd(), "public");
    await unlink(join(uploadDir, post.mediaUrl)).catch(() => {});
  }

  if (session.user.username) {
    revalidatePath(`/${session.user.username}`);
  }
}

export async function createComment(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const content = formData.get("content") as string;
  const postId = formData.get("postId") as string;
  const targetUsername = formData.get("targetUsername") as string;

  if (!content || content.trim().length === 0) return;

  const targetUser = await prisma.user.findUnique({
    where: { username: targetUsername }
  });

  if (!targetUser) throw new Error("User not found");

  const isOwnFeed = session.user.id === targetUser.id;

  if (!isOwnFeed) {
    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUser.id,
        },
      },
    });
    if (!follow) throw new Error("You must follow this user to comment");
  }

  await prisma.comment.create({
    data: {
      content: content.trim(),
      postId,
      authorId: session.user.id,
    }
  });

  revalidatePath(`/${targetUsername}`);
}

export async function createInvite(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  const email = formData.get("email") as string;
  if (!email || !email.includes("@")) throw new Error("Invalid email");

  await prisma.invite.create({
    data: {
      email: email.toLowerCase().trim(),
      invitedBy: session.user.id,
    },
  });

  revalidatePath("/admin");
}

export async function deleteInvite(inviteId: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.invite.delete({
    where: { id: inviteId },
  });

  revalidatePath("/admin");
}

export async function deleteUser(userId: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (user.id === session.user.id) throw new Error("You cannot delete yourself");

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/admin");
}

