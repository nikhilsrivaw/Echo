import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";

import { supportAgent } from "../system/ai/agent/supportAgent";
import { MessageDoc, saveMessage } from "@convex-dev/agent";

import { paginationOptsValidator, PaginationResult } from "convex/server";
import { Doc } from "../_generated/dataModel";

export const getOne = query({
    args:{
        conversationId : v.id("conversations"),
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
            code : "NOT_FOUND",
            message:"Conversation not found"
        })
       }
       if(conversation.organizationId !== orgId){
        throw new ConvexError({
            code : "UNAUTHORIZED",
            message:"Invalid organziation ID"
        })
       }

       const contactSession = await ctx.db.get(conversation.contactSessionId);
       if(!conversation){
        throw new ConvexError({
            code : "NOT_FOUND",
            message:"Contact session not found"
        })
       }

       return {
        ...conversation,
        contactSession
       };

    }
})


  
export const getMany = query({
    args:{
      
         paginationOpts : paginationOptsValidator,
         status: v.optional(
            v.union(
                v.literal("unresolved"),
                v.literal("esclated"),
                v.literal("resolved")
            )
         )
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

       let conversation:PaginationResult<Doc<"conversations">>;
       if(args.status){
        conversation = await ctx.db.query("conversations").withIndex("by_status_and_organization_id" , (q)=>
            q
             .eq(
                "status",
                args.status as Doc<"conversations">["status"]
             )
             .eq("organizationId" , orgId)
        )
        .order("desc")
        .paginate(args.paginationOpts)
       }else{
        conversation = await ctx.db
            .query("conversations")
            .withIndex("by_organization_id", (q)=> q.eq("organizationId" , orgId))
            .order("desc")
            .paginate(args.paginationOpts)
       }

       const conversationwithAdditionalData = await Promise.all(
        conversation.page.map(async (conversation)=>{
            let lastMessage:MessageDoc | null = null;
            
            const contactSession = await ctx.db.get(conversation.contactSessionId);
            if(!contactSession){
                return null;
            }

            const messages = await supportAgent.listMessages(ctx , {
                threadId : conversation.threadId,
                paginationOpts: {numItems:1,cursor:null},
            });
            if(messages.page.length >0){
                lastMessage= messages.page[0] ?? null
            }
            return {
                ...conversation,
                lastMessage,
                contactSession
            };


        })
       );

       const validConversations = conversationwithAdditionalData.filter(
        
        (conv): conv is NonNullable<typeof conv> => conv !== null)
       
       return {
        ...conversation,
        page: validConversations,

       }
    }
})
