import {createTool} from "@convex-dev/agent"
import { z } from "zod"
import {internal} from "../../../_generated/api"
import { supportAgent } from "../agent/supportAgent"

export const esclateConversation = createTool({
    description:"Esclate a conversation",
    
    args: z.object({}) as any,
    handler:async(ctx)=>{
        if(!ctx.threadId){
            return "Missing thread Id";
        }
        await ctx.runMutation(internal.system.conversations.esclate,{
            threadId : ctx.threadId,
        })

        await supportAgent.saveMessage(ctx , {
            threadId: ctx.threadId,
            message:{
                role:"assistant",
                content:"Conversation esclated to a human operator"
            }
        });


        return "Conversation esclated to a human operator"
    }
});


