"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Settings,
  ChevronDown,
  MessageSquare,
  ThumbsUp,
  PlusCircle,
  FileText,
  Eye,
  Image as ImageIcon,
  Paperclip,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Comment {
  id: number;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  } | null;
  timestamp: string;
  votes: number;
  userVote: string | null;
  isAnonymous: boolean;
}

interface Post {
  id: number;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  } | null;
  isAnonymous: boolean;
  timestamp: string;
  votes: number;
  comments: Comment[];
  userVote: string | null;
}

export default function Feed() {
  const [newComment, setNewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [postPrivacy, setPostPrivacy] = useState("Everyone");
  const [commentPermission, setCommentPermission] = useState("Everyone");
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [pollDialogOpen, setPollDialogOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts from the API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("http://localhost:3003/posts");

        setPosts(response.data.messages || []);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Function to format timestamp
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Function to handle liking a post
  const handleLikePost = (postId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const newVote = post.userVote === "up" ? null : "up";
          const votesChange = post.userVote === "up" ? -1 : 1;

          return {
            ...post,
            votes: post.votes + votesChange,
            userVote: newVote,
          };
        }
        return post;
      })
    );
  };

  // Function to handle liking a comment
  const handleLikeComment = (postId: number, commentId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const updatedComments = post.comments.map((comment) => {
            if (comment.id === commentId) {
              const newVote = comment.userVote === "up" ? null : "up";
              const votesChange = comment.userVote === "up" ? -1 : 1;

              return {
                ...comment,
                votes: comment.votes + votesChange,
                userVote: newVote,
              };
            }
            return comment;
          });
          return { ...post, comments: updatedComments };
        }
        return post;
      })
    );
  };

  // Function to add a new comment to a post
  const addComment = (postId: number) => {
    if (!newComment.trim()) return;

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const newCommentObj: Comment = {
            id: Date.now(),
            author: {
              id: "current-user",
              name: "Current User",
              avatar: "CU",
            },
            content: newComment,
            timestamp: new Date().toISOString(),
            votes: 0,
            userVote: null,
            isAnonymous: false,
          };

          return {
            ...post,
            comments: [...post.comments, newCommentObj],
          };
        }
        return post;
      })
    );

    setNewComment("");
  };

  // Function to create a new post
  const createNewPost = () => {
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: Date.now(),
      author: isAnonymous
        ? null
        : {
            id: "current-user",
            name: "Current User",
            avatar: "CU",
          },
      content: newPostContent,
      timestamp: new Date().toISOString(),
      votes: 0,
      comments: [],
      userVote: null,
      isAnonymous: isAnonymous,
    };

    fetch("http://localhost:3003/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "This is a test post from JavaScript.",
        author: "Rakshit",
        isAnonymous: false,
      }),
    });

    setPosts([newPost, ...posts]);
    setNewPostTitle("");
    setNewPostContent("");
  };

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="max-w-6xl mx-auto bg-white shadow rounded-lg">
      {/* Top navigation bar */}
      <div className="border-b border-gray-200 p-4 flex justify-between items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="relative w-80">
          <Search className="absolute left-3 top-2.5 text-white h-5 w-5" />
          <Input
            type="text"
            placeholder="Search Flowwbook..."
            className="pl-10 pr-4 py-2 w-full border-0 rounded-lg bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white hover:text-blue-600 transition-colors"
          >
            Notifications
          </Button>
          <Settings className="text-white cursor-pointer h-6 w-6 hover:text-gray-200 transition-colors" />
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-3 gap-6 p-4">
        {/* Left 2/3 - Posts */}
        <div className="col-span-2">
          <h1 className="text-2xl font-bold mb-6">Recent Posts</h1>

          {isLoading ? (
            <div className="text-center py-8">
              <p>Loading posts...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4 bg-blue-500 hover:bg-blue-600"
              >
                Retry
              </Button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No posts yet. Be the first to post!</p>
            </div>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="mb-8 shadow-sm">
                <CardContent className="p-6">
                  {/* Post author */}
                  <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12">
                      {post.isAnonymous ? (
                        <>
                          <AvatarFallback>AN</AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarFallback>
                            {post.author?.avatar || "UN"}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div className="ml-4">
                      <h3 className="font-medium">
                        {post.isAnonymous
                          ? "Anonymous"
                          : post.author?.name || "Unknown User"}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {formatDate(post.timestamp)}
                      </p>
                    </div>
                  </div>

                  {/* Post content */}
                  <p className="text-gray-600 mb-4">{post.content}</p>

                  {/* Post stats */}
                  <div className="flex items-center mb-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLikePost(post.id)}
                      className={cn(
                        "text-gray-500 flex items-center gap-1",
                        post.userVote === "up" && "text-blue-500 font-medium"
                      )}
                    >
                      <ThumbsUp
                        className={cn(
                          "h-4 w-4",
                          post.userVote === "up" && "fill-blue-500"
                        )}
                      />
                      <span>{post.votes}</span>
                    </Button>
                    <div className="flex items-center ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 flex items-center gap-1"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.comments.length}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Add comment section */}
                  <div className="mb-6 border rounded-lg overflow-hidden">
                    <div className="flex p-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>CU</AvatarFallback>
                      </Avatar>
                      <div className="ml-3 flex-grow">
                        <Input
                          type="text"
                          placeholder="Add a comment"
                          className="border-0 shadow-none p-2"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              addComment(post.id);
                            }
                          }}
                        />
                      </div>
                      <Button
                        className="bg-blue-500 hover:bg-blue-600"
                        onClick={() => addComment(post.id)}
                      >
                        Post
                      </Button>
                    </div>
                  </div>

                  {/* Comments */}
                  {post.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-gray-50 p-4 rounded-lg mb-2"
                    >
                      <div className="flex items-center mb-2">
                        <Avatar className="h-10 w-10">
                          {comment.isAnonymous ? (
                            <AvatarFallback>AN</AvatarFallback>
                          ) : (
                            <AvatarFallback>
                              {comment.author?.avatar || "UN"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="ml-3">
                          <h4 className="font-medium">
                            {comment.isAnonymous
                              ? "Anonymous"
                              : comment.author?.name || "Unknown User"}
                          </h4>
                          <p className="text-xs text-gray-400">
                            {formatDate(comment.timestamp)}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-600">{comment.content}</p>
                      <div className="flex items-center mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikeComment(post.id, comment.id)}
                          className={cn(
                            "text-gray-500 text-sm flex items-center gap-1",
                            comment.userVote === "up" &&
                              "text-blue-500 font-medium"
                          )}
                        >
                          <ThumbsUp
                            className={cn(
                              "h-3 w-3",
                              comment.userVote === "up" && "fill-blue-500"
                            )}
                          />
                          <span>{comment.votes}</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Right 1/3 - Sidebar */}
        <div className="col-span-1">
          <Card className="bg-gray-100 mb-6">
            <CardContent className="p-4">
              {/* Avatar and most relevant */}
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div className="bg-white text-blue-600 px-2 py-1 rounded-md text-xs">
                  Most Relevant
                </div>
              </div>

              {/* Create Post Area */}
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="text">Text Post</TabsTrigger>
                  <TabsTrigger value="media">Media Post</TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <Input
                    placeholder="Post title (optional)"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="w-full"
                  />
                  <Textarea
                    placeholder="What's on your mind?"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="min-h-32"
                  />
                </TabsContent>

                <TabsContent value="media" className="space-y-4">
                  <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
                    <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">
                      Drop files here or click to upload
                    </p>
                  </div>
                  <Textarea
                    placeholder="Add a caption..."
                    className="min-h-16"
                  />
                </TabsContent>
              </Tabs>

              {/* Anonymous toggle */}
              <div className="flex items-center justify-between my-4">
                <p className="text-gray-600">Anonymous Post</p>
                <Switch
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
              </div>

              {/* Add media and create poll */}
              <div className="flex items-center text-blue-500 mb-4">
                <Dialog
                  open={mediaDialogOpen}
                  onOpenChange={setMediaDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="mr-4 px-0">
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Media
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Media</DialogTitle>
                      <DialogDescription>
                        Attach images, videos, or other files to your post
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="bg-gray-50 rounded-lg border-2 border-dashed p-8 text-center">
                        <div className="flex flex-col items-center">
                          <Paperclip className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-gray-500 mb-2">
                            Drag and drop files here
                          </p>
                          <p className="text-gray-400 text-sm">or</p>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="mt-2"
                          >
                            Browse Files
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={pollDialogOpen} onOpenChange={setPollDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="px-0">
                      <FileText className="h-4 w-4 mr-1" />
                      Create Poll
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Poll</DialogTitle>
                      <DialogDescription>
                        Set up a poll for your audience to vote on
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input placeholder="Poll question" className="mb-2" />
                      <Input placeholder="Option 1" />
                      <Input placeholder="Option 2" />
                      <Input placeholder="Option 3 (optional)" />
                      <Input placeholder="Option 4 (optional)" />

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-500">
                          Poll duration
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              1 day <ChevronDown className="h-4 w-4 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>1 day</DropdownMenuItem>
                            <DropdownMenuItem>3 days</DropdownMenuItem>
                            <DropdownMenuItem>1 week</DropdownMenuItem>
                            <DropdownMenuItem>Custom</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <Button className="w-full">Create Poll</Button>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Privacy settings */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-600 mb-4 px-0"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Who can see my post?
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setPostPrivacy("Everyone")}>
                    Everyone
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPostPrivacy("Friends")}>
                    Friends
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPostPrivacy("Only Me")}>
                    Only Me
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Comment settings */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-600 mb-4 px-0"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Who can comment on my post?
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => setCommentPermission("Everyone")}
                  >
                    Everyone
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setCommentPermission("Friends")}
                  >
                    Friends
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setCommentPermission("No One")}
                  >
                    No One
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Post button */}
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 mt-2"
                onClick={createNewPost}
                disabled={!newPostContent.trim()}
              >
                Post
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
