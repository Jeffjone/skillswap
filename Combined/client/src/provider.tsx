import type { NavigateOptions } from "react-router-dom";

import { NextUIProvider } from "@nextui-org/system";
import { useHref, useNavigate } from "react-router-dom";
import { ThemeProvider as NextThemesProvider } from "next-themes";

declare module "@react-types/shared" {
    interface RouterConfig {
        routerOptions: NavigateOptions;
    }
}

export function Provider({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    console.log("Provider rendering, navigate function:", typeof navigate);

    return (
        <NextUIProvider navigate={navigate} useHref={useHref}>
            <NextThemesProvider attribute={"class"} defaultTheme="dark">
                {children}
            </NextThemesProvider>
        </NextUIProvider>
    );
}
