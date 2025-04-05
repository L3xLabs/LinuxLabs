// components/Feed.tsx
"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Search, Settings, ChevronDown, MessageSquare, ThumbsUp, PlusCircle, FileText } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

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
}

export default function Feed() {
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const posts: Post[] = [
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
        }
      ]
    }
  ];

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
            <div key={post.id} className="mb-8">
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
                <div className="flex items-center">
                  <Button variant="ghost" size="sm" className="text-gray-500 flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{post.likes}</span>
                  </Button>
                </div>
                <div className="flex items-center ml-4">
                  <Button variant="ghost" size="sm" className="text-gray-500 flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.comments}</span>
                  </Button>
                </div>
              </div>
              
              {/* Add comment section */}
              <div className="mb-6 border rounded-lg">
                <div className="flex p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/avatars/albert.jpg" alt="Current user" />
                    <AvatarFallback>AF</AvatarFallback>
                  </Avatar>
                  <div className="ml-3 flex-grow">
                    <Input
                      type="text"
                      placeholder="Add a comment"
                      className="border-0 shadow-none p-2"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                  </div>
                  <Button className="bg-blue-500 hover:bg-blue-600">
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
                    <Button variant="ghost" size="sm" className="text-gray-500 text-sm flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{comment.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500 text-sm flex items-center gap-1 ml-4">
                      <MessageSquare className="h-3 w-3" />
                      <span>{comment.comments}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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
              
              {/* Ask a question */}
              <div className="text-center my-6">
                <p className="text-gray-500">Ask a question or start a post</p>
              </div>
              
              {/* Anonymous toggle */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">Anonymous Post</p>
                <Switch 
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
              </div>
              
              {/* Add media and create poll */}
              <div className="flex items-center text-blue-500 mb-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="mr-4 px-0">
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Media
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Image</DropdownMenuItem>
                    <DropdownMenuItem>Video</DropdownMenuItem>
                    <DropdownMenuItem>Document</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="px-0">
                      <FileText className="h-4 w-4 mr-1" />
                      Create Poll
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Multiple Choice</DropdownMenuItem>
                    <DropdownMenuItem>Yes/No</DropdownMenuItem>
                    <DropdownMenuItem>Rating</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Privacy settings */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-gray-600 mb-4 px-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    Who can see my post?
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Everyone</DropdownMenuItem>
                  <DropdownMenuItem>Friends</DropdownMenuItem>
                  <DropdownMenuItem>Only Me</DropdownMenuItem>
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
                  <DropdownMenuItem>Everyone</DropdownMenuItem>
                  <DropdownMenuItem>Friends</DropdownMenuItem>
                  <DropdownMenuItem>No One</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Post button */}
              <Button className="w-full bg-blue-500 hover:bg-blue-600 mt-2">
                Post
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}