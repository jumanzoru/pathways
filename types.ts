export type ID = string

// types.ts (optional)
export type Course = {
  id: string
  code: string
  name: string
  description: string
  units?: number
}


export type Club = {
  id: ID;
  name: string;
  description: string;
  tags: string[];        // e.g., ["SWE","medium"]
}
