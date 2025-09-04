export type ID = string

export type Course = {
  id: ID;
  code: string;          // e.g., "CSE 110"
  name: string;
  description: string;
  units?: number;        // optional for now; we’ll backfill from DB later
}

export type Club = {
  id: ID;
  name: string;
  description: string;
  tags: string[];        // e.g., ["SWE","medium"]
}
