import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";
import { env } from "@/config/env";

export type RouteHandler = (request: Request, context?: unknown) => Promise<Response>;

export function withAuth(handler: RouteHandler): RouteHandler {
  return async (request: Request, context?: unknown) => {
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey || apiKey !== env.API_SECRET_KEY) {
      throw new AppError("Unauthorized", "UNAUTHORIZED", 401);
    }

    return await handler(request, context);
  };
}

export function withErrorHandler(handler: RouteHandler) {
  return async (request: Request, context?: unknown) => {
    try {
      return await handler(request, context);
    } catch (error: unknown) {
      if (error instanceof AppError && error.details) {
          console.error("❌ AppError Details:", error.details);
      }
      console.error("❌ API Error:", error);

      if (error instanceof ZodError) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Validation failed", 
            details: error.format() 
          }, 
          { status: 400 }
        );
      }

      if (error instanceof AppError) {
        return NextResponse.json(error.toJSON(), { status: error.statusCode });
      }

      // Handle SyntaxError for JSON parsing
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
          return NextResponse.json(
              { success: false, error: "Invalid JSON payload" },
              { status: 400 }
          );
      }

      const message = error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json(
        { success: false, error: message }, 
        { status: 500 }
      );
    }
  };
}
