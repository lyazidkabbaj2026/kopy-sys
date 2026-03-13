import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";

export type RouteHandler = (request: Request, context?: any) => Promise<Response>;

export function withErrorHandler(handler: RouteHandler) {
  return async (request: Request, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error: unknown) {
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
