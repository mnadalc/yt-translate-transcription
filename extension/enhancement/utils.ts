const HF_ENDPOINT =
  "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";

export async function enhanceTranscriptWithAI(
  transcript: string
): Promise<string> {
  try {
    const response = await fetch(HF_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: transcript,
        parameters: {
          max_length: 150,
          min_length: 30,
          do_sample: false,
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        const resetTime = response.headers.get("x-ratelimit-reset");
        const resetDate = resetTime
          ? new Date(parseInt(resetTime) * 1000)
          : null;
        const resetMsg = resetDate
          ? `Try again after ${resetDate.toLocaleTimeString()}`
          : "Try again later";
        throw new Error(`Rate limit exceeded. ${resetMsg}`);
      }

      if (response.status === 503) {
        throw new Error(
          "Model is loading. Please wait 20 seconds and try again"
        );
      }

      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(
      "%cEnhanced transcript:",
      "background-color: green; color: white",
      data
    );

    return data[0].summary_text;
  } catch (error) {
    console.error("Error enhancing transcript with AI:", error);
    throw error;
  }
}
