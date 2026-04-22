## Context

The Tekuá platform currently allows members to submit and validate contributions, but lacks a comprehensive way to analyze this data. This change introduces a reporting dashboard for members to filter, visualize, and export contribution results.

## Goals / Non-Goals

**Goals:**
- Provide a robust filtering interface for contributions.
- Enable data visualization via bar and pie charts.
- Allow users to export filtered data to CSV.
- Ensure only logged-in members can access the reports.
- Maintain a responsive and premium UI/UX consistent with the platform's design.

**Non-Goals:**
- Real-time data streaming (standard polling or manual refresh is sufficient).
- Advanced multi-dimensional pivot tables.
- Public access for non-logged-in users.

## Decisions

### 1. Visualization Library: Recharts
- **Decision**: Use `recharts` for all charts.
- **Rationale**: Recharts is built specifically for React, offers great responsiveness, and integrates smoothly with Material UI's styling system. It is easier to theme than Chart.js or D3 for standard reporting needs.
- **Alternatives**: Chart.js (harder to style in React), D3.js (overkill for these requirements).

### 2. CSV Export: Client-Side Utility
- **Decision**: Implement a client-side utility to convert the current state of filtered data into a CSV string and trigger a download.
- **Rationale**: The amount of contribution data is expected to be manageable for client-side processing, avoiding unnecessary server-side complexity or Edge Function overhead.
- **Alternatives**: Server-side CSV generation (too complex for this scale), `papaparse` (useful but a simple helper is often enough for basic CSVs).

### 3. State Management: URL-Driven Filters
- **Decision**: Store filter parameters in the URL query string using `react-router-dom`'s `useSearchParams`.
- **Rationale**: This enables "linkability" and persistence (refreshing the page keeps the filters). It also simplifies the logic for sharing specific report views between members.
- **Alternatives**: Local component state (filters lost on refresh), Redux/Zustand (overkill for simple UI filters).

### 4. Data Fetching: Supabase with `.filter()`
- **Decision**: Use the Supabase client directly in the dashboard component with dynamic `.filter()` or `.match()` calls based on the active filters.
- **Rationale**: Leverages Supabase's built-in filtering capabilities, reducing the amount of data transferred to the client.

## Risks / Trade-offs

- **[Risk]** Large datasets could slow down client-side rendering or CSV generation. → **[Mitigation]** Implement pagination or a limit on the initial query, and advise users to use filters to narrow down results.
- **[Risk]** Complex chart interactions might feel sluggish on mobile. → **[Mitigation]** Use simplified chart versions or hide certain visualizations on small screens.
- **[Risk]** Data security: sensitive user data might be exposed in reports. → **[Mitigation]** Ensure RLS (Row Level Security) policies are strictly applied to the `contributions` and `profiles` tables.

## Migration Plan

- No database migrations are required as we are building on top of existing tables.
- Deployment involves:
  1. Installing `recharts`.
  2. Deploying new frontend routes and components.
  3. Verifying RLS policies allow authenticated members to read the necessary columns.
