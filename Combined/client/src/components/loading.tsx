import { PulseLoader } from "react-spinners";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center w-screen h-screen">
            <PulseLoader color="#e61ee6" />
        </div>
    );
}
