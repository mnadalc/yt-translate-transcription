type TranscriptSuccessResponse = {
  success: true;
  transcript: string;
};

type TranscriptErrorResponse = {
  success: false;
  error: string;
};

export type TranscriptResponse =
  | TranscriptSuccessResponse
  | TranscriptErrorResponse;
