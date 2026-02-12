import z from "zod";

export const UnsplashPhotoSchema = z.object({
  id: z.string(),
  urls: z.object({
    full: z.string().url().optional(),
    regular: z.string().url().optional(),
  }),
  links: z.object({
    html: z.string().optional(),
  }),

  user: z.object({
    name: z.string().optional(),
    username: z.string().optional(),
  }),
});

const UnsplashSearchResponseSchema = z.object({
  results: z.array(UnsplashPhotoSchema),
});

export type UnsplashPhoto = z.infer<typeof UnsplashPhotoSchema>;
export type UnsplashSearchResponse = z.infer<
  typeof UnsplashSearchResponseSchema
>;
export type UnsplashAttributions = {
  photographerName?: string | null;
  photographerUsername?: string | null;
  photoLink?: string | null;
  attributionUrl?: string | null;
};

export type UnsplashToolResult = {
  publicPath: string;
  localFilePath: string;
  attributions: UnsplashAttributions;
};

export async function searchUnsplashPhoto(
  accessKey: string,
  query: string,
  orientation?: "landscape" | "portrait" | "squarish" | null,
): Promise<UnsplashSearchResponse> {
  const params = new URLSearchParams({
    query,
    per_page: "1",
    content_filter: "high",
  });

  if (orientation) {
    params.append("orientation", orientation);
  }

  const response = await fetch(
    `https://api.unsplash.com/search/photos?${params.toString()}`,
    {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Unsplash API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();

  return UnsplashSearchResponseSchema.parse(data);
}
