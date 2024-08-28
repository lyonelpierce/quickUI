import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { NextRequest, NextResponse } from "next/server";

const TextReasoning = z.object({
  output: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("logo");

    if (!imageFile || !(imageFile instanceof File)) {
      return NextResponse.json(
        { error: "No image provided or invalid file" },
        { status: 400 }
      );
    }

    const buffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");
    const mimeType = imageFile.type;

    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Can you extract the text or letters from this logo?",
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      response_format: zodResponseFormat(TextReasoning, "text_reasoning"),
    });

    if (!response.choices[0].message.content)
      return NextResponse.json(
        { error: "Internal Server Error." },
        { status: 500 }
      );

    console.log(response.choices[0].message.content);

    const responseData = JSON.parse(response.choices[0].message.content);
    const wordsOnly = responseData.output;

    console.log(wordsOnly);

    return NextResponse.json({ message: "Success.", data: wordsOnly });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Internal Server Error." },
      { status: 500 }
    );
  }
}
