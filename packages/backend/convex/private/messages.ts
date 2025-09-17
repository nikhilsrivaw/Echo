
import { ConvexError, v } from "convex/values";
import { action, mutation, query } from "../_generated/server";
import { components, internal } from "../_generated/api";
import { supportAgent } from "../system/ai/agent/supportAgent";
import { paginationOptsValidator } from "convex/server";
import { threadId } from "worker_threads";
import { saveMessage, saveMessages } from "@convex-dev/agent";

export const create =mutation({
    args:{
        prompt: v.string(),
        conversationId : v.id("conversations")
        
    },
    handler: async (ctx , args)=>{
          const indentity = await ctx.auth.getUserIdentity();
       if(indentity === null){
        throw new ConvexError({
            code:"UNAUTHORIZZED",
            message:"Indentity not found"
        })
       }
       const orgId = indentity.orgId as string;
       if(!orgId){
        throw new ConvexError({
            code : "UNAUTHORIZZED",
            message:"Oragnization not found"
        })
       }
        const conversation = await ctx.db.get(args.conversationId);

        if(!conversation){
            throw new ConvexError({
                code:"NOT_FOUND",
                message:"Conversation not found",

            })
        }
        if(conversation.organizationId !== orgId){
        throw new ConvexError({
            code : "UNAUTHORIZZED",
            message:" invalid OragnizationiD"
        })

       }

        if(conversation.status === "resolved"){
            throw new ConvexError({
                code:"BAD_REQUEST",
                message:"Conversation resolved",
            })
        }

        await saveMessage(ctx , components.agent , {
            threadId: conversation.threadId,
            //TODO: check if agentname is needed or not 
            agentName: indentity.familyName,
            message:{
                role:"assistant",
                content: args.prompt,
            }
        })

        /// todo subscription check 

        
    }
})

export const getMany = query({
    args:{
        threadId: v.string(),
        paginationOpts: paginationOptsValidator,
        
    },
    handler: async(ctx , args)=>{
        const indentity = await ctx.auth.getUserIdentity();
       if(indentity === null){
        throw new ConvexError({
            code:"UNAUTHORIZZED",
            message:"Indentity not found"
        })
       }
       const orgId = indentity.orgId as string;
       if(!orgId){
        throw new ConvexError({
            code : "UNAUTHORIZZED",
            message:"Oragnization not found"
        })
       }

       const conversation = await ctx.db.query("conversations").withIndex("by_thread_id" , (q)=> q.eq("threadId" , args.threadId)).unique()
        if(!conversation){
        throw new ConvexError({
            code : "NOT_FOUND",
            message:"conversation not found"
        })
       }

       if(conversation.organizationId !== orgId){
        throw new ConvexError({
            code : "UNAUTHORIZZED",
            message:" invalid OragnizationiD"
        })

       }

        const paginated = await supportAgent.listMessages(ctx,{
            threadId: args.threadId,
            paginationOpts : args.paginationOpts,
            
        });
        return paginated;

    }
})