import { useEffect, useRef, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Instagram, Send, User, Ghost, ArrowLeft } from 'lucide-react';
import axios from 'axios';

interface Message {
    id: number;
    direction: 'in' | 'out';
    text: string;
    created_at: string;
}

interface Conversation {
    id: string;
    platform: 'telegram' | 'instagram';
    name: string;
    username: string | null;
    last_message: {
        text: string;
        direction: 'in' | 'out';
        created_at: string;
    } | null;
    unread_count: number;
    updated_at: string;
}

export default function ChatIndex({ conversations }: { conversations: Conversation[] }) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const [convList, setConvList] = useState<Conversation[]>(conversations);
    const [filter, setFilter] = useState<'mixed' | 'telegram' | 'instagram'>('mixed');
    
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    const bottomRef = useRef<HTMLDivElement>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Chat Hub', href: '/chat' },
    ];

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadMessages = async (conv: Conversation) => {
        setActiveConversation(conv);
        setMessages([]); // Clear while loading
        
        try {
            const res = await axios.get(`/chat/${conv.platform}/${conv.id}/messages`);
            setMessages(res.data.messages || []);
            
            // Mark as read locally in list
            setConvList((prev) => 
                prev.map(c => 
                    c.id === conv.id && c.platform === conv.platform 
                        ? { ...c, unread_count: 0 } 
                        : c
                )
            );
        } catch (e) {
            console.error('Failed to load messages', e);
        }
    };

    useEffect(() => {
        if (!window.Echo || !auth?.user?.id) return;

        const channel = window.Echo.private(`seller.${auth.user.id}`);

        channel.listen('.TelegramMessageReceived', (data: any) => {
            handleIncomingMessage('telegram', data.customer_id?.toString() || data.id?.toString(), {
                id: data.id,
                direction: 'in',
                text: data.text,
                created_at: data.created_at,
            });
        });

        channel.listen('.InstagramMessageReceived', (data: any) => {
            handleIncomingMessage('instagram', data.sender_instagram_id?.toString() || data.sender_id?.toString(), {
                id: data.id,
                direction: 'in',
                text: data.text,
                created_at: data.created_at,
            });
        });

        return () => {
            channel.stopListening('.TelegramMessageReceived');
            channel.stopListening('.InstagramMessageReceived');
        };
    }, [auth?.user?.id, activeConversation]);

    const handleIncomingMessage = (platform: 'telegram' | 'instagram', senderId: string, newMessage: Message) => {
        // If it's the active conversation, append message to chat
        if (activeConversation && activeConversation.platform === platform && activeConversation.id === senderId) {
            setMessages(prev => [...prev, newMessage]);
            
            // Also notify backend that we "read" it by calling the messages endpoint again or custom endpoint.
            // For simplicity, we just let it be. Next fetch will clear it.
        }

        // Update conversation list
        setConvList((prev) => {
            const idx = prev.findIndex((c) => c.id === senderId && c.platform === platform);
            const newList = [...prev];
            
            if (idx >= 0) {
                const conv = newList[idx];
                const isActive = activeConversation?.id === conv.id && activeConversation?.platform === conv.platform;
                
                newList[idx] = {
                    ...conv,
                    last_message: {
                        text: newMessage.text,
                        direction: 'in',
                        created_at: newMessage.created_at,
                    },
                    unread_count: isActive ? 0 : conv.unread_count + 1,
                    updated_at: newMessage.created_at,
                };
            } else {
                // Future: fetch new conversation info from backend if unknown
            }
            
            // Re-sort by updated_at
            return newList.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !activeConversation || isSending) return;

        const text = messageInput.trim();
        setMessageInput('');
        setIsSending(true);

        try {
            const res = await axios.post(`/chat/${activeConversation.platform}/${activeConversation.id}/send`, {
                text: text
            });
            
            if (res.data.status === 'success') {
                const newMsg = res.data.message;
                setMessages(prev => [...prev, newMsg]);
                
                // Update sidebar
                setConvList(prev => {
                    const idx = prev.findIndex(c => c.id === activeConversation.id && c.platform === activeConversation.platform);
                    if (idx >= 0) {
                        const newList = [...prev];
                        newList[idx] = {
                            ...newList[idx],
                            last_message: {
                                text: newMsg.text,
                                direction: 'out',
                                created_at: newMsg.created_at,
                            },
                            updated_at: newMsg.created_at,
                        };
                        return newList.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
                    }
                    return prev;
                });
            }
        } catch (e) {
            console.error('Failed to send message', e);
        } finally {
            setIsSending(false);
        }
    };

    const filteredConvs = convList.filter(c => filter === 'mixed' || c.platform === filter);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Chat Hub" />

            <div className="flex h-[calc(100vh-8rem)] w-full flex-col md:flex-row overflow-hidden rounded-xl border bg-card shadow-sm mt-4 mx-6 max-w-[calc(100%-3rem)]">
                
                {/* SIDEBAR */}
                <div className={`w-full md:w-1/3 flex-col border-r bg-muted/10 ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
                    {/* Header & Filters */}
                    <div className="p-4 border-b bg-background z-10">
                        <h2 className="text-xl font-bold tracking-tight mb-4">Messages</h2>
                        <div className="flex bg-muted p-1 rounded-lg gap-1">
                            <button 
                                onClick={() => setFilter('mixed')}
                                className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${filter === 'mixed' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Mixed
                            </button>
                            <button 
                                onClick={() => setFilter('telegram')}
                                className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${filter === 'telegram' ? 'bg-background shadow-sm text-[#0088cc]' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Telegram
                            </button>
                            <button 
                                onClick={() => setFilter('instagram')}
                                className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${filter === 'instagram' ? 'bg-background shadow-sm text-[#E1306C]' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Instagram
                            </button>
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredConvs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground opacity-60 h-full">
                                <MessageCircle className="mb-3 h-10 w-10" />
                                <p className="text-sm">No messages found</p>
                            </div>
                        ) : (
                            filteredConvs.map((conv) => {
                                const isActive = activeConversation?.id === conv.id && activeConversation?.platform === conv.platform;
                                return (
                                    <button
                                        key={`${conv.platform}-${conv.id}`}
                                        onClick={() => loadMessages(conv)}
                                        className={`w-full text-left flex items-center gap-3 p-4 transition-all border-b last:border-b-0
                                            ${isActive ? 'bg-primary/5 hover:bg-primary/10 relative' : 'hover:bg-muted/50'}
                                        `}
                                    >
                                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md"></div>}
                                        
                                        <div className="relative">
                                            <div className="bg-muted flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full overflow-hidden">
                                                <User className="text-muted-foreground h-5 w-5" />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm">
                                                {conv.platform === 'telegram' 
                                                    ? <MessageCircle className="h-4 w-4 text-[#0088cc] fill-[#0088cc]" />
                                                    : <Instagram className="h-4 w-4 text-[#E1306C]" />
                                                }
                                            </div>
                                        </div>
                                        
                                        <div className="min-w-0 flex-1 overflow-hidden">
                                            <div className="flex items-center justify-between">
                                                <span className={`font-medium ${conv.unread_count > 0 ? 'text-foreground font-semibold' : 'text-foreground/90'} truncate`}>
                                                    {conv.name}
                                                </span>
                                                <span className="text-muted-foreground text-[10px] whitespace-nowrap ml-2">
                                                    {conv.updated_at ? new Date(conv.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                                                </span>
                                            </div>
                                            
                                            <div className="mt-0.5 flex items-center justify-between gap-2">
                                                <p className={`line-clamp-1 text-xs ${conv.unread_count > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                                    {conv.last_message
                                                        ? (conv.last_message.direction === 'out' ? 'You: ' : '') + conv.last_message.text
                                                        : 'No messages yet'}
                                                </p>
                                                {conv.unread_count > 0 && (
                                                    <Badge className="h-5 min-w-5 rounded-full px-1.5 text-[10px] bg-primary">
                                                        {conv.unread_count}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* MAIN CHAT AREA */}
                <div className={`w-full md:w-2/3 flex-col bg-background/50 relative ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
                    {!activeConversation ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                            <Ghost className="h-16 w-16 mb-4" />
                            <h3 className="text-lg font-medium">Select a chat to start messaging</h3>
                            <p className="text-sm mt-1">Choose a conversation from the sidebar.</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="flex items-center gap-3 border-b px-4 py-3 bg-background z-10 shadow-sm">
                                <Button variant="ghost" size="icon" onClick={() => setActiveConversation(null)} className="md:hidden">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <div className="bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                                    {activeConversation.platform === 'telegram' 
                                        ? <MessageCircle className="h-5 w-5 text-[#0088cc] fill-[#0088cc]" />
                                        : <Instagram className="h-5 w-5 text-[#E1306C]" />
                                    }
                                </div>
                                <div>
                                    <p className="font-semibold leading-none">
                                        {activeConversation.name}
                                    </p>
                                    <p className="text-muted-foreground text-xs mt-1 capitalize flex items-center gap-1">
                                        {activeConversation.platform}
                                        {activeConversation.username ? ` • @${activeConversation.username}` : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                                {messages.length === 0 ? (
                                    <div className="flex justify-center my-10 text-xs text-muted-foreground">
                                        This is the beginning of your conversation.
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.direction === 'out' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[75%] md:max-w-md rounded-2xl px-4 py-2 text-sm shadow-sm ${
                                                    msg.direction === 'out'
                                                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                                                        : 'bg-muted/80 rounded-bl-sm border border-border/50'
                                                }`}
                                            >
                                                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                                <p
                                                    className={`mt-1 text-right text-[10px] ${
                                                        msg.direction === 'out' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    {new Date(msg.created_at).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={bottomRef} className="h-1" />
                            </div>

                            {/* Message Input */}
                            <form onSubmit={handleSend} className="flex flex-row items-end gap-2 border-t px-4 py-3 bg-background">
                                <Input
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-muted/50 border-muted-foreground/20 focus-visible:ring-1"
                                    autoComplete="off"
                                />
                                <Button type="submit" size="icon" disabled={isSending || !messageInput.trim()} className="rounded-full h-10 w-10 shrink-0 shadow-sm transition-transform active:scale-95">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
