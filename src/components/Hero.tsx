"use client";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { extractColors } from "extract-colors";
import Dropzone, { FileRejection } from "react-dropzone";

import { Button } from "@/components/ui/button";
import { CheckIcon, UploadIcon, WandSparklesIcon, XIcon } from "lucide-react";

import { Color } from "@/constants/Color";
import { PreviewFile } from "@/types/File";
import { maxSize } from "@/constants/Image";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import Image from "next/image";
import { ScrollArea } from "./ui/scroll-area";

import chroma from "chroma-js";

const Hero = () => {
  const [file, setFile] = useState<PreviewFile | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [primaryColor, setPrimaryColor] = useState<string | null>(null);
  const [secondaryColor, setSecondaryColor] = useState<string | null>(null);

  const shadeLevels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  const handleDrop = async (
    acceptedFiles: File[],
    rejectedFiles: FileRejection[]
  ) => {
    if (acceptedFiles.length > 1) {
      toast.error("Event has not been created");
      return;
    }

    if (acceptedFiles.length === 1) {
      const selectedFile = acceptedFiles[0];
      const newFile = Object.assign(selectedFile, {
        preview: URL.createObjectURL(selectedFile),
      });

      setFile(newFile);
      const extractedColors = (await extractColors(newFile.preview)) as Color[];
      const limitedColors = extractedColors.slice(0, 5);

      setPrimaryColor(null);
      setSecondaryColor(null);

      setColors(limitedColors.map((color) => color.hex));
    }

    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file }) => {
        toast.error(`File ${file.name} was rejected`);
      });
    }
  };

  const calculateLuminance = (color: string): number => {
    const rgb = color
      .replace(/^#/, "")
      .match(/.{2}/g)
      ?.map((x) => parseInt(x, 16) / 255) || [0, 0, 0];

    const [r, g, b] = rgb.map((x) =>
      x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const getTextColor = (backgroundColor: string): string => {
    const luminance = calculateLuminance(backgroundColor);
    return luminance > 0.5 ? "#000" : "#fff";
  };

  const handleColorClick = (color: string) => {
    if (color === primaryColor) {
      setPrimaryColor(null);
    } else if (color === secondaryColor) {
      setSecondaryColor(null);
    } else if (!primaryColor) {
      setPrimaryColor(color);
    } else if (!secondaryColor) {
      setSecondaryColor(color);
    } else {
      toast.error("You can only select a primary and a secondary color.");
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("logo", file as File);

      const response = await fetch("/api/logo/text", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
    } catch (error) {
      console.error(error);
    }
  };

  const getShades = (color: string): Record<number, string> => {
    const shades = {
      50: chroma(color).brighten(3).hex(),
      100: chroma(color).brighten(2.5).hex(),
      200: chroma(color).brighten(2).hex(),
      300: chroma(color).brighten(1.5).hex(),
      400: chroma(color).brighten(1).hex(),
      500: color, // The base color itself
      600: chroma(color).darken(0.5).hex(),
      700: chroma(color).darken(1).hex(),
      800: chroma(color).darken(1.5).hex(),
      900: chroma(color).darken(2).hex(),
      950: chroma(color).darken(3).hex(),
    };

    return shades;
  };

  function hexToRgb(hex: string) {
    // Remove the leading '#' if present
    hex = hex.replace("#", "");

    // Parse the hex color into its RGB components
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `(${r}, ${g}, ${b})`;
  }

  function hexToHsl(hex: string): string {
    // Remove the leading '#' if present
    hex = hex.replace("#", "");

    // Parse the hex color into its RGB components
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    // Convert RGB values to the range of 0-1
    const rNormalized = r / 255;
    const gNormalized = g / 255;
    const bNormalized = b / 255;

    // Find the maximum and minimum values of R, G, and B.
    const max = Math.max(rNormalized, gNormalized, bNormalized);
    const min = Math.min(rNormalized, gNormalized, bNormalized);

    // Initialize h, s, l
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    // Calculate saturation and hue
    if (max !== min) {
      const delta = max - min;
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

      switch (max) {
        case rNormalized:
          h =
            (gNormalized - bNormalized) / delta +
            (gNormalized < bNormalized ? 6 : 0);
          break;
        case gNormalized:
          h = (bNormalized - rNormalized) / delta + 2;
          break;
        case bNormalized:
          h = (rNormalized - gNormalized) / delta + 4;
          break;
      }

      h /= 6;
    }

    // Convert h, s, l to percentage values
    h = Math.round(h * 360);
    s = Math.round(s * 100);

    const lPercentage = Math.round(l * 100);

    return `(${h}, ${s}%, ${lPercentage}%)`;
  }

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel minSize={30}>
        <div className="flex flex-col grow h-screen gap-8 items-center justify-center">
          <h2 className="text-5xl font-semibold text-center">
            Style Guide<p>PDF Generator</p>
          </h2>
          <Dropzone
            accept={{
              "image/png": [".png"],
              "image/jpeg": [".jpg", ".jpeg"],
              "image/svg+xml": [".svg"],
            }}
            maxSize={maxSize}
            multiple={false}
            onDrop={handleDrop}
          >
            {({ getRootProps, getInputProps, isDragActive }) => (
              <div
                {...getRootProps()}
                className={cn(
                  "group relative flex items-center justify-center h-72 w-96 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25 overflow-hidden",
                  "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isDragActive && "border-muted-foreground"
                )}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="rounded-full border border-dashed p-3">
                      <UploadIcon
                        className="size-7 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="font-medium text-muted-foreground">
                      Drop your file here
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4">
                    {!file ? (
                      <>
                        <div className="rounded-full border border-dashed p-3">
                          <UploadIcon
                            className="size-7 text-muted-foreground"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="flex flex-col gap-px">
                          <p className="font-medium text-sm text-muted-foreground">
                            Drag & drop your logo here, or click to select it.
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="relative flex items-center justify-center h-72 w-96 overflow-hidden">
                        <Image
                          src={file.preview}
                          alt="Image Preview"
                          fill
                          className="object-cover rounded-lg"
                        />
                        <div className="group-hover:flex items-center justify-center hidden bg-black/80 h-full w-full z-10">
                          <p className="font-medium text-white">
                            Click to replace
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Dropzone>
          {colors && (
            <div className="flex gap-1">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className="relative flex flex-col items-center justify-end h-24 w-20 rounded-lg cursor-pointer overflow-hidden group py-4 border"
                  style={{
                    backgroundColor: color,
                  }}
                >
                  <p className="text-sm uppercase">
                    {primaryColor === color && (
                      <span style={{ color: getTextColor(color) }}>1</span>
                    )}
                    {secondaryColor === color && (
                      <span style={{ color: getTextColor(color) }}>2</span>
                    )}
                  </p>
                  <p
                    className="text-xs uppercase"
                    style={{ color: getTextColor(color) }}
                  >
                    {color.replace(/^#/, "")}
                  </p>
                  <Button
                    className="rounded-none transition-all ease-in-out opacity-0 group-hover:opacity-100 flex flex-col gap-1 absolute items-center justify-center group-hover:bg-black/80 h-full w-full top-0"
                    onClick={() => handleColorClick(color)}
                    type="button"
                  >
                    {primaryColor === color || secondaryColor === color ? (
                      <>
                        <XIcon className="size-5 text-white" />
                        <p className="text-xs font-medium text-white">Remove</p>
                      </>
                    ) : (
                      <>
                        <CheckIcon className="size-5 text-white" />
                        <p className="text-xs font-medium text-white">Select</p>
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
          <Button
            type="submit"
            disabled={!primaryColor || !secondaryColor}
            onClick={handleSubmit}
          >
            <WandSparklesIcon className="size-4 mr-2" />
            Generate
          </Button>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel minSize={50}>
        {file &&
          colors &&
          colors.length > 0 &&
          primaryColor &&
          secondaryColor && (
            <div className="flex justify-center">
              <ScrollArea className="h-[100vh] py-20 flex justify-center bg-[#f7f6f5] dark:bg-[#141414] w-full">
                <div className="flex flex-col items-center gap-8 w-full pt-8">
                  {/* PAGE 1 */}
                  <div
                    className="flex w-[66rem] h-[51rem] bg-white shadow-lg"
                    id="page1"
                  >
                    <div
                      className="flex w-2/6 justify-center items-center"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Image
                        src={file.preview}
                        alt="Logo"
                        width={250}
                        height={250}
                        className="p-4 brightness-200 grayscale mix-blend-hard-light"
                      />
                    </div>
                    <div className="w-4/6 bg-white flex items-end p-16 h-full">
                      <p className="font-bold text-7xl text-gray-800 w-full">
                        Design <br /> Style Guide
                      </p>
                    </div>
                  </div>
                  {/* PAGE 2 */}
                  <div
                    className="flex gap-8 bg-white w-[66rem] h-[51rem] p-8 shadow-lg"
                    id="page2"
                  >
                    <div
                      className="w-3/6 flex justify-center items-center"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Image
                        src={file.preview}
                        alt="Logo"
                        width={250}
                        height={250}
                        className="p-4 brightness-200 grayscale mix-blend-hard-light"
                      />
                    </div>
                    <div className="w-3/6 bg-white flex flex-col gap-8">
                      <div className="flex items-center justify-center bg-gray-200 w-full h-full">
                        <Image
                          src={file.preview}
                          alt="Logo"
                          width={250}
                          height={250}
                          className="p-4 brightness-0 grayscale mix-blend-hard-light"
                        />
                      </div>
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: secondaryColor }}
                      >
                        <Image
                          src={file.preview}
                          alt="Logo"
                          width={250}
                          height={250}
                          className="p-4 brightness-200 grayscale mix-blend-hard-light"
                        />
                      </div>
                    </div>
                  </div>
                  {/* PAGE 3 */}
                  <div
                    className="flex bg-white w-[66rem] h-[51rem] p-8 py-20 shadow-lg"
                    id="page2"
                  >
                    <div className="w-2/6 flex flex-col gap-6 justify-start items-start">
                      <p className="text-gray-800 text-4xl font-semibold">
                        Colors
                      </p>
                      <div className="flex flex-col text-gray-400">
                        <p>Primary</p>
                        <p>Secondary</p>
                        <p>Shades</p>
                      </div>
                    </div>
                    <div className="w-4/6 bg-white flex flex-col">
                      <div className="flex flex-col h-1/2">
                        <div
                          className="flex items-center justify-center w-full h-28"
                          style={{ backgroundColor: primaryColor }}
                        />
                        <div className="flex items-center justify-center w-full">
                          {shadeLevels.map((shade) => (
                            <div
                              className="flex flex-col text-xs font-medium uppercase items-center justify-center w-full h-16"
                              key={shade}
                              style={{
                                backgroundColor: getShades(primaryColor)[shade],
                                color: getTextColor(
                                  getShades(primaryColor)[shade]
                                ),
                              }}
                            >
                              <p>{shade}</p>
                              <p>
                                {getShades(primaryColor)[shade].replace(
                                  /^#/,
                                  ""
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                        <p className="text-lg font-semibold text-gray-800 pt-4">
                          Primary Color
                        </p>
                        <div className="flex flex-col text-gray-400 text-sm">
                          <p className="uppercase">HEX: {primaryColor}</p>
                          <p className="uppercase">
                            RGB: {hexToRgb(primaryColor)}
                          </p>
                          <p className="uppercase">
                            HSL: {hexToHsl(primaryColor)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col h-1/2">
                        <div
                          className="flex items-center justify-center w-full h-28"
                          style={{ backgroundColor: secondaryColor }}
                        />
                        <div className="flex items-center justify-center w-full">
                          {shadeLevels.map((shade) => (
                            <div
                              className="flex flex-col text-xs font-medium uppercase items-center justify-center w-full h-16"
                              key={shade}
                              style={{
                                backgroundColor:
                                  getShades(secondaryColor)[shade],
                                color: getTextColor(
                                  getShades(secondaryColor)[shade]
                                ),
                              }}
                            >
                              <p>{shade}</p>
                              <p>
                                {getShades(secondaryColor)[shade].replace(
                                  /^#/,
                                  ""
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                        <p className="text-lg font-semibold text-gray-800 pt-4">
                          Secondary Color
                        </p>
                        <div className="flex flex-col text-gray-400 text-sm">
                          <p className="uppercase">{secondaryColor}</p>
                          <p className="uppercase">
                            RGB: {hexToRgb(primaryColor)}
                          </p>
                          <p className="uppercase">
                            HSL: {hexToHsl(primaryColor)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* PAGE 4 */}
                  <div
                    className="flex bg-white w-[66rem] h-[51rem] p-8 py-20 shadow-lg"
                    id="page2"
                  >
                    <div className="w-2/6 flex flex-col gap-6 justify-start items-start">
                      <p className="text-gray-800 text-4xl font-semibold">
                        Typography
                      </p>
                      <div className="flex flex-col text-gray-400">
                        <p>Geist Sans</p>
                        <p>H1 - H6</p>
                        <p>Body</p>
                      </div>
                    </div>
                    <div className="w-4/6 bg-white flex">
                      <div className="flex items-start justify-between flex-col gap-4">
                        <div>
                          <p className="text-2xl text-gray-600 font-medium">
                            H1 - BLACK - 4.5REM
                          </p>
                          <p className="text-7xl text-gray-800 font-black">
                            Lorem Ipsum
                          </p>
                        </div>
                        <div>
                          <p className="text-2xl text-gray-600 font-medium">
                            H2 - EXTRABOLD - 2.25REM
                          </p>
                          <p className="text-5xl text-gray-800 font-extrabold">
                            Lorem Ipsum
                          </p>
                        </div>
                        <div>
                          <p className="text-2xl text-gray-600 font-medium">
                            H3 - BOLD - 1.875REM
                          </p>
                          <p className="text-3xl text-gray-800 font-bold">
                            Lorem Ipsum
                          </p>
                        </div>
                        <div>
                          <p className="text-2xl text-gray-600 font-medium">
                            H4 - SEMIBOLD - 1.25REM
                          </p>
                          <p className="text-xl text-gray-800 font-semibold">
                            Lorem Ipsum
                          </p>
                        </div>
                        <div>
                          <p className="text-2xl text-gray-600 font-medium">
                            H5 - MEDIUM - 1.125REM
                          </p>
                          <p className="text-lg text-gray-800 font-medium">
                            Lorem Ipsum
                          </p>
                        </div>
                        <div>
                          <p className="text-2xl text-gray-600 font-medium">
                            H6 - NORMAL - 1.25REM
                          </p>
                          <p className="text-gray-800">Lorem Ipsum</p>
                        </div>
                        <div>
                          <p className="text-2xl text-gray-600 font-medium">
                            BODY - LIGHT - 1REM
                          </p>
                          <p className="text-gray-800 font-light">
                            Lorem Ipsum
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default Hero;
