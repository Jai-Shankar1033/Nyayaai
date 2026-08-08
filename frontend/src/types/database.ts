export type UserRole = "citizen" | "lawyer" | "admin"
export type CaseStatus = "open" | "closed" | "pending" | "hearing"
export type EmbeddingStatus = "pending" | "processing" | "done" | "failed"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: UserRole
          language: string
          avatar_url: string | null
          bar_council_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>
      }
      cases: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          court: string | null
          case_number: string | null
          status: CaseStatus
          ipc_sections: string[]
          summary: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["cases"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["cases"]["Insert"]>
      }
      documents: {
        Row: {
          id: string
          case_id: string | null
          user_id: string
          file_name: string
          file_url: string
          file_size: number
          mime_type: string
          ocr_text: string | null
          summary: string | null
          embedding_status: EmbeddingStatus
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["documents"]["Row"], "id" | "created_at">
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          title: string | null
          language: string
          messages: ChatMessage[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["chat_sessions"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["chat_sessions"]["Insert"]>
      }
      judgments: {
        Row: {
          id: string
          case_name: string
          court: string
          year: number
          citation: string | null
          full_text: string | null
          summary: string | null
          ipc_sections: string[]
          keywords: string[]
          embedding_status: EmbeddingStatus
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["judgments"]["Row"], "id" | "created_at">
        Update: Partial<Database["public"]["Tables"]["judgments"]["Insert"]>
      }
      legal_sections: {
        Row: {
          id: string
          act: string
          section_number: string
          title: string
          description: string
          punishment: string | null
          bailable: boolean | null
          cognizable: boolean | null
          embedding_status: EmbeddingStatus
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["legal_sections"]["Row"], "id" | "created_at">
        Update: Partial<Database["public"]["Tables"]["legal_sections"]["Insert"]>
      }
      contracts: {
        Row: {
          id: string
          user_id: string
          document_id: string | null
          title: string
          party_a: string | null
          party_b: string | null
          risk_score: number | null
          risky_clauses: RiskyClause[]
          summary: string | null
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["contracts"]["Row"], "id" | "created_at">
        Update: Partial<Database["public"]["Tables"]["contracts"]["Insert"]>
      }
      citations: {
        Row: {
          id: string
          from_judgment_id: string
          to_judgment_id: string
          citation_type: "overruled" | "followed" | "distinguished" | "referred"
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["citations"]["Row"], "id" | "created_at">
        Update: Partial<Database["public"]["Tables"]["citations"]["Insert"]>
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      user_role: UserRole
      case_status: CaseStatus
      embedding_status: EmbeddingStatus
    }
  }
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  language: string
  citations?: string[]
  timestamp: string
}

export interface RiskyClause {
  clause_text: string
  risk_level: "low" | "medium" | "high"
  explanation: string
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
