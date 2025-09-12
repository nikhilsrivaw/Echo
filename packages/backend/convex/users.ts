import { error } from "console";
import {mutation, query} from "./_generated/server"
export const getMany = query({
    args:{},
    //@ts-ignore
    handler: async ( ctx ) =>{
        const users = await ctx.db.query("users").collect();
        return users; 
    }
})

export const add= mutation({
    args: {},
    // @ts-ignore
    handler: async(ctx) =>{
        const identity = await ctx.auth.getUserIdentity();
        if(identity === null){
            throw new Error("unauthenticated")
        }

        const orgId = identity.orgId as string;

        if(!orgId){
            throw new Error("Missing organization ")
        }

        throw new Error("tracking test ")
      
        const userId = await ctx.db.insert("users" , {
            name : " Antonio"
        })

    }
})