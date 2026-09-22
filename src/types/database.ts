export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          school_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          school_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          detail: string | null
          id: string
          incurred_at: string
          method: string | null
          organization_id: string
          school_id: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          detail?: string | null
          id?: string
          incurred_at?: string
          method?: string | null
          organization_id: string
          school_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          detail?: string | null
          id?: string
          incurred_at?: string
          method?: string | null
          organization_id?: string
          school_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      fx_rates: {
        Row: { avg: number | null; buy: number | null; rate_date: string; sell: number | null }
        Insert: { avg?: number | null; buy?: number | null; rate_date: string; sell?: number | null }
        Update: { avg?: number | null; buy?: number | null; rate_date?: string; sell?: number | null }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          created_at: string
          id: string
          occurred_at: string
          qty: number
          ref_id: string | null
          ref_table: string | null
          supplier_id: string | null
          type: Database["public"]["Enums"]["movement_type"]
          unit_cost: number | null
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          occurred_at?: string
          qty: number
          ref_id?: string | null
          ref_table?: string | null
          supplier_id?: string | null
          type: Database["public"]["Enums"]["movement_type"]
          unit_cost?: number | null
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          occurred_at?: string
          qty?: number
          ref_id?: string | null
          ref_table?: string | null
          supplier_id?: string | null
          type?: Database["public"]["Enums"]["movement_type"]
          unit_cost?: number | null
          variant_id?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["membership_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["membership_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["membership_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          ownership: Database["public"]["Enums"]["stock_ownership"]
          price_list_id: string | null
          qty: number
          supplier_id: string | null
          unit_cost_snapshot: number
          unit_price_snapshot: number
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          ownership?: Database["public"]["Enums"]["stock_ownership"]
          price_list_id?: string | null
          qty: number
          supplier_id?: string | null
          unit_cost_snapshot: number
          unit_price_snapshot: number
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          ownership?: Database["public"]["Enums"]["stock_ownership"]
          price_list_id?: string | null
          qty?: number
          supplier_id?: string | null
          unit_cost_snapshot?: number
          unit_price_snapshot?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string | null
          discount: number
          id: string
          notes: string | null
          order_date: string
          order_number: number | null
          payment_status: Database["public"]["Enums"]["order_payment_status"]
          school_id: string
          shipping_charge: number
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
          usd_rate: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          discount?: number
          id?: string
          notes?: string | null
          order_date?: string
          order_number?: number | null
          payment_status?: Database["public"]["Enums"]["order_payment_status"]
          school_id: string
          shipping_charge?: number
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          usd_rate?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          discount?: number
          id?: string
          notes?: string | null
          order_date?: string
          order_number?: number | null
          payment_status?: Database["public"]["Enums"]["order_payment_status"]
          school_id?: string
          shipping_charge?: number
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          usd_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: { created_at: string; id: string; name: string; slug: string }
        Insert: { created_at?: string; id?: string; name: string; slug: string }
        Update: { created_at?: string; id?: string; name?: string; slug?: string }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string | null
          notes: string | null
          order_id: string
          paid_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method?: string | null
          notes?: string | null
          order_id: string
          paid_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string | null
          notes?: string | null
          order_id?: string
          paid_at?: string
        }
        Relationships: []
      }
      price_list_items: {
        Row: { cost: number; id: string; price: number; price_list_id: string; variant_id: string }
        Insert: { cost: number; id?: string; price: number; price_list_id: string; variant_id: string }
        Update: { cost?: number; id?: string; price?: number; price_list_id?: string; variant_id?: string }
        Relationships: [
          {
            foreignKeyName: "price_list_items_price_list_id_fkey"
            columns: ["price_list_id"]
            isOneToOne: false
            referencedRelation: "price_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_list_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      price_lists: {
        Row: {
          created_at: string
          created_by: string | null
          effective_date: string
          id: string
          note: string | null
          school_id: string
          status: Database["public"]["Enums"]["price_list_status"]
          version_code: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          effective_date: string
          id?: string
          note?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["price_list_status"]
          version_code: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          effective_date?: string
          id?: string
          note?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["price_list_status"]
          version_code?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: { active: boolean; created_at: string; id: string; product_id: string; size_id: string; sku: string | null }
        Insert: { active?: boolean; created_at?: string; id?: string; product_id: string; size_id: string; sku?: string | null }
        Update: { active?: boolean; created_at?: string; id?: string; product_id?: string; size_id?: string; sku?: string | null }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          category: string | null
          created_at: string
          description: string | null
          gender: string | null
          id: string
          name: string
          photo_url: string | null
          school_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          gender?: string | null
          id?: string
          name: string
          photo_url?: string | null
          school_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          gender?: string | null
          id?: string
          name?: string
          photo_url?: string | null
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: { created_at: string; full_name: string | null; id: string; phone: string | null }
        Insert: { created_at?: string; full_name?: string | null; id: string; phone?: string | null }
        Update: { created_at?: string; full_name?: string | null; id?: string; phone?: string | null }
        Relationships: []
      }
      schools: {
        Row: { active: boolean; created_at: string; id: string; name: string; organization_id: string; slug: string }
        Insert: { active?: boolean; created_at?: string; id?: string; name: string; organization_id: string; slug: string }
        Update: { active?: boolean; created_at?: string; id?: string; name?: string; organization_id?: string; slug?: string }
        Relationships: [
          {
            foreignKeyName: "schools_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sizes: {
        Row: { code: string; created_at: string; id: string; label: string | null; school_id: string; sort_order: number }
        Insert: { code: string; created_at?: string; id?: string; label?: string | null; school_id: string; sort_order?: number }
        Update: { code?: string; created_at?: string; id?: string; label?: string | null; school_id?: string; sort_order?: number }
        Relationships: [
          {
            foreignKeyName: "sizes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_receipts: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          ownership: Database["public"]["Enums"]["stock_ownership"]
          price_list_id: string | null
          qty: number
          received_at: string
          supplier_id: string | null
          unit_cost: number
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          ownership?: Database["public"]["Enums"]["stock_ownership"]
          price_list_id?: string | null
          qty: number
          received_at?: string
          supplier_id?: string | null
          unit_cost: number
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          ownership?: Database["public"]["Enums"]["stock_ownership"]
          price_list_id?: string | null
          qty?: number
          received_at?: string
          supplier_id?: string | null
          unit_cost?: number
          variant_id?: string
        }
        Relationships: []
      }
      supplier_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["supplier_payment_kind"]
          notes: string | null
          paid_at: string
          supplier_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["supplier_payment_kind"]
          notes?: string | null
          paid_at?: string
          supplier_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["supplier_payment_kind"]
          notes?: string | null
          paid_at?: string
          supplier_id?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: { contact: string | null; created_at: string; id: string; name: string; notes: string | null; organization_id: string }
        Insert: { contact?: string | null; created_at?: string; id?: string; name: string; notes?: string | null; organization_id: string }
        Update: { contact?: string | null; created_at?: string; id?: string; name?: string; notes?: string | null; organization_id?: string }
        Relationships: [
          {
            foreignKeyName: "suppliers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_order_balance: {
        Row: {
          order_id: string | null
          pagado: number | null
          saldo: number | null
          school_id: string | null
          total: number | null
        }
        Relationships: []
      }
      v_stock_actual: {
        Row: { stock_actual: number | null; supplier_id: string | null; variant_id: string | null }
        Relationships: []
      }
      v_supplier_balances: {
        Row: {
          debe_consignacion: number | null
          name: string | null
          organization_id: string | null
          pagado: number | null
          saldo: number | null
          supplier_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      make_sku: { Args: { p_name: string; p_size: string }; Returns: string }
      user_org_ids: { Args: Record<string, never>; Returns: string[] }
      user_school_ids: { Args: Record<string, never>; Returns: string[] }
    }
    Enums: {
      membership_role: "owner" | "admin" | "vendedor"
      movement_type: "ingreso" | "venta" | "devolucion" | "ajuste"
      order_payment_status: "impago" | "parcial" | "pagado"
      order_status: "pendiente" | "armado" | "entregado" | "devuelto"
      price_list_status: "draft" | "active"
      stock_ownership: "propio" | "consignacion"
      supplier_payment_kind: "a_cuenta" | "liquidacion"
    }
    CompositeTypes: Record<string, never>
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"]
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T]
