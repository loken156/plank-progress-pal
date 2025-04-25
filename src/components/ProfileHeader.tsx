import React, {
    useState,
    useRef,
    ChangeEvent,
    FormEvent,
    useEffect,
} from "react";
import { Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export interface ProfileData {
    name: string;
    username: string;
    profileImage: string;
    bio: string;
    joinDate: string;
    followersCount: number;
}

interface ProfileHeaderProps {
    data: ProfileData;
    onSave: (updated: Partial<ProfileData>) => Promise<void>;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ data, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<Partial<ProfileData>>({});
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // make sure form.profileImage has initial value when entering edit mode
    useEffect(() => {
        if (isEditing) {
            setForm({
                profileImage: data.profileImage,
                name: data.name,
                username: data.username,
                bio: data.bio,
            });
        }
    }, [isEditing, data]);

    function handleChange(
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);

        try {
            // 1) Get the current user
            const {
                data: { user },
                error: userErr,
            } = await supabase.auth.getUser();
            if (userErr || !user) {
                throw userErr || new Error("You must be logged in");
            }

            // 2) Build a filename inside the bucket (no "avatars/" prefix)
            const ext = file.name.split(".").pop();
            const fileName = `${user.id}_${Date.now()}${ext ? "." + ext : ""}`;

            // 3) Upload to the 'avatars' bucket
            const { error: uploadErr } = await supabase.storage
                .from("avatars")
                .upload(fileName, file, { upsert: true });
            if (uploadErr) throw uploadErr;

            // 4) Retrieve the public URL
            const { data: urlData, error: urlErr } = supabase.storage
                .from("avatars")
                .getPublicUrl(fileName);
            if (urlErr) throw urlErr;

            // 5) Update your form state so the new avatar previews immediately
            setForm((f) => ({
                ...f,
                profileImage: urlData.publicUrl,
            }));
            toast.success("Profile picture uploaded!");
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Could not upload the image.");
        } finally {
            setUploading(false);
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        await onSave(form);
        setIsEditing(false);
        setForm({});
    }

    return (
        <section className="bg-gradient-to-r from-plank-blue to-plank-green text-white py-12 px-6">
            <div className="container mx-auto">
                {!isEditing ? (
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden flex-shrink-0">
                            <img
                                src={data.profileImage}
                                alt={data.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold mb-1">
                                {data.name}
                            </h1>
                            <p className="text-lg opacity-90 mb-3">@{data.username}</p>
                            <p className="max-w-lg opacity-80 mb-4">{data.bio}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1 opacity-70" />
                                    <span className="text-sm">
                                        Member since {data.joinDate}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <User className="h-4 w-4 mr-1 opacity-70" />
                                    <span className="text-sm">
                                        {data.followersCount} Followers
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button variant="secondary" onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </Button>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4 max-w-xl mx-auto text-black"
                    >
                        {/* Avatar chooser */}
                        <div className="flex items-center gap-4">
                            <div
                                className={`w-24 h-24 rounded-full overflow-hidden cursor-pointer border-2 ${uploading ? "opacity-50 animate-pulse" : "border-white"
                                    }`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <img
                                    src={form.profileImage}
                                    alt="Profile picture"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Name, username, bio */}
                        <Input
                            name="name"
                            placeholder="Full name"
                            value={form.name}
                            onChange={handleChange}
                        />
                        <Input
                            name="username"
                            placeholder="Username"
                            value={form.username}
                            onChange={handleChange}
                        />
                        <Textarea
                            name="bio"
                            placeholder="Bio"
                            value={form.bio}
                            onChange={handleChange}
                            rows={3}
                        />

                        <div className="flex gap-2">
                            <Button type="submit">Save</Button>
                            <Button variant="ghost" onClick={() => setIsEditing(false)}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
};

export default ProfileHeader;
