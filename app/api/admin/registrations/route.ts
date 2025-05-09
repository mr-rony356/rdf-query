export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  // Create supabase server client
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: "Authentication required" }),
      { status: 401 }
    );
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized. Admin access required." }),
      { status: 403 }
    );
  }

  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status") || "pending";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  // Get registration requests with pagination
  let query = supabase
    .from("registration_requests")
    .select("*, profiles!registration_requests_user_id_fkey(*)", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const {
    data: requests,
    error,
    count,
  } = await query.range(offset, offset + limit - 1);

  if (error) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch registration requests" }),
      { status: 500 }
    );
  }

  return NextResponse.json({
    requests,
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil((count || 0) / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  // Create supabase server client
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: "Authentication required" }),
      { status: 401 }
    );
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized. Admin access required." }),
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { requestId, approved } = body;

    if (!requestId || approved === undefined) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Execute approve_registration function
    const { error } = await supabase.rpc("approve_registration", {
      request_id: requestId,
      approved,
      admin_id: session.user.id,
    });

    if (error) {
      return new NextResponse(
        JSON.stringify({ error: "Failed to process registration request" }),
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: approved
        ? "Registration request approved"
        : "Registration request rejected",
    });
  } catch (error) {
    console.error("Error processing registration request:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to process request" }),
      { status: 500 }
    );
  }
}
