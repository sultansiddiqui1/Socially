import {
  getProfileByUsername,
  getUserLikedPosts,
  getUserPosts,
  isFollowing,
} from "@/actions/profile.action";
import { notFound } from "next/navigation";
import React from "react";
import ProfilePageClient from "./ProfilePageClient";

//when we visit a profile, we want the  name of the browser to say the name of the user, this is a special function coming from next.js
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  console.log("generate meta data");
  const resolvedParams = await params;
  const user = await getProfileByUsername(resolvedParams.username);
  if (!user) return;

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || ` check out ${user.username}'s profile.`,
  };
  // the logical or also checks for empty strings, 0,andd false where as the ?? checks for null and undefined.
}

const profilePageServer = async ({
  params,
}: {
  params: Promise<{ username: string }>;
}) => {
  const resolvedParams = await params;
  const user = await getProfileByUsername(resolvedParams.username);
  if (!user) notFound(); //ps: the notFound() is also a page from next.js

  const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
  ]);
  // we want to return a client component to have some interactivity so returning that
  return (
    <ProfilePageClient
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      isFollowing={isCurrentUserFollowing}
    />
  );
};

export default profilePageServer;
