import { Router } from "express";
import { getExerciseLibrary } from "../repositories/exerciseRepo";

export const exercisesRouter = Router();

exercisesRouter.get("/", async (_req, res) => {
  const library = await getExerciseLibrary();
  res.json(library);
});
