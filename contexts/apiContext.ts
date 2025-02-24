import type { AllGames } from "@/types/codes";
import { createContext } from "react";

export const ApiContext = createContext<AllGames | null>(null);
