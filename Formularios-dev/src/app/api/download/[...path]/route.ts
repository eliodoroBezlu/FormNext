// app/api/download/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Sesión expirada. Por favor recarga la página." },
      { status: 401 }
    );
  }

  const backendPath = params.path.join("/");
  const url = `${API_BASE_URL}/${backendPath}`;

  console.log("📥 [DOWNLOAD PROXY] →", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      cache: "no-store",
    });

    if (response.status === 401) {
      return NextResponse.json(
        { error: "Sesión expirada en backend." },
        { status: 401 }
      );
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return NextResponse.json(
        { error: `Error ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const blob = await response.blob();
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const contentDisposition =
      response.headers.get("content-disposition") || "";

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
      },
    });
  } catch (error) {
    console.error("💥 [DOWNLOAD PROXY] Error:", error);
    return NextResponse.json(
      { error: "Error interno al procesar la descarga." },
      { status: 500 }
    );
  }
}