import { ReactNode } from "react";

interface Props {
    children: ReactNode;
}

export default function Container(props: Props) {
    return (
        <div className="flex flex-col w-screen min-h-screen h-full max-w-full">
            {props.children}
        </div>
    );
}
