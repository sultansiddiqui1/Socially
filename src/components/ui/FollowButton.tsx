"use client";
import React, { useState } from "react";
import { Button } from "./button";
import { Loader2Icon } from "lucide-react";
import toast from "react-hot-toast";
import { toggleFollow } from "@/actions/user.action";

const FollowButton = ({ userId }: { userId: string }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      // calling a server function and passing the if of the user we want to follow
      await toggleFollow(userId);
      toast.success("user followed succesfully");
    } catch {
      toast.error("Error Following the user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button
        size={"sm"}
        variant={"secondary"}
        onClick={handleFollow}
        disabled={isLoading}
        className="w-20"
      >
        {isLoading ? (
          <Loader2Icon className="w-4 h-4 animate-spin" />
        ) : (
          "Follow"
        )}
      </Button>
    </div>
  );
};

export default FollowButton;
