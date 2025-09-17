import { Doc } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import {Hint} from "@workspace/ui/components/hint"
import { CheckIcon } from "lucide-react";

export const ConversationStatusButton =({status , onClick , disabled}:{status : Doc<"conversations">["status"]; onClick: ()=>void;  disabled ?: boolean} )=>{
    if(status === "resolved" ){
        return (
            <Hint text="Mark as unresolved">
                <Button disabled={disabled} onClick={onClick} size="sm" variant="tertiary">
                    <CheckIcon/>
                    Resolved

                </Button>


            </Hint>
        )
    }
    if(status === "esclated" ){
        return (
            <Hint  text="Mark as esclated">
                <Button disabled={disabled} onClick={onClick} size="sm" variant="warning">
                    <CheckIcon/>
                    Esclated

                </Button>


            </Hint>
        )
    }
     return (
            <Hint text="Mark as esclated">
                <Button disabled={disabled} onClick={onClick} size="sm" variant="destructive">
                    <CheckIcon/>
                    Unresolved

                </Button>


            </Hint>
        )

}