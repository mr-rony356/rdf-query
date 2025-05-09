import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Get user session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // If no session, return a limited demo response for guest users
    return NextResponse.json({ 
      message: 'Demo data for guest users', 
      data: {
        query: 'SELECT ?person WHERE { ?person a <http://example.org/Person> } LIMIT 5',
        results: {
          head: { vars: [ "person" ] },
          results: { bindings: [
            { "person": { "type": "uri", "value": "http://example.org/person1" } },
            { "person": { "type": "uri", "value": "http://example.org/person2" } },
            { "person": { "type": "uri", "value": "http://example.org/person3" } }
          ]}
        }
      }
    });
  }

  // Get the user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query') || '';

  // In a real app, you'd execute the SPARQL query against an RDF store
  // For demo purposes, we'll return mock data based on user role
  
  const mockResults = {
    head: { vars: [ "subject", "predicate", "object" ] },
    results: { bindings: [
      {
        "subject": { "type": "uri", "value": "http://example.org/resource1" },
        "predicate": { "type": "uri", "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
        "object": { "type": "uri", "value": "http://example.org/Type" }
      },
      {
        "subject": { "type": "uri", "value": "http://example.org/resource1" },
        "predicate": { "type": "uri", "value": "http://example.org/property" },
        "object": { "type": "literal", "value": "Property Value" }
      },
      {
        "subject": { "type": "uri", "value": "http://example.org/resource2" },
        "predicate": { "type": "uri", "value": "http://example.org/relatedTo" },
        "object": { "type": "uri", "value": "http://example.org/resource1" }
      }
    ]}
  };

  // Record this query in history if user is authenticated
  if (profile && (profile.role === 'user' || profile.role === 'admin')) {
    await supabase
      .from('query_history')
      .insert({
        user_id: session.user.id,
        query_content: { sparql: query },
        results: mockResults,
        execution_time: 123, // Simulated execution time in ms
        status: 'completed'
      });
  }

  return NextResponse.json({ 
    message: 'Query executed successfully',
    query,
    results: mockResults
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
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Get user session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { query, saveQuery, title, description } = body;

    // Execute query (mock implementation)
    const results = {
      head: { vars: [ "subject", "predicate", "object" ] },
      results: { bindings: [
        {
          "subject": { "type": "uri", "value": "http://example.org/resource1" },
          "predicate": { "type": "uri", "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
          "object": { "type": "uri", "value": "http://example.org/Type" }
        },
        {
          "subject": { "type": "uri", "value": "http://example.org/resource1" },
          "predicate": { "type": "uri", "value": "http://example.org/property" },
          "object": { "type": "literal", "value": "Property Value" }
        }
      ]}
    };

    // Save to query history
    await supabase
      .from('query_history')
      .insert({
        user_id: session.user.id,
        query_content: { sparql: query },
        results,
        execution_time: 135, // Simulated execution time
        status: 'completed'
      });

    // Save query if requested
    if (saveQuery && title) {
      await supabase
        .from('saved_queries')
        .insert({
          user_id: session.user.id,
          title,
          description: description || null,
          query_content: { sparql: query },
          is_public: false
        });
    }

    return NextResponse.json({ 
      message: 'Query executed successfully',
      results
    });
  } catch (error) {
    console.error('Error executing query:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to execute query' }),
      { status: 500 }
    );
  }
}