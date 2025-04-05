// components/Feed.tsx
"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Search, Settings, ChevronDown, MessageSquare, ThumbsUp, PlusCircle, FileText, Eye, Image as ImageIcon, Paperclip } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Comment {
  id: number;
  author: {
    name: string;
    avatar: string;
    initials: string;
  };
  content: string;
  date: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

interface Post {
  id: number;
  author: {
    name: string;
    avatar: string;
    initials: string;
  };
  title?: string;
  content: string;
  date: string;
  likes: number;
  comments: number;
  commentsList: Comment[];
  isLiked: boolean;
}

export default function Feed() {
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [postPrivacy, setPostPrivacy] = useState('Everyone');
  const [commentPermission, setCommentPermission] = useState('Everyone');
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [pollDialogOpen, setPollDialogOpen] = useState(false);
  
  // State for posts
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: {
        name: 'Albert Flores',
        avatar: '/avatars/albert.jpg',
        initials: 'AF',
      },
      title: 'TF-IDF Content Optimisation: Your Guide to an Underappreciated SEO Concept',
      content: 'In mauris porttitor tincidunt mauris massa sit lorem sed scelerisque. Fringilla pharetra vel massa enim sollicitudin cras. At pulvinar eget sociis adipiscing eget donec ultricies nibh tristique. Adipiscing dui orci ac purus lacus, nulla auctor. Ultrices sit leo diam etiam cras cras fermentum.',
      date: 'Aug 19, 2021',
      likes: 5,
      comments: 3,
      isLiked: false,
      commentsList: [
        {
          id: 1,
          author: {
            name: 'Ralph Edwards',
            avatar: '/avatars/ralph.jpg',
            initials: 'RE',
          },
          content: 'In mauris porttitor tincidunt mauris massa sit lorem sed scelerisque. Fringilla pharetra vel massa enim sollicitudin cras. At pulvinar eget sociis adipiscing eget donec ultricies nibh tristique.',
          date: 'Aug 19, 2021',
          likes: 5,
          comments: 3,
          isLiked: false,
        },
        {
          id: 2,
          author: {
            name: 'Ralph Edwards',
            avatar: '/avatars/ralph.jpg',
            initials: 'RE',
          },
          content: 'In mauris porttitor tincidunt mauris massa sit lorem sed scelerisque. Fringilla pharetra vel massa enim sollicitudin cras. At pulvinar eget sociis adipiscing eget donec ultricies nibh tristique.',
          date: 'Aug 19, 2021',
          likes: 0,
          comments: 0,
          isLiked: false,
        },
        {
          id: 3,
          author: {
            name: 'Ralph Edwards',
            avatar: '/avatars/ralph.jpg',
            initials: 'RE',
          },
          content: 'In mauris porttitor tincidunt mauris massa sit lorem sed scelerisque. Fringilla pharetra vel massa enim sollicitudin cras. At pulvinar eget sociis adipiscing eget donec ultricies nibh tristique.',
          date: 'Aug 19, 2021',
          likes: 0,
          comments: 0,
          isLiked: false,
        }
      ]
    }
  ]);

  // Function to handle liking a post
  const handleLikePost = (postId: number) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked
          };
        }
        return post;
      })
    );
  };

  // Function to handle liking a comment
  const handleLikeComment = (postId: number, commentId: number) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const updatedComments = post.commentsList.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                isLiked: !comment.isLiked
              };
            }
            return comment;
          });
          return { ...post, commentsList: updatedComments };
        }
        return post;
      })
    );
  };

  // Function to add a new comment to a post
  const addComment = (postId: number) => {
    if (!newComment.trim()) return;
    
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const newCommentObj: Comment = {
            id: post.commentsList.length + 1,
            author: {
              name: 'Current User',
              avatar: '/avatars/user.jpg',
              initials: 'CU',
            },
            content: newComment,
            date: new Date().toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            likes: 0,
            comments: 0,
            isLiked: false,
          };
          
          return {
            ...post,
            comments: post.comments + 1,
            commentsList: [...post.commentsList, newCommentObj]
          };
        }
        return post;
      })
    );
    
    setNewComment('');
  };

  // Function to create a new post
  const createNewPost = () => {
    if (!newPostContent.trim()) return;
    
    const newPost: Post = {
      id: posts.length + 1,
      author: {
        name: isAnonymous ? 'Anonymous User' : 'Current User',
        avatar: isAnonymous ? '/avatars/anonymous.jpg' : '/avatars/user.jpg',
        initials: isAnonymous ? 'AU' : 'CU',
      },
      title: newPostTitle.trim() ? newPostTitle : undefined,
      content: newPostContent,
      date: new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      likes: 0,
      comments: 0,
      isLiked: false,
      commentsList: []
    };
    
    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
  };

  return (
    <div className="max-w-6xl mx-auto bg-white shadow rounded-lg">
      {/* Top navigation bar */}
      <div className="border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="relative w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search flowwbook..."
            className="pl-10 pr-4 py-2 w-full border-gray-300"
          />
        </div>
        <Settings className="text-gray-500 cursor-pointer h-5 w-5" />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-3 gap-6 p-4">
        {/* Left 2/3 - Posts */}
        <div className="col-span-2">
          <h1 className="text-2xl font-bold mb-6">Recent Posts</h1>
          
          {posts.map((post) => (
            <Card key={post.id} className="mb-8 shadow-sm">
              <CardContent className="p-6">
                {/* Post author */}
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback>{post.author.initials}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <h3 className="font-medium">{post.author.name}</h3>
                  </div>
                </div>
                
                {/* Post title & content */}
                {post.title && (
                  <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                )}
                <p className="text-gray-600 mb-2">{post.content}</p>
                <p className="text-sm text-gray-400 mb-4">{post.date}</p>
                
                {/* Post stats */}
                <div className="flex items-center mb-6">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleLikePost(post.id)}
                    className={cn(
                      "text-gray-500 flex items-center gap-1",
                      post.isLiked && "text-blue-500 font-medium"
                    )}
                  >
                    <ThumbsUp className={cn("h-4 w-4", post.isLiked && "fill-blue-500")} />
                    <span>{post.likes}</span>
                  </Button>
                  <div className="flex items-center ml-4">
                    <Button variant="ghost" size="sm" className="text-gray-500 flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </Button>
                  </div>
                </div>
                
                {/* Add comment section */}
                <div className="mb-6 border rounded-lg overflow-hidden">
                  <div className="flex p-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/avatars/user.jpg" alt="Current user" />
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
                          if (e.key === 'Enter') {
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
                {post.commentsList.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-4 rounded-lg mb-2">
                    <div className="flex items-center mb-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                        <AvatarFallback>{comment.author.initials}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <h4 className="font-medium">{comment.author.name}</h4>
                        <p className="text-xs text-gray-400">{comment.date}</p>
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
                          comment.isLiked && "text-blue-500 font-medium"
                        )}
                      >
                        <ThumbsUp className={cn("h-3 w-3", comment.isLiked && "fill-blue-500")} />
                        <span>{comment.likes}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-500 text-sm flex items-center gap-1 ml-4">
                        <MessageSquare className="h-3 w-3" />
                        <span>{comment.comments}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
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
              
              {/* Collaboration image */}
              <div className="relative bg-white rounded-lg overflow-hidden mb-4">
                <Image 
                  src="/api/placeholder/400/200" 
                  alt="Collaboration" 
                  width={400}
                  height={200}
                  className="w-full h-auto"
                />
                <div className="absolute right-8 top-1/2 -translate-y-1/2">
                  <Avatar className="border-2 border-white">
                    <AvatarImage src="/avatars/user.jpg" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
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
                    <p className="text-gray-500">Drop files here or click to upload</p>
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
                <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
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
                          <p className="text-gray-500 mb-2">Drag and drop files here</p>
                          <p className="text-gray-400 text-sm">or</p>
                          <Button variant="secondary" size="sm" className="mt-2">
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
                        <span className="text-sm text-gray-500">Poll duration</span>
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
                  <Button variant="ghost" size="sm" className="w-full justify-start text-gray-600 mb-4 px-0">
                    <Eye className="h-4 w-4 mr-1" />
                    Who can see my post?
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setPostPrivacy('Everyone')}>Everyone</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPostPrivacy('Friends')}>Friends</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPostPrivacy('Only Me')}>Only Me</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Comment settings */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-gray-600 mb-4 px-0">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Who can comment on my post?
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setCommentPermission('Everyone')}>Everyone</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCommentPermission('Friends')}>Friends</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCommentPermission('No One')}>No One</DropdownMenuItem>
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