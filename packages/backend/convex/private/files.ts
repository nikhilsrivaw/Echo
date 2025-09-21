import { ConvexError, v } from "convex/values";
import { action, mutation } from "../_generated/server";
import {contentHashFromArrayBuffer, guessMimeTypeFromContents , guessMimeTypeFromExtension, vEntryId,} from "@convex-dev/rag"
import rag from "../system/ai/rag";
import { extractTextContent } from "../lib/extractTextContent";
import { Id } from "../_generated/dataModel";
function guessMimeType(filename : string , bytes: ArrayBuffer): string{
    return(
        guessMimeTypeFromExtension(filename)||
        guessMimeTypeFromContents(bytes) ||
        "application/octet-steam"
    )

}

export const addFile = action({
    args:{
        filename : v.string(),
        mimeType: v.string(),
        bytes: v.bytes(),
        category: v.optional(v.string()),
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
                });
            }
            const {bytes , filename , category } = args ;
            const mimeType = args.mimeType || guessMimeType(filename, bytes);

            const blob = new Blob([bytes] , {type:mimeType});

            const storageId = await ctx.storage.store(blob);

            const  text = await extractTextContent(ctx , {
                storageId,
                filename,
                bytes,
                mimeType, 
            });


            const {entryId , created} = await rag.add(ctx , {
                // super important what seach space to add this to you cannot 
                namespace: orgId,
                text,
                key: filename,
                title:filename,
                metadata :{
                    storageId ,
                    uploadedBy: orgId,
                    filename,
                    category: category ?? null,
                },
                contentHash: await contentHashFromArrayBuffer(bytes) // to avoid re-insertimg if the file content hasnt changd \\\


            })


            if(!created){
                console.debug("entry already exists , skipping upoad metadata ");
                await ctx.storage.delete(storageId);
            }

            return {
                url: await ctx.storage.getUrl(storageId),
                entryId,
            }






    }
});


export const deleteFile = mutation({
    args:{
        entryId: vEntryId,


    }, handler: async (ctx , args)=>{
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
                });
            }


            const namespace = await rag.getNamespace(ctx , {
                namespace: orgId,
            })
            if(!namespace){
                throw new ConvexError({
                    code: "UNAUTHORIZED",
                    message:"Invalid namespace"
                })
            }

            const entry = await rag.getEntry(ctx , {
                entryId: args.entryId,
            })
            if(!entry){
                throw new ConvexError({
                    code:"not_found",
                    message:"Entry not found"
                })

            }

            if(entry.metadata?.updatedBy !== orgId){
                throw new ConvexError({
                    code:"UNAUTHORIZED",
                    message:"invalid organization id "
                })
            }


            if(entry.metadata?.storageId){
                await ctx.storage.delete(entry.metadata.storageId as Id<"_storage">);
            }

            await rag.deleteAsync(ctx, {
                entryId: args.entryId
            })



    
    }

});