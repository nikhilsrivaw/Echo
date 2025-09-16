import { ArrowRightIcon , ArrowUpIcon , CheckIcon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"


interface conversationStatusIconProps {
    //"unresolved" | "esclated" | "resolved"
    status : "unresolved" | "esclated" | "resolved",
    className ?: string;
};


const statusConfig = {
    resolved:{
        icon:CheckIcon,
        bgColor:"bg-[#3FB62F]"
    },
    unresolved:{
        icon:ArrowRightIcon,
        bgColor:"bg-destructive"
    },
    esclated:{
        icon:ArrowUpIcon,
        bgColor:"bg-yellow-500"
    },

} as const;

export const ConversationStatusIcon = ({
    status,
    className

}: conversationStatusIconProps)=>{
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
        <div className={cn("flex items-center justify-center round-full size-5", config.bgColor , className)}>
            <Icon className="size-3 stroke-3 text-white  "/>
        </div>


    )
}