"use client";
import { useUser } from "@clerk/nextjs";
import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { ImageIcon, Loader2Icon, SendIcon } from "lucide-react";
import { Button } from "./ui/button";
import { createPost } from "@/actions/post.action";
import toast from "react-hot-toast";
import ImageUpload from "./ImageUpload";

const CreatePost = () => {
  // using the useUser hook from clerk:
  const { user } = useUser();

  // getting the content and image that  the user enters in the post:
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  // the isPosting will be used to introduce a loader when the post button is clicked.
  const [isPosting, setIsPosting] = useState(false);
  // when the photo button is clicked, we want to show a dropdown
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl) return;
    setIsPosting(true);
    try {
      const result = await createPost(content, imageUrl);
      if (result && result.success) {
        setContent("");
        setImageUrl("");
        setShowImageUpload(false);
        // we would also like to show a toast, like a confirmation that the post is done. we do this using react hot toast
        toast.success("Post Created Successfully");
        //toast.error
      }
    } catch (error) {
      toast.error("failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.imageUrl || "/avatar.png"} />
              </Avatar>
              <Textarea
                placeholder="What's on your mind?"
                className="min-h-[100px] resize-none border-none focus-visible:ring-0 p-0 text-base"
                value={content}
                // binding value to our state
                onChange={(e) => setContent(e.target.value)}
                // when the value changes bind it to the state
                disabled={isPosting}
              />
            </div>

            {/* image uplaod */}
            {(showImageUpload || imageUrl) && (
              <div className="border ronded-lg p-4">
                <ImageUpload
                  endpoint="postImage"
                  value={imageUrl}
                  onChange={(url) => {
                    setImageUrl(url);
                    if (!url) setShowImageUpload(false);
                  }}
                />
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => setShowImageUpload(!showImageUpload)}
                  disabled={isPosting}
                >
                  <ImageIcon className="size-4 mr-2" />
                  Photo
                </Button>
              </div>
              <Button
                className="flex items-center"
                onClick={handleSubmit}
                disabled={(!content.trim() && !imageUrl) || isPosting}
              >
                {isPosting ? (
                  <>
                    <Loader2Icon className="size-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <SendIcon className="size-4 mr-2" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePost;
