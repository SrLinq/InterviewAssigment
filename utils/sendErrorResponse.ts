import { Response } from "express";

const NOT_FOUND_KEYWORDS = ["not found", "does not exist"];
const BAD_REQUEST_KEYWORDS = [
  "invalid",
  "required",
  "must",
  "cannot",
  "provide",
  "already exists",
  "does not belong",
];

export const sendErrorResponse = (
  res: Response,
  error: unknown
): Response => {
  if (!(error instanceof Error)) {
    return res.status(500).json({ error: "Unexpected server error" });
  }

  const message = error.message;
  const normalized = message.toLowerCase();

  if (NOT_FOUND_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return res.status(404).json({ error: message });
  }

  if (BAD_REQUEST_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return res.status(400).json({ error: message });
  }

  return res.status(500).json({ error: "Unexpected server error" });
};
