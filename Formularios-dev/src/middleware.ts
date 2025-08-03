// middleware.ts
import { NextResponse } from "next/server";

export default function middleware() {
  // No hacer nada, solo continuar
  return NextResponse.next();
}

// Sin matcher, el middleware no se ejecutará
export const config = {
  matcher: []
};