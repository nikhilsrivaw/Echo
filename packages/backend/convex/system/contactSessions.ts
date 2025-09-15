import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

export const getOne = internalQuery({
    args:{
        contactsessionId : v.id("contactSessions")
    },
    handler: async (ctx,args)=>{
        return await ctx.db.get(args.contactsessionId)
    }
})