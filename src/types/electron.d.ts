import { DeviceConnection } from "./auth.types";
import { UpdateInfo, DownloadProgress, UpdateStatus } from "./updates";

declare global {
  interface Window {
    electronAPI: {
      // Auth operation
      createAppConnection: (
        data: DeviceConnection,
      ) => Promise<DeviceConnection>;
      getConnection: () => Promise<DeviceConnection>;
      removeConnection: () => Promise<void>;

      // Clients
      createClient: (client: any) => Promise<any>;
      getClients: (
        page?: number,
        pageSize?: number,
        search?: string,
        filters?: any,
      ) => Promise<{
        data: any[];
        total: number;
        page: number;
        pageSize: number;
      }>;

      // Houses
      getHouses: (
        page?: number,
        pageSize?: number,
        search?: string,
        filters?: any,
      ) => Promise<{
        data: any[];
        total: number;
        page: number;
        pageSize: number;
      }>;

      // Products
      getProducts: (
        page?: number,
        pageSize?: number,
        search?: string,
        filters?: any,
      ) => Promise<{
        data: any[];
        total: number;
        page: number;
        pageSize: number;
      }>;

      // Balances
      getBalances: (
        page?: number,
        pageSize?: number,
        search?: string,
        filters?: {
          dateFrom?: string;
          dateTo?: string;
          balance_status?: string;
          amount?: { op: string; value: number };
          amount_bc?: { op: string; value: number };
          total_payed?: { op: string; value: number };
          total_payed_bc?: { op: string; value: number };
          sortBy?: string;
        },
      ) => Promise<{
        data: any[];
        total: number;
        page: number;
        pageSize: number;
      }>;

      // Sales
      getSales: (
        page?: number,
        pageSize?: number,
        search?: string,
        filters?: {
          dateFrom?: string;
          dateTo?: string;
          payment_currency?: string;
          client_id?: string;
          house_id?: string;
          [key: string]: any;
        },
      ) => Promise<{
        data: any[];
        total: number;
        page: number;
        pageSize: number;
      }>;

      getSaleDetails: (saleId: string) => Promise<{
        sale_details: any;
        products: any[];
        balances: any[];
      } | null>;

      getSpendings: (
        page?: number,
        pageSize?: number,
        search?: string,
        filters?: {
          dateFrom?: string;
          dateTo?: string;
          status?: string;
          amount?: { op: string; value: number };
          spending_category_id?: string;
          sortBy?: string;
        },
      ) => Promise<{
        data: any[];
        total: number;
        page: number;
        pageSize: number;
      }>;

      getDeposits: (
        page?: number,
        pageSize?: number,
        search?: string,
        filters?: {
          dateFrom?: string;
          dateTo?: string;
          decision?: string;
          amount?: { op: string; value: number };
          sortBy?: string;
        },
      ) => Promise<{
        data: any[];
        total: number;
        page: number;
        pageSize: number;
      }>;

      getCategories: () => Promise<any[]>;
      getSpendingCategories: () => Promise<any[]>;

      // Window operations
      minimize: () => void;
      maximize: () => void;
      close: () => void;

      // Update operations
      checkForUpdates: () => Promise<void>;
      downloadUpdate: () => Promise<void>;
      installUpdate: () => Promise<void>;
      onUpdateStatus: (
        callback: (
          status: UpdateStatus,
          data?: UpdateInfo | DownloadProgress | string,
        ) => void,
      ) => void;
    };

    // Sync
    syncAPI: {
      start(): Promise<{ ok: boolean }>;
      cancel(): Promise<{ ok: boolean }>;
      onStatus(cb: (status: any) => void): () => void;
    };

    electron: {
      on: (channel: string, callback: (data: any) => void) => void;
      off?: (channel: string, callback: (data: any) => void) => void;
      send?: (channel: string, data?: any) => void;
    };
  }
}
