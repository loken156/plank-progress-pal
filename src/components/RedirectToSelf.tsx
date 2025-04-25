import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function RedirectToSelf() {
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user }, error }) => {
            if (error || !user) {
                navigate("/auth", { replace: true });
            } else {
                navigate(`/profile/${user.id}`, { replace: true });
            }
        });
    }, [navigate]);

    return null;  // nothing to render
}