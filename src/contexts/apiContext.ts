import type { AllGames, AllGamesImages } from "../types/codes";
import { createContext } from "react";

export const ApiContext = createContext<AllGames | null>(null);

export const ApiImagesContext = createContext<AllGamesImages | null>(null);
