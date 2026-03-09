// hooks/useCompanyStatus.ts
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";

export function useCompanyStatus() {
    const { company, user } = useAuthStore();
    const [isApproved, setIsApproved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.role === 'REGISTERED_COMPANY') {
            setIsApproved(company?.status === 'APPROVED');
        }
        setIsLoading(false);
    }, [company, user]);

    return { isApproved, isLoading };
}