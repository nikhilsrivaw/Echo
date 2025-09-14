"use client"

import { useAtomValue, useSetAtom } from "jotai";

import { contactSessionIdAtomFamily, errorMessageAtom, loadingMessageAtom, organizationIdAtom, screenAtom } from "../../atoms/widget-atoms";
import { WidgetHeader } from "../components/widget-header";
import { LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation , useAction } from "convex/react";
import { api } from "@workspace/backend/_generated/api";


type InitStep = "storage" | "org" | "session" | "vapi" | "done" | "settings";

export const WidgetLoadingScreen=({organizationId}:{organizationId : string | null})=>{
    const [step , setStep] = useState<InitStep>("org");
    const [sessionValid , setSessionValid] =  useState(false);
    const setScreen = useSetAtom(screenAtom)
    const setLoadingMessage = useSetAtom(loadingMessageAtom);
    const setOrganizationId = useSetAtom(organizationIdAtom);
    const contactSessionId = useAtomValue(contactSessionIdAtomFamily(organizationId || ""))


    const loadingMessage = useAtomValue(loadingMessageAtom);
    const setErrorMessage = useSetAtom(errorMessageAtom);
    const validateOrganization = useAction(api.public.organization.validate)
    useEffect(()=>{
        if ( step !== "org"){
            return ;
        }
        setLoadingMessage("finding organization Id ")
        if(!organizationId){
            setErrorMessage("organization Id required ");
            setScreen("error");
            return;
        }
        

        setLoadingMessage("verifying organization")

        validateOrganization({organizationId}).then((result) =>{
            if(result.valid){
                setOrganizationId(organizationId);
                setStep("session");
            }else{
                setErrorMessage(result.reason || "invalid configuration")
                setScreen("error");
            }
        }).catch(()=>{
            setErrorMessage("unable to verify organization");
            setScreen("error")
        })

    } , [step , organizationId , setErrorMessage , setScreen , setOrganizationId , setStep, validateOrganization , setLoadingMessage ]);
    // step -2 validate session
    const validateContactSession = useMutation(api.public.contactSessions.validate);

    useEffect(()=>{
        if(step !=="session"){
            return ;
        }
        setLoadingMessage("finding contact session Id ")
        if(!contactSessionId){
            setSessionValid(false);
            setStep("done");
            return;
        }


        setLoadingMessage("Validating Session ..");


        validateContactSession({
            contactSessionId : contactSessionId 
        }).then((result)=>{
            setSessionValid(result.valid);
            setStep("done");
        }).catch(()=>{
            setSessionValid(false);
            setStep("done");
        })



    },[step , contactSessionId , validateContactSession , setLoadingMessage])
    useEffect(()=>{
        if(step !== "done"){
            return ;
        }

        const hasValuidSession = contactSessionId && sessionValid;
        setScreen(hasValuidSession ? "selection" : "auth")
    },[step , contactSessionId , sessionValid , setScreen]);

    return (
        <>
            <WidgetHeader>
                <div className = " flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
                    <p className = 'text-3xl '>
                        Hi there!
                    </p>
                    <p className="text-large">
                        Lets get you started 
                    </p>


                </div>
            </WidgetHeader>
            <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
                <LoaderIcon className="animate-spin"/>
                <p className="text-sm">
                   {loadingMessage || "loading .."}
                </p>

            </div>
        
        </>
    )
}
