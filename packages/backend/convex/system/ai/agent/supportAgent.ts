import { google } from '@ai-sdk/google';
import {Agent} from "@convex-dev/agent"
import {components} from "../../../_generated/api"



export const supportAgent = new Agent(components.agent , {
    chat: google.chat("gemini-2.5-flash"),
    instructions :`You are a customer support agent. Use "resolveConversation" toll when user expresees finalization of the conversation . use "esclatedConversation" toll when user expresses frustration , or requests a human explicitly.`,
    
})