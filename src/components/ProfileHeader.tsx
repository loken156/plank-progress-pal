import React, { useState, ChangeEvent, FormEvent } from "react";
import { Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
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
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{data.name}</h1>
              <p className="text-lg opacity-90 mb-3">@{data.username}</p>
              <p className="max-w-lg opacity-80 mb-4">{data.bio}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 opacity-70" />
                  <span className="text-sm">Medlem sedan {data.joinDate}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1 opacity-70" />
                  <span className="text-sm">{data.followersCount} Följare</span>
                </div>
              </div>
            </div>
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              Redigera profil
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
            <div className="flex items-center gap-4">
              <img
                src={form.profileImage ?? data.profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
              <Input
                name="profileImage"
                placeholder="Bild-URL"
                defaultValue={data.profileImage}
                onChange={handleChange}
              />
            </div>
            <Input
              name="name"
              placeholder="Fullständigt namn"
              defaultValue={data.name}
              onChange={handleChange}
            />
            <Input
              name="username"
              placeholder="Användarnamn"
              defaultValue={data.username}
              onChange={handleChange}
            />
            <Textarea
              name="bio"
              placeholder="Bio"
              defaultValue={data.bio}
              onChange={handleChange}
              rows={3}
            />
            <div className="flex gap-2">
              <Button type="submit">Spara</Button>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                Avbryt
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default ProfileHeader;
