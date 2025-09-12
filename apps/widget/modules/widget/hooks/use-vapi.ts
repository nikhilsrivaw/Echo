import Vapi from "@vapi-ai/web";
import { useEffect, useState } from "react";


interface TransScriptMessage {
    role: "user" | "assistant";
    text: string;
};

export const useVapi = () => {
    const [vapi, setVapi] = useState<Vapi | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isConnecting, setIsConnecting] = useState<boolean>(false);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const [transcript, setTranscript] = useState<TransScriptMessage[]>([]);


    useEffect(() => {
        // only for testing we are adding our keys beacuse user submit there own keys 
        const vapiInstance = new Vapi("5e5e0d51-483d-4f8a-b318-4ef62aac6de5");

        setVapi(vapiInstance);

        vapiInstance.on("call-start", () => {
            setIsConnected(true);
            setIsConnecting(false);
            setTranscript([])
        });

        vapiInstance.on("call-end", () => {
            setIsConnected(false);
            setIsConnecting(false);
            setIsSpeaking(false);
        });

        vapiInstance.on("speech-start", () => {
            setIsSpeaking(true);
        });

        vapiInstance.on("speech-end", () => {
            setIsSpeaking(false);
        });


        vapiInstance.on("error", (error) => {
            console.log(error, "VAPI_ERROR");
            setIsConnecting(false);
        });

        vapiInstance.on("message", (message) => {


            if (message.type === "transcript" && message.transcriptType === "final") {
                
                setTranscript((prev) => [
                    ...prev,
                    {
                        role: message.role === "user" ? "user" : "assistant",
                        text: message.text
                    }
                ]);
            }
        });

        return () => {
            vapiInstance?.stop();
        }
    }, []);



    const startCall = () => {
        setIsConnecting(true);
        if (vapi) {
            // only for testing 
            vapi.start("d89a3210-fb03-4a19-92eb-db0dd4e05d08");
        }
    }

    const endCall = () => {
        if (vapi) {
            vapi.stop();
        }
    };
    return {
        isSpeaking,
        isConnecting,
        isConnected,
        transcript,
        startCall,
        endCall,
    }







}