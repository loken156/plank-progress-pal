// src/pages/AdminChallenges.tsx

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from "@/components/ui/use-toast";

type Challenge = {
    id: number;
    title: string;
    description: string;
    image: string;
    start_date: string;
    start_time: string | null;
    end_date: string;
    participants: number;
    is_active: boolean;
    type: string;
    meeting_url: string | null;
};

const AdminChallenges: React.FC = () => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '',
        start_date: '',
        start_time: '',
        end_date: '',
        type: '',
        meeting_url: '',
        is_active: true
    });

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from<Challenge>('challenges')
            .select(`
        id,
        title,
        description,
        image,
        start_date,
        start_time,
        end_date,
        participants,
        is_active,
        type,
        meeting_url
      `)
            .order('start_date', { ascending: false });

        if (error) {
            toast({
                title: "Error",
                description: "Failed to fetch challenges",
                variant: "destructive"
            });
        } else {
            setChallenges(data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingChallenge) {
            // Update existing challenge
            const { error } = await supabase
                .from('challenges')
                .update(formData)
                .eq('id', editingChallenge.id);

            if (error) {
                toast({ title: "Error", description: "Failed to update challenge", variant: "destructive" });
            } else {
                toast({ title: "Success", description: "Challenge updated successfully" });
                setEditingChallenge(null);
                fetchChallenges();
            }
        } else {
            // Create new challenge
            const { error } = await supabase
                .from('challenges')
                .insert([{ ...formData, participants: 0 }]);

            if (error) {
                toast({ title: "Error", description: "Failed to create challenge", variant: "destructive" });
            } else {
                toast({ title: "Success", description: "Challenge created successfully" });
                fetchChallenges();
            }
        }

        setFormData({
            title: '',
            description: '',
            image: '',
            start_date: '',
            start_time: '',
            end_date: '',
            type: '',
            meeting_url: '',
            is_active: true
        });
    };

    const handleEdit = (challenge: Challenge) => {
        setEditingChallenge(challenge);
        setFormData({
            title: challenge.title,
            description: challenge.description,
            image: challenge.image,
            start_date: challenge.start_date,
            start_time: challenge.start_time ?? '',
            end_date: challenge.end_date,
            type: challenge.type,
            meeting_url: challenge.meeting_url ?? '',
            is_active: challenge.is_active
        });
    };

    const handleDelete = async (id: number) => {
        const { error } = await supabase
            .from('challenges')
            .delete()
            .eq('id', id);

        if (error) {
            toast({ title: "Error", description: "Failed to delete challenge", variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Challenge deleted successfully" });
            fetchChallenges();
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading…</div>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow py-12 px-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold mb-8">
                        Manage Challenges
                    </h1>

                    {/* Challenge Form */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>{editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="image">Image URL</Label>
                                    <Input
                                        id="image"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="start_date">Start Date</Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="start_time">Start Time</Label>
                                        <Input
                                            id="start_time"
                                            type="time"
                                            value={formData.start_time}
                                            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="end_date">End Date</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="type">Type</Label>
                                    <Input
                                        id="type"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="meeting_url">Meeting URL</Label>
                                    <Input
                                        id="meeting_url"
                                        type="url"
                                        value={formData.meeting_url}
                                        onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    <Label htmlFor="is_active">Active</Label>
                                </div>
                                <Button type="submit" className="w-full">
                                    {editingChallenge ? 'Update Challenge' : 'Create Challenge'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Challenges List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {challenges.map((challenge) => (
                            <Card key={challenge.id}>
                                <CardHeader>
                                    <CardTitle>{challenge.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 mb-4">
                                        {challenge.description}
                                    </p>
                                    <div className="text-sm space-y-1">
                                        <p>
                                            <strong>Start:</strong>{" "}
                                            {new Date(challenge.start_date).toLocaleDateString()}{" "}
                                            at {challenge.start_time}
                                        </p>
                                        <p>
                                            <strong>End:</strong>{" "}
                                            {new Date(challenge.end_date).toLocaleDateString()}
                                        </p>
                                        {challenge.meeting_url && (
                                            <p>
                                                <strong>Meeting:</strong>{" "}
                                                <a
                                                    href={challenge.meeting_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-plank-blue hover:underline"
                                                >
                                                    {challenge.meeting_url}
                                                </a>
                                            </p>
                                        )}
                                        <p>
                                            <strong>Type:</strong> {challenge.type}
                                        </p>
                                        <p>
                                            <strong>Participants:</strong> {challenge.participants}
                                        </p>
                                        <p>
                                            <strong>Status:</strong>{" "}
                                            {challenge.is_active ? 'Active' : 'Inactive'}
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleEdit(challenge)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleDelete(challenge.id)}
                                    >
                                        Delete
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AdminChallenges;
