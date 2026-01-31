import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "SSAFY Quest",
        short_name: "SSAFY Quest",
        description: "SSAFY Quest Application",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
            {
                src: "/assets/app_icon.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/assets/app_icon.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    };
}
